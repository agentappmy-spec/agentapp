import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 1. Check if the requester is a Super Admin
        const { data: { user } } = await supabaseClient.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'super_admin') {
            throw new Error('Forbidden: Only Super Admins can delete users.')
        }

        // 2. Get the target user_id from the request body
        const { user_id } = await req.json()
        if (!user_id) throw new Error('Missing user_id')

        if (user_id === user.id) {
            throw new Error('Cannot delete your own account.')
        }

        // 3. Admin Client with Service Role (Bypass RLS)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Check if target user is the protected Super Admin
        const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(user_id)
        if (targetUser?.user?.email === 'agentapp.my@gmail.com') {
            throw new Error('Forbidden: This Super Admin account cannot be deleted.')
        }

        // 4. Delete Data (Order matters for Foreign Keys)
        // Delete contacts
        const { error: contactsError } = await supabaseAdmin
            .from('contacts')
            .delete()
            .eq('user_id', user_id)
        if (contactsError) throw contactsError

        // Delete message logs
        const { error: logsError } = await supabaseAdmin
            .from('message_logs')
            .delete()
            .eq('user_id', user_id)
        if (logsError) throw logsError

        // Delete profile (Trigger will likely delete auth user if cascading, but we do explicitly)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', user_id)
        if (profileError) throw profileError

        // 5. Delete from Auth (The Real Deletion)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user_id)
        if (authError) throw authError

        return new Response(
            JSON.stringify({ success: true, message: `User ${user_id} deleted successfully` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
