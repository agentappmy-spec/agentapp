-- Add integrations column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS integrations JSONB DEFAULT '{"email": true, "whatsapp": false, "sms": false}';

-- Update existing Pro users to have whatsapp/sms active by default
UPDATE public.profiles
SET integrations = '{"email": true, "whatsapp": true, "sms": true}'
WHERE plan_id = 'pro';
