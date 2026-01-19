-- Add address and timezone fields to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS postcode text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'Malaysia',
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Kuala_Lumpur';

-- Create a partial index or just standard index if we query by these often (unlikely for now)
-- No RLS changes needed as users can update their own profile typically via existing policies.
