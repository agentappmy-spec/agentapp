-- Consolidated Migration for Plans & Permissions

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.plans (
  id text primary key,
  name text not null,
  price_monthly numeric not null default 0,
  price_yearly numeric not null default 0,
  contact_limit int not null default 0,
  monthly_message_limit int not null default 0,
  features jsonb not null default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- 3. Security Helper Function (Bypasses RLS for admin checks)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Policies (Drop first to ensure clean state)
DROP POLICY IF EXISTS "Allow super_admin update" ON public.plans;
DROP POLICY IF EXISTS "Allow super_admin insert" ON public.plans;
DROP POLICY IF EXISTS "Allow super_admin delete" ON public.plans;
DROP POLICY IF EXISTS "Allow public read access" ON public.plans;

CREATE POLICY "Allow super_admin update" ON public.plans FOR UPDATE USING (is_super_admin());
CREATE POLICY "Allow super_admin insert" ON public.plans FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY "Allow super_admin delete" ON public.plans FOR DELETE USING (is_super_admin());
CREATE POLICY "Allow public read access" ON public.plans FOR SELECT USING (true);

-- 5. Seed/Update Data
INSERT INTO public.plans (id, name, price_monthly, price_yearly, contact_limit, monthly_message_limit, features)
VALUES 
  ('free', 'Free Starter', 0, 0, 50, 0, '["Email Only", "Dashboard", "Keep your client contact safe"]'),
  ('pro', 'Pro', 22, 220, 1000, 3000, '["WhatsApp", "SMS", "Email", "Auto Follow Up", "Auto Reminder", "Landing Page", "Analytics"]')
ON CONFLICT (id) DO UPDATE 
SET 
  name = excluded.name,
  price_monthly = excluded.price_monthly,
  price_yearly = excluded.price_yearly,
  contact_limit = excluded.contact_limit,
  monthly_message_limit = excluded.monthly_message_limit,
  features = excluded.features;
