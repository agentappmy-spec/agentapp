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

        // 2. Fetch Active Contacts with their Agent's details
        // We need to know who the agent is to check THEIR quota
        const { data: contacts, error: contactsError } = await supabase
            .from('contacts')
            .select(`
        *,
        profiles:user_id (
          id,
          email,
          role,
          plans (monthly_message_limit)
        )
      `)
            .neq('status', 'Lapsed')

        if (contactsError) throw contactsError

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
            if (!contact.profiles) continue // Orphaned contact?

            const agent = contact.profiles
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
                    // Optional: Log a "Failed/Skipped" message log? 
                    // Let's not spam the logs with failures, but maybe ONE log would be good.
                    // For now, just SKIP.
                    results.push({ contact: contact.name, status: 'skipped_quota', agent: agent.email });
                    continue;
                }

                // Prepare Email
                const subject = step.subject || step.trigger_name || `Follow Up - Day ${step.day}`
                let content = step.content_email || step.content_sms || ''
                content = content.replace(/{name}/g, contact.name)
                    .replace(/{title}/g, contact.title || '')

                // Send via Resend
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
                })

                if (emailRes.ok) {
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
                    const errText = await emailRes.text();
                    console.error('Failed to send for', contact.email, errText)
                    results.push({ contact: contact.name, status: 'error', error: errText })
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
