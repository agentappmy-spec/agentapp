-- Add missing columns to contacts table for complete contact management

-- Birthday field
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS birthday DATE;

-- Subscription/Policy date (for clients)
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS subscription_date DATE;

-- Additional info/constraints
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- Smoking status
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS smoking TEXT;

-- Auto follow-up enabled flag
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS auto_follow_up BOOLEAN DEFAULT true;

-- Joined date (for auto follow-up day calculations)
-- Use created_at if this is null
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Last follow-up day sent (for tracking auto follow-up progress)
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS last_followup_day INTEGER DEFAULT 0;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_birthday ON public.contacts(birthday) WHERE birthday IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_auto_followup ON public.contacts(auto_follow_up, joined_at) WHERE auto_follow_up = true;

-- Add comments for documentation
COMMENT ON COLUMN public.contacts.birthday IS 'Contact birthday for sending birthday wishes';
COMMENT ON COLUMN public.contacts.subscription_date IS 'Policy or subscription start date for clients';
COMMENT ON COLUMN public.contacts.additional_info IS 'Additional constraints, preferences, or profile notes';
COMMENT ON COLUMN public.contacts.smoking IS 'Smoking or vaping status (Yes/No)';
COMMENT ON COLUMN public.contacts.auto_follow_up IS 'Whether to include this contact in automated follow-up sequences';
COMMENT ON COLUMN public.contacts.joined_at IS 'Date when contact was added (used for calculating follow-up day numbers)';
COMMENT ON COLUMN public.contacts.last_followup_day IS 'Last follow-up day number that was sent to this contact';
