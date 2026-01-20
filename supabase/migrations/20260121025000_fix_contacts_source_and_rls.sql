-- 1. Add 'source' column to contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Manual';

-- 2. Allow public (anon) users to insert contacts
-- Ideally, we only allow this for 'Prospect' role and 'Landing Page' source to prevent spam
CREATE POLICY "Allow public insert for leads"
    ON public.contacts
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        role = 'Prospect' AND 
        source IN ('Landing Page', 'Public Form')
    );
