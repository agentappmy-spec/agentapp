import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CHIP_API_URL = "https://gate.chip-in.asia/api/v1/purchases/";

serve(async (req) => {
    // CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, planId, interval, successUrl, failureUrl } = await req.json()

        // Validate Environment Variables
        const BRAND_ID = Deno.env.get('CHIP_BRAND_ID');
        const SECRET_KEY = Deno.env.get('CHIP_SECRET_KEY');
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!BRAND_ID || !SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing credentials");
        }

        // Initialize Admin Client
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Fetch Plan Details
        const { data: planData, error: planError } = await supabaseAdmin
            .from('plans')
            .select('*')
            .eq('id', planId || 'pro')
            .single();

        // Fallback defaults if DB fail or missing
        const defaultPro = { price_monthly: 22, price_yearly: 220, name: 'Pro' };
        const proPlan = planData || defaultPro;

        if (planError) console.error("Error fetching plan:", planError);

        // Determine Price & Product
        const isYearly = interval === 'yearly';
        const priceCents = isYearly ? (proPlan.price_yearly * 100) : (proPlan.price_monthly * 100);
        const productName = isYearly ? `AgentApp ${proPlan.name} (Yearly)` : `AgentApp ${proPlan.name} (Monthly)`;

        // Construct Payload
        const payload = {
            brand_id: BRAND_ID,
            client: {
                email: email
            },
            purchase: {
                currency: 'MYR',
                products: [
                    {
                        name: productName,
                        price: priceCents,
                        quantity: 1
                    }
                ],
                notes: `Upgrade ${email} to ${proPlan.name} (${interval})`
            },
            success_callback: `${Deno.env.get('SUPABASE_URL')}/functions/v1/chip-webhook`,
            success_redirect: successUrl,
            failure_redirect: failureUrl
        };

        // Call Chip In API
        const response = await fetch(CHIP_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SECRET_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Chip In Error:", data);
            throw new Error(JSON.stringify(data));
        }

        return new Response(
            JSON.stringify({ checkout_url: data.checkout_url, id: data.id }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    }
})
