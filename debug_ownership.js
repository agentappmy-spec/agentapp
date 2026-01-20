
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nywvatykietyhbhugcbl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55d3ZhdHlraWV0eWhiaHVnY2JsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIyMTQ4MywiZXhwIjoyMDgzNzk3NDgzfQ.SWYoFd-nPa13F6t2hUdJSQjC1Y8AQRAmGZ3ir8I2cLM";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function debugOwnership() {
    console.log("🕵️ Debugging Ownership...");

    // 1. Get One Recent Contact (to identify the Agent)
    const { data: contacts } = await supabase.from('contacts')
        .select('id, name, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(1);

    if (!contacts || contacts.length === 0) {
        console.log("No contacts found.");
        return;
    }

    const contact = contacts[0];
    const agentId = contact.user_id;

    console.log(`\n👤 Contact: ${contact.name}`);
    console.log(`🆔 Agent ID: ${agentId}`);

    // 2. Check Agent Profile
    const { data: agent } = await supabase.from('profiles').select('email, full_name, role').eq('id', agentId).single();
    console.log(`📧 Agent Email: ${agent?.email}`);

    // 3. Find Steps for this Agent
    // Logic: user_id IS NULL (Global) OR user_id == AgentID
    const { data: steps } = await supabase.from('workflow_steps')
        .select('id, day, template_id, trigger_name, user_id')
        .or(`user_id.is.null,user_id.eq.${agentId}`)
        .eq('is_active', true);

    console.log(`\n📋 Steps found for this Agent: ${steps?.length || 0}`);

    if (steps && steps.length > 0) {
        const daySteps = steps.filter(s => s.day !== null);
        console.log(`   - Day Based Steps: ${daySteps.length}`);
        console.table(daySteps.map(s => ({
            day: s.day,
            template: s.template_id,
            owner: s.user_id ? 'Personal' : 'GLOBAL'
        })));
    } else {
        console.log("❌ CRITICAL: This agent has NO active steps. They will never send emails!");

        // 4. Verify who OWNS the steps seen in previous logs?
        // Fetch 5 random steps
        const { data: randomSteps } = await supabase.from('workflow_steps').select('user_id, template_id, day').not('day', 'is', null).limit(5);
        console.log("\n🔎 Sample steps in database belong to:");
        console.table(randomSteps);
    }
}

debugOwnership();
