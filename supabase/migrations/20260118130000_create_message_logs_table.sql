-- Create message_logs table to track messaging usage
CREATE TABLE IF NOT EXISTS public.message_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
    recipient text,
    content_snippet text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert and read their own logs
DROP POLICY IF EXISTS "Users can insert their own logs" ON public.message_logs;
CREATE POLICY "Users can insert their own logs" ON public.message_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read their own logs" ON public.message_logs;
CREATE POLICY "Users can read their own logs" ON public.message_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Super admins can read all logs
DROP POLICY IF EXISTS "Super admins can read all logs" ON public.message_logs;
CREATE POLICY "Super admins can read all logs" ON public.message_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );
