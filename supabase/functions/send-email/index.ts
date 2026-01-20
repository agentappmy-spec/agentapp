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
        const body = await req.json()

        // === HANDLE SUPABASE AUTH HOOKS ===
        // Supabase sends { email_data: { token, token_hash, redirect_to, email_action_type }, user: { email, ... } }
        if (body.email_data) {
            const { email_data, user } = body;
            const { token, token_hash, redirect_to, email_action_type } = email_data;
            const email = user.email;

            console.log(`Received Auth Hook: ${email_action_type} for ${email}`);

            let subject = 'Confirm your account';
            let htmlContent = '';
            let actionUrl = '';

            // Construct Action URL
            if (token_hash) {
                // PKCE / New Flow
                actionUrl = `${redirect_to}?token_hash=${token_hash}&type=${email_action_type}`;
            } else {
                // Legacy Token
                actionUrl = `${redirect_to}?token=${token}&type=${email_action_type}`;
            }

            // Select Template based on Action Type
            switch (email_action_type) {
                case 'signup':
                    subject = 'Welcome to AgentApp! Confirm your email';
                    htmlContent = `
                        <h2>Welcome to AgentApp! 🎉</h2>
                        <p>Thanks for signing up. Please confirm your email address to get started.</p>
                        <p><a href="${actionUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Confirm Email</a></p>
                        <p style="font-size: 0.9em; color: #666;">Or copy this link: ${actionUrl}</p>
                    `;
                    break;

                case 'recovery':
                    subject = 'Reset your password - AgentApp';
                    htmlContent = `
                        <h2>Reset Password Request</h2>
                        <p>We received a request to reset your password. Click the button below to choose a new one.</p>
                        <p><a href="${actionUrl}" style="background-color: #db2777; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
                        <p style="font-size: 0.9em; color: #666;">If you didn't request this, you can safely ignore this email.</p>
                    `;
                    break;

                case 'magiclink':
                    subject = 'Your Login Link - AgentApp';
                    htmlContent = `
                        <h2>Log in to AgentApp</h2>
                        <p>Click the button below to sign in instantly.</p>
                        <p><a href="${actionUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Sign In</a></p>
                    `;
                    break;

                case 'invite':
                    subject = 'You have been invited to AgentApp';
                    htmlContent = `
                        <h2>You've been invited!</h2>
                        <p>You have been invited to join an AgentApp workspace.</p>
                        <p><a href="${actionUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invite</a></p>
                    `;
                    break;

                case 'email_change':
                    subject = 'Confirm Email Change - AgentApp';
                    htmlContent = `
                        <h2>Confirm Email Change</h2>
                        <p>Please confirm your new email address by clicking the button below.</p>
                        <p><a href="${actionUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Confirm Change</a></p>
                    `;
                    break;

                default:
                    console.warn('Unknown email action type:', email_action_type);
                    return new Response(JSON.stringify({ message: 'Unknown action type, skipped' }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    });
            }

            // Send via Resend
            const emailPayload = {
                from: 'AgentApp <system@mail.agentapp.my>',
                to: email,
                subject: subject,
                html: htmlContent
            };

            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`
                },
                body: JSON.stringify(emailPayload)
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error('Resend Hook Error:', errText);
                return new Response(JSON.stringify({ error: errText }), { status: 500 });
            }

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // === HANDLE MANUAL/APP INVOCATIONS (Existing Logic) ===
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
