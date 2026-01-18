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
        // using user_id foreign key to get Agent's email for Reply-To
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

        // 3. Iterate and Match
        for (const contact of contacts) {
            if (!contact.profiles) continue // Orphaned contact?

            const agent = contact.profiles
            const joinedAt = new Date(contact.joined_at || contact.created_at)
            const diffTime = Math.abs(today.getTime() - joinedAt.getTime())
            const daysSinceJoined = Math.floor(diffTime / (1000 * 60 * 60 * 24))

            // Determine Template Type
            const templateType = contact.role === 'Client' ? 'client' : 'prospect'

            // Find matching steps
            const matches = steps.filter(step => {
                // A. Day Based Triggers
                if (step.template_id === templateType && step.day !== null) {
                    // Check if due today (or passed if catch-up logic needed, but strict for now)
                    return step.day === daysSinceJoined
                }

                // B. Date Based Triggers (Global)
                if (step.template_id === 'global' && step.date) {
                    if (step.date === 'auto') {
                        // Handle birthday logic if birthdate exists? (Skipping for MVP complexity)
                        return false
                    }
                    return step.date === todayStr
                }
                return false
            })

            for (const step of matches) {
                // Skip if already sent (Idempotency)
                if (contact.last_followup_day >= step.day && step.template_id !== 'global') continue

                // Check Quota
                // Note: For high volume, we should batch or cache this count.
                // For MVP, valid to check per send or trust optimistic checking.
                // We'll skip strict DB count here to avoid N+1 queries bombarding DB, 
                // relying on the Agent's plan limit generally. 
                // Ideally: Fetch message_logs count for all agents in one go? 
                // For now, we assume if you are active, you have some quota.

                // Prepare Email
                const subject = step.subject || step.trigger_name || `Follow Up - Day ${step.day}`
                let content = step.content_email || step.content_sms || ''
                content = content.replace(/{name}/g, contact.name)

                // Send via Resend
                const emailRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: 'AgentApp <system@mail.agentapp.my>',
                        to: contact.email, // Contact's email
                        reply_to: agent.email, // Agent's email 
                        subject: subject, // TODO: Better subjects in DB
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

                    // Update Contact State
                    if (step.template_id !== 'global') {
                        await supabase.from('contacts')
                            .update({ last_followup_day: step.day })
                            .eq('id', contact.id)
                    }

                    results.push({ contact: contact.name, step: step.day, status: 'sent' })
                } else {
                    console.error('Failed to send for', contact.email, await emailRes.text())
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
