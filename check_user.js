
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUser() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'dzulfaqarhashim@gmail.com')

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('User Data:', JSON.stringify(data, null, 2))
    }
}

checkUser()
