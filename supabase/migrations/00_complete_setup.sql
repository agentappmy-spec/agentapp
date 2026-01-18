-- ============================================
-- AGENTAPP COMPLETE DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. PROFILES TABLE (Core user data)
-- ============================================
-- Note: Supabase Auth creates the auth.users table automatically
-- We extend it with a profiles table

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    role text DEFAULT 'agent' CHECK (role IN ('agent', 'super_admin')),
    plan_id text DEFAULT 'free',
    subscription_end_date timestamp with time zone,
    
    -- Profile details
    username text UNIQUE,
    title text,
    phone text,
    agency_name text,
    license_no text,
    bio text,
    photo_url text,
    
    -- Configuration
    products text[] DEFAULT ARRAY['Hibah', 'Medical Card'],
    tags text[] DEFAULT ARRAY['Referral', 'VIP', 'Good Paymaster', 'Late Payer', 'Low Budget', 'AgentApp Leads'],
    landing_config jsonb,
    integrations jsonb DEFAULT '{"whatsapp":{"enabled":true,"apiKey":"","instanceId":""},"email":{"enabled":false,"apiKey":"","sender":"noreply@agent.com"},"sms":{"enabled":false,"apiKey":"","senderId":"AGENCY"}}'::jsonb,
    
    -- Publishing
    is_published boolean DEFAULT false,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
CREATE POLICY "Super admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- Public profiles can be viewed by anyone (for landing pages)
DROP POLICY IF EXISTS "Published profiles are publicly viewable" ON public.profiles;
CREATE POLICY "Published profiles are publicly viewable" ON public.profiles
    FOR SELECT USING (is_published = true);

-- ============================================
-- 2. PLANS TABLE (Subscription tiers)
-- ============================================
-- Note: Table may already exist, we'll just ensure columns exist
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS monthly_message_limit int DEFAULT 0;

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Everyone can read plans
DROP POLICY IF EXISTS "Plans are viewable by everyone" ON public.plans;
CREATE POLICY "Plans are viewable by everyone" ON public.plans
    FOR SELECT USING (true);

-- Only super admins can modify plans
DROP POLICY IF EXISTS "Super admins can manage plans" ON public.plans;
CREATE POLICY "Super admins can manage plans" ON public.plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- Update existing plans (using jsonb for features to match existing schema)
INSERT INTO public.plans (id, name, price_monthly, price_yearly, contact_limit, monthly_message_limit, features, is_active)
VALUES 
    ('free', 'Free Starter', 0, 0, 50, 300, 
     '["Email", "Dashboard", "Keep your client contact safe"]'::jsonb, 
     true),
    ('pro', 'Pro', 22, 220, 1000, 3000, 
     '["WhatsApp", "SMS", "Email", "Auto Follow Up", "Auto Reminder", "Landing Page", "Analytics"]'::jsonb, 
     true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    contact_limit = EXCLUDED.contact_limit,
    monthly_message_limit = EXCLUDED.monthly_message_limit,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active;

-- ============================================
-- 3. CONTACTS TABLE (User's client database)
-- ============================================
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    phone text,
    role text DEFAULT 'Prospect' CHECK (role IN ('Prospect', 'Client')),
    status text DEFAULT 'New Lead',
    tags text[] DEFAULT ARRAY[]::text[],
    products text[] DEFAULT ARRAY[]::text[],
    deal_value numeric DEFAULT 0,
    next_action text,
    occupation text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own contacts
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
CREATE POLICY "Users can view their own contacts" ON public.contacts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
CREATE POLICY "Users can insert their own contacts" ON public.contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
CREATE POLICY "Users can update their own contacts" ON public.contacts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;
CREATE POLICY "Users can delete their own contacts" ON public.contacts
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. PROMO CODES TABLE (Promotional codes)
-- ============================================
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

-- Super admins can manage promo codes
DROP POLICY IF EXISTS "Super admins can manage promo codes" ON public.promo_codes;
CREATE POLICY "Super admins can manage promo codes" ON public.promo_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- All authenticated users can read active promo codes
DROP POLICY IF EXISTS "Users can read active promo codes" ON public.promo_codes;
CREATE POLICY "Users can read active promo codes" ON public.promo_codes
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert default promo codes
INSERT INTO public.promo_codes (code, reward, status, expiry, usage_count, usage_limit)
VALUES 
    ('KDIGITAL', '30 Days Pro Trial', 'ACTIVE', 'Never', 0, 0),
    ('WELCOME50', '50% Off First Month', 'ACTIVE', '2026-12-31', 0, 100)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 5. MESSAGE LOGS TABLE (Track messaging usage)
-- ============================================
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

-- ============================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, plan_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'agent',
        'free'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.contacts;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.promo_codes;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.promo_codes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your AgentApp database is now ready to use.
-- All tables have Row Level Security enabled.
-- Default plans and promo codes have been inserted.
