-- Create promo_codes table for managing promotional codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    reward text NOT NULL,
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    expiry text DEFAULT 'Never',
    usage_count int DEFAULT 0,
    usage_limit int DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Policies for promo_codes
-- Super admins can do everything
DROP POLICY IF EXISTS "Super admins can manage promo codes" ON public.promo_codes;
CREATE POLICY "Super admins can manage promo codes" ON public.promo_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- All authenticated users can read active promo codes (to redeem them)
DROP POLICY IF EXISTS "Users can read active promo codes" ON public.promo_codes;
CREATE POLICY "Users can read active promo codes" ON public.promo_codes
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert default promo codes
INSERT INTO public.promo_codes (code, reward, status, expiry, usage_count, usage_limit)
VALUES 
    ('KDIGITAL', '30 Days Pro Trial', 'ACTIVE', 'Never', 0, 0),
    ('WELCOME50', '50% Off First Month', 'ACTIVE', '2026-12-31', 0, 100)
ON CONFLICT (code) DO NOTHING;
