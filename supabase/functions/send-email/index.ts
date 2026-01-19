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
    // 0. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Authenticate User
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        const supabaseClient = createClient(
            SUPABASE_URL ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized', details: userError }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const body = await req.json()
        const { to, subject, html, text } = body

        // 2. Fetch User Profile & Plan Limits
        const supabase = createClient(
            SUPABASE_URL ?? '',
            SUPABASE_SERVICE_ROLE_KEY ?? ''
        )
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, plans (monthly_message_limit)')
            .eq('id', user.id)
            .single()

        if (!profile) throw new Error('Profile not found');

        // 3. Check Quota (Skip for Super Admin)
        if (profile.role !== 'super_admin') {
            const limit = profile.plans?.monthly_message_limit || 0;
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

            const { count, error: countError } = await supabase
                .from('message_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', firstDayOfMonth);

            if (countError) throw countError;

            const usage = count || 0;

            if (usage >= limit) {
                return new Response(JSON.stringify({
                    error: 'Quota Exceeded',
                    message: `You have reached your monthly limit of ${limit} messages. Usage: ${usage}`
                }), {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }
        }

        // 4. Prepare Resend Payload
        const cleanText = text || html?.replace(/<[^>]*>/g, '').substring(0, 10000) || 'No content'

        const emailPayload = {
            from: 'AgentApp <system@mail.agentapp.my>',
            to: to,
            reply_to: user.email,
            subject: subject,
            html: html,
            text: cleanText
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify(emailPayload)
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error('Resend API Error:', errorText)
            return new Response(JSON.stringify({ error: 'Resend Error', details: errorText }), {
                status: res.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const data = await res.json()

        // 5. Log Transaction
        try {
            await supabase.from('message_logs').insert({
                user_id: user.id,
                type: 'email',
                recipient: to,
                content_snippet: subject
            })
        } catch (logErr) {
            console.error('Failed to log message:', logErr)
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (err: any) {
        console.error('Email Function Error:', err)
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
