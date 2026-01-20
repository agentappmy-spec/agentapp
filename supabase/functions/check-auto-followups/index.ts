import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
    try {
        const supabase = createClient(
            SUPABASE_URL ?? '',
            SUPABASE_SERVICE_ROLE_KEY ?? ''
        )

        // 1. Fetch System Workflows
        const { data: steps, error: rulesError } = await supabase
            .from('workflow_steps')
            .select('*')
            .eq('is_active', true)

        if (rulesError) throw rulesError

        // Parse optional body for specific target
        let contact_id = null;
        try {
            const body = await req.json();
            contact_id = body.contact_id;
        } catch (e) {
            // Body is likely empty or not JSON, ignore
        }

        // 2. Fetch Active Contacts (Raw)
        let query = supabase
            .from('contacts')
            .select('*')
            .neq('status', 'Lapsed')

        if (contact_id) {
            console.log(`🚀 Triggered for specific contact: ${contact_id}`);
            query = query.eq('id', contact_id);
        }

        const { data: contacts, error: contactsError } = await query

        if (contactsError) throw contactsError

        if (!contacts || contacts.length === 0) {
            return new Response(
                JSON.stringify({ success: true, processed: 0, message: "No active contacts found" }),
                { headers: { "Content-Type": "application/json" } }
            )
        }

        // 3. Fetch Agents (Profiles)
        const userIds = [...new Set(contacts.map(c => c.user_id).filter(Boolean))];
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select(`
                id,
                email,
                role,
                full_name,
                phone,
                title,
                agency_name,
                license_no,
                bio
            `)
            .in('id', userIds);

        if (profilesError) throw profilesError

        // 4. Fetch Plans (Active for these agents)
        // We handle plans separately to avoid foreign key issues
        const { data: plans, error: plansError } = await supabase
            .from('plans')
            .select('*')
            .in('owner_id', userIds)

        const planMap = new Map();
        if (plans) {
            plans.forEach(p => planMap.set(p.owner_id, p));
        }

        // Map for easy lookup
        const profileMap = new Map(profiles.map(p => {
            // Fallback to 300 if no plan found
            const plan = planMap.get(p.id) || { monthly_message_limit: 300 };
            return [p.id, { ...p, plans: plan }]
        }));


        const results = []
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

        // Group contacts by Agent to batch quota checks (Mental Check: For MVP, per-contact check is safer to code quickly)
        // Optimization: Let's fetch ALL usage for ALL relevant agents in one query if possible.
        // But for simplicity/robustness now, we'll do:
        // A. Get unique Agent IDs from candidates
        const agentIds = [...new Set(contacts.map(c => c.user_id).filter(Boolean))];

        // B. Fetch usage counts for these agents for THIS MONTH
        // We can't easily do "group by" in standard Supabase client without raw SQL or RPC.
        // Fallback: We'll fetch the usage count per agent INSIDE the loop or pre-fetch if list is small.
        // Or simpler: We just proceed and check one by one? 
        // Better: Let's use a specialized query if we can, but otherwise, standard `count` per agent is okay for low volume.
        // Let's implement a "Usage Cache" object to minimize DB hits.
        const usageCache = {}; // { agentId: count }

        for (const agentId of agentIds) {
            const { count, error } = await supabase
                .from('message_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', agentId)
                .gte('created_at', firstDayOfMonth)

            if (!error) {
                usageCache[agentId] = count || 0;
            }
        }

        // 3. Iterate and Match
        for (const contact of contacts) {
            // if (!contact.profiles) continue // Removed: We fetch profiles separately now

            const agent = profileMap.get(contact.user_id);
            if (!agent) {
                // Debug if agent missing
                results.push({ contact: contact.name, status: 'error_no_agent_profile', agent_id: contact.user_id });
                continue
            }

            const agentId = agent.id;
            const limit = agent.plans?.monthly_message_limit || 0;
            const currentUsage = usageCache[agentId] || 0;

            const joinedAt = new Date(contact.joined_at || contact.created_at)
            const diffTime = Math.abs(today.getTime() - joinedAt.getTime())
            const daysSinceJoined = Math.floor(diffTime / (1000 * 60 * 60 * 24))

            // Determine Template Type
            const templateType = contact.role === 'Client' ? 'client' : 'prospect'

            // Filter steps relevant to this agent (Global + Personal)
            const relevantSteps = steps.filter(s => s.user_id === null || s.user_id === agentId);

            // Separate into Personal and Global for conflict resolution
            const personalSteps = relevantSteps.filter(s => s.user_id === agentId);
            const globalSteps = relevantSteps.filter(s => s.user_id === null);

            const isMatch = (step: any) => {
                // A. Day Based Triggers
                if (step.template_id === templateType && step.day !== null) {
                    return step.day === daysSinceJoined
                }
                // B. Date Based Triggers (Global)
                if (step.template_id === 'global' && step.date) {
                    if (step.date === 'auto') return false
                    return step.date === todayStr
                }
                // C. Special Triggers (Monthly Renewal)
                if (step.trigger_name === 'Monthly Renewal') {
                    // Skip if this is Day 0 (instant trigger scenario)
                    if (daysSinceJoined === 0) return false;

                    // Check if today matches the "Day of Month" of joined_at
                    const joinDay = joinedAt.getDate(); // 1-31
                    const currentDay = today.getDate(); // 1-31
                    // Logic: Send only if day matches AND at least 30 days have passed
                    // Edge case: If joined on 31st and today is 30th (Nov), we might skip. 
                    // For MVP simplicity: Exact Match Only
                    return joinDay === currentDay && daysSinceJoined >= 30;
                }
                return false
            }

            // Find matching steps (Prioritizing Personal)
            const matches: any[] = [];

            // 1. Check matches in Personal Steps
            personalSteps.forEach(step => {
                if (isMatch(step)) matches.push(step);
            });

            // 2. Check matches in Global Steps (only if NOT overridden)
            globalSteps.forEach(step => {
                if (isMatch(step)) {
                    // Check if overridden by ANY personal step for the same slot
                    const isOverridden = personalSteps.some(p =>
                        p.template_id === step.template_id &&
                        (
                            (p.day !== null && p.day === step.day) || // Same Day
                            (p.template_id === 'global' && p.trigger_name === step.trigger_name) // Same Event
                        )
                    );

                    if (!isOverridden) {
                        matches.push(step);
                    }
                }
            });

            for (const step of matches) {
                // Skip if already sent (Idempotency)
                if (contact.last_followup_day >= step.day && step.template_id !== 'global') continue

                // CRITICAL: Quota Check
                // Super Admins bypass limits
                if (agent.role !== 'super_admin' && currentUsage >= limit) {
                    console.warn(`Quota Exceeded for Agent ${agent.email}. Limit: ${limit}, Used: ${currentUsage}`);
                    results.push({ contact: contact.name, status: 'skipped_quota', agent: agent.email });
                    continue;
                }

                // Rate Limit Protection: Wait 500ms between sends
                await new Promise(resolve => setTimeout(resolve, 500));

                // Prepare Email
                const subject = step.subject || step.trigger_name || `Follow Up - Day ${step.day}`
                let content = step.content_email || step.content_sms || ''
                content = content
                    .replace(/{name}/g, contact.name || '')
                    .replace(/{title}/g, contact.title || '')
                    .replace(/{phone}/g, contact.phone || '')
                    // Agent Details
                    .replace(/{agent_name}/g, agent.full_name || agent.email || 'Your Agent')
                    .replace(/{agent_phone}/g, agent.phone || '')
                    .replace(/{phone}/g, agent.phone || '')
                    .replace(/{agency}/g, agent.agency_name || '')
                    .replace(/{license}/g, agent.license_no || '')
                    .replace(/{bio}/g, agent.bio || '');

                // Send via Resend with Retry Logic
                const maxRetries = 3;
                let emailSent = false;
                let lastError = '';

                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        const emailRes = await fetch('https://api.resend.com/emails', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${RESEND_API_KEY}`,
                            },
                            body: JSON.stringify({
                                from: 'AgentApp <system@mail.agentapp.my>',
                                to: contact.email,
                                reply_to: agent.email,
                                subject: subject,
                                html: `<p style="white-space: pre-wrap;">${content.replace(/\n/g, '<br/>')}</p>`,
                            }),
                        });

                        if (emailRes.ok) {
                            emailSent = true;
                            break; // Success, exit retry loop
                        } else {
                            lastError = await emailRes.text();

                            // Don't retry on 4xx errors (client errors like invalid email)
                            if (emailRes.status >= 400 && emailRes.status < 500) {
                                console.error(`Client error for ${contact.email}, not retrying:`, lastError);
                                break;
                            }

                            // Retry on 5xx errors (server errors)
                            if (attempt < maxRetries) {
                                const backoffMs = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
                                console.warn(`Retry ${attempt}/${maxRetries} for ${contact.email} after ${backoffMs}ms`);
                                await new Promise(resolve => setTimeout(resolve, backoffMs));
                            }
                        }
                    } catch (fetchError: any) {
                        lastError = fetchError.message || 'Network error';
                        if (attempt < maxRetries) {
                            const backoffMs = Math.pow(2, attempt) * 1000;
                            console.warn(`Network error, retry ${attempt}/${maxRetries} after ${backoffMs}ms`);
                            await new Promise(resolve => setTimeout(resolve, backoffMs));
                        }
                    }
                }

                if (emailSent) {
                    // Log Success
                    await supabase.from('message_logs').insert({
                        user_id: agent.id,
                        type: 'email',
                        recipient: contact.email,
                        content_snippet: subject
                    })

                    // Increment Cache so next one in loop knows
                    usageCache[agentId]++;

                    // Update Contact State
                    if (step.template_id !== 'global') {
                        await supabase.from('contacts')
                            .update({ last_followup_day: step.day })
                            .eq('id', contact.id)
                    }

                    results.push({ contact: contact.name, step: step.day, status: 'sent' })
                } else {
                    console.error('Failed to send after retries for', contact.email, lastError)
                    results.push({ contact: contact.name, status: 'error', error: lastError })
                }
            }
        }

        return new Response(
            JSON.stringify({ success: true, processed: results.length, details: results }),
            { headers: { "Content-Type": "application/json" } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        )
    }
})
