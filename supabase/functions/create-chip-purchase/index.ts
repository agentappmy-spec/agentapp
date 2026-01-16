import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
        const { email, plan, successUrl, failureUrl } = await req.json()

        // Validate Environment Variables
        const BRAND_ID = Deno.env.get('CHIP_BRAND_ID');
        const SECRET_KEY = Deno.env.get('CHIP_SECRET_KEY');

        if (!BRAND_ID || !SECRET_KEY) {
            throw new Error("Missing Chip In credentials");
        }

        // Determine Price & Product
        const isYearly = plan === 'yearly';
        const priceCents = isYearly ? 22000 : 2200; // RM 220.00 or RM 22.00
        const productName = isYearly ? "AgentApp Pro (Yearly)" : "AgentApp Pro (Monthly)";

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
                notes: `Upgrade ${email} to ${plan}`
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
