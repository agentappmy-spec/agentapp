-- Add subject column to workflow_templates
ALTER TABLE public.workflow_templates 
ADD COLUMN IF NOT EXISTS subject text;

-- Add subject column to workflow_steps
ALTER TABLE public.workflow_steps 
ADD COLUMN IF NOT EXISTS subject text;

-- Update existing templates with default subjects for workflow_templates
UPDATE public.workflow_templates 
SET subject = CASE 
    WHEN day = 0 AND workflow_type = 'prospect' THEN 'Terima kasih kerana hubungi saya!'
    WHEN day = 5 AND workflow_type = 'prospect' THEN 'Jom berbincang tentang perlindungan anda'
    WHEN day = 15 AND workflow_type = 'prospect' THEN 'Jangan lepaskan peluang ini!'
    WHEN day = 0 AND workflow_type = 'client' THEN 'Tahniah! Selamat datang ke keluarga kami'
    WHEN day = 5 AND workflow_type = 'client' THEN 'Perlindungan anda kini aktif'
    WHEN day = 15 AND workflow_type = 'client' THEN 'Jom kita bersosial!'
    ELSE 'Follow-up from your Takaful Advisor'
END
WHERE subject IS NULL;

-- Update Free User Flow templates
UPDATE public.workflow_templates 
SET subject = 'Welcome to AgentApp! 🎉'
WHERE workflow_type = 'free_user' AND day = 0;

UPDATE public.workflow_templates 
SET subject = 'Unlock More with Pro 🚀'
WHERE workflow_type = 'free_user' AND day = 3;

-- Update Pro User Flow templates
UPDATE public.workflow_templates 
SET subject = 'Welcome to the Elite Club! 💎'
WHERE workflow_type = 'pro_user' AND day = 0;

-- Update existing steps with default subjects for workflow_steps
UPDATE public.workflow_steps 
SET subject = CASE 
    WHEN template_id = 'prospect' AND day = 0 THEN 'Terima kasih kerana hubungi saya!'
    WHEN template_id = 'prospect' AND day = 5 THEN 'Jom berbincang tentang perlindungan anda'
    WHEN template_id = 'prospect' AND day = 15 THEN 'Jangan lepaskan peluang ini!'
    WHEN template_id = 'client' AND day = 0 THEN 'Tahniah! Selamat datang ke keluarga kami'
    WHEN template_id = 'client' AND day = 5 THEN 'Perlindungan anda kini aktif'
    WHEN template_id = 'client' AND day = 15 THEN 'Jom kita bersosial!'
    ELSE 'Follow-up from your Takaful Advisor'
END
WHERE subject IS NULL;
