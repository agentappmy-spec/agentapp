import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            SUPABASE_URL ?? '',
            SUPABASE_SERVICE_ROLE_KEY ?? ''
        )

        // 1. Authenticate User
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Authorization header')

        // Create a client with the user's token to get their profile
        const supabaseClient = createClient(
            SUPABASE_URL ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        const { to, subject, html, text } = await req.json()

        // 2. Fetch User Profile & Plan Limit
        const { data: profile } = await supabase
            .from('profiles')
            .select('*, plans(*)')
            .eq('id', user.id)
            .single()

        if (!profile) throw new Error('Profile not found')

        const isSuperAdmin = profile.role === 'super_admin'
        const plan = profile.plans || { monthly_message_limit: 10 } // Fallback to safe default

        // 3. Check Quota (Skip for Super Admin)
        if (!isSuperAdmin) {
            const now = new Date()
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

            const { count, error: countError } = await supabase
                .from('message_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', firstDay)

            if (countError) throw countError

            if ((count || 0) >= plan.monthly_message_limit) {
                return new Response(
                    JSON.stringify({ error: `Monthly limit reached (${count}/${plan.monthly_message_limit}). Please upgrade.` }),
                    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }
        }

        // 4. Send Email via Resend
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'AgentApp <system@mail.agentapp.my>',
                to: to,
                reply_to: user.email, // Critical: Client replies go to the Agent
                subject: subject,
                html: html,
                text: text
            }),
        })

        const data = await res.json()
        if (!res.ok) {
            return new Response(JSON.stringify(data), {
                status: res.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 5. Log Transaction
        await supabase.from('message_logs').insert({
            user_id: user.id,
            type: 'email',
            recipient: to, // Store email address
            content_snippet: subject // Store subject line as snippet
        })

        return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
