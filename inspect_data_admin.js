
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nywvatykietyhbhugcbl.supabase.co";
// Using SERVICE ROLE KEY to bypass RLS and see all data
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55d3ZhdHlraWV0eWhiaHVnY2JsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIyMTQ4MywiZXhwIjoyMDgzNzk3NDgzfQ.SWYoFd-nPa13F6t2hUdJSQjC1Y8AQRAmGZ3ir8I2cLM";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log("Connecting to Supabase (Admin)...");

    // 1. Get Active Workflow Steps
    const { data: steps, error: stepsError } = await supabase.from('workflow_steps').select('*').eq('is_active', true).order('day');

    // 2. Get Recent Contacts (Last 7 days)
    const date = new Date(); date.setDate(date.getDate() - 7);
    const { data: contacts, error: contactsError } = await supabase.from('contacts')
        .select('id, name, role, created_at, last_followup_day, user_id, status')
        .gt('created_at', date.toISOString());

    // 3. Get Recent Users (Agents) - Just to cross reference with user's screenshot
    const { data: profiles, error: profilesError } = await supabase.from('profiles')
        .select('id, email, full_name, role, created_at')
        .gt('created_at', date.toISOString());

    // 4. Get Logs
    const { data: logs, error: logsError } = await supabase.from('message_logs')
        .select('created_at, recipient, content_snippet, user_id')
        .order('created_at', { ascending: false })
        .limit(10);

    console.log('\n--- ACTIVE WORKFLOW STEPS ---');
    if (steps) console.table(steps.map(s => ({
        id: s.id.substring(0, 5),
        day: s.day,
        template: s.template_id,
        trigger: s.trigger_name
    })));

    console.log('\n--- RECENT PROFILES (AGENTS) ---');
    if (profiles) console.table(profiles.map(p => ({
        email: p.email,
        role: p.role,
        joined: new Date(p.created_at).toISOString().split('T')[0]
    })));

    console.log('\n--- RECENT CONTACTS (CLIENTS) ---');
    if (contacts && contacts.length > 0) {
        console.table(contacts.map(c => ({
            name: c.name,
            role: c.role,
            joined: new Date(c.created_at).toISOString().split('T')[0],
            agent_id: c.user_id.substring(0, 5) + '...',
            last_sent_day: c.last_followup_day
        })));
    } else {
        console.log("(No contacts found in last 7 days)");
    }

    console.log('\n--- RECENT MESSAGE LOGS ---');
    if (logs && logs.length > 0) {
        console.table(logs.map(l => ({
            time: new Date(l.created_at).toISOString().split('T')[1].substring(0, 8),
            recipient: l.recipient,
            snippet: l.content_snippet.substring(0, 30)
        })));
    } else {
        console.log("(No logs found)");
    }
}
check();
