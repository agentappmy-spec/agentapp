-- Fix inconsistent status for Clients
-- Issue: Some contacts have Role='Client' but Status='New'. 
-- This happened due to a previous bug in the Create Contact form.
-- The Dashboard only counts 'Active' clients, so these 'New' clients are ignored.

UPDATE public.contacts
SET status = 'Active',
    updated_at = timezone('utc'::text, now())
WHERE role = 'Client' AND status = 'New';

-- Optional: Ensure all Prospects are New/Warm/Cold/KIV (Sanity check)
-- UPDATE public.contacts SET status = 'New' WHERE role = 'Prospect' AND status = 'Active'; 
-- (Commented out safety check, let's strictly fix the Client issue first)
