-- Add email column to contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);

-- Add comment
COMMENT ON COLUMN public.contacts.email IS 'Contact email address for communication';
