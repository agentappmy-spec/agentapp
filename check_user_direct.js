
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nywvatykietyhbhugcbl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55d3ZhdHlraWV0eWhiaHVnY2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjE0ODMsImV4cCI6MjA4Mzc5NzQ4M30.C6A2OUjkMAN1TEwg6rXqmE13aOtzI6DSiO2_UqvWICM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUser() {
    console.log('Fetching...');
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
