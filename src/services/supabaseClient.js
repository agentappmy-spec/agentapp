
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use the global supabase object injected via CDN
const { createClient } = window.supabase;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
