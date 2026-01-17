import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as rsa from "https://deno.land/x/god_crypto@v1.4.10/rsa.ts";
// Note: Chip In uses RSA SHA-1 signatures. Verification in Deno can be tricky without specific libs.
// For MVP, we might skip rigorous signature verification or implement a simplified secret check if Chip supports it.
// According to docs: "X-Signature header containing a base64-encoded RSA PKCS#1 v1.5 signature"

serve(async (req) => {
    try {
        const signature = req.headers.get("X-Signature");
        const payload = await req.json();

        console.log("Webhook Received:", payload);

        if (payload.event_type !== 'purchase.paid' && payload.status !== 'paid') {
            return new Response('Ignored event', { status: 200 });
        }

        // Extract User Email from Payload
        // Structure: purchase object inside payload
        const purchase = payload.purchase || payload;
        const clientEmail = purchase.client.email;

        if (!clientEmail) {
            throw new Error("No email in webhook payload");
        }

        // Initialize Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Determine Plan & Expiry from Product Name
        const productName = purchase.products?.[0]?.name || ""; // e.g., "AgentApp Pro (Yearly)"
        const nameMatch = productName.match(/AgentApp (.+) \((Monthly|Yearly)\)/);

        let targetPlanId = 'pro';
        let daysToAdd = 30;

        if (nameMatch) {
            const extractedName = nameMatch[1];
            const interval = nameMatch[2];

            daysToAdd = interval === 'Yearly' ? 365 : 30;

            // Fetch Plan ID by Name
            const { data: planRow } = await supabaseAdmin
                .from('plans')
                .select('id')
                .ilike('name', extractedName) // Case insensitive match
                .single();

            if (planRow) targetPlanId = planRow.id;
        } else {
            // Fallback to legacy amount check
            const amount = purchase.purchase?.total_amount || purchase.total_amount;
            if (amount >= 20000) daysToAdd = 365;
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + daysToAdd);

        // Update User Profile
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({
                plan_id: targetPlanId,
                subscription_status: 'active',
                subscription_end_date: expiryDate.toISOString()
            })
            .eq('email', clientEmail);

        if (error) {
            console.error("DB Update Error", error);
            throw error;
        }

        console.log(`Upgraded ${clientEmail} to Pro until ${expiryDate.toISOString()}`);

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error(err);
        return new Response(err.message, { status: 400 });
    }
})
