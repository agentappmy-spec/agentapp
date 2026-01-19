-- Migration: Update Plans & Super Admin
-- 1. Updates Free/Pro plans with correct limits and features.
-- 2. Ensures the Super Admin Plan exists (hidden/system plan).
-- 3. Enforces Super Admin Role for 'agentapp.my@gmail.com'.

-- ==========================================
-- 1. UPDATE STANDARD PLANS
-- ==========================================

-- FREE PLAN
INSERT INTO public.plans (id, name, price_monthly, price_yearly, contact_limit, monthly_message_limit, features, is_active)
VALUES (
    'free', 
    'Free Starter', 
    0, 
    0, 
    10, 
    300, 
    ARRAY['dashboard_access', 'email_enabled', 'global_reminders_enabled', 'landing_page_edit'], 
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    contact_limit = EXCLUDED.contact_limit,
    monthly_message_limit = EXCLUDED.monthly_message_limit,
    features = EXCLUDED.features;

-- PRO PLAN
INSERT INTO public.plans (id, name, price_monthly, price_yearly, contact_limit, monthly_message_limit, features, is_active)
VALUES (
    'pro', 
    'Pro', 
    22, 
    220, 
    210, -- 10 (Free) + 200 (Add more)
    3000, -- 300 (Free) + 2700 (Add more)
    ARRAY[
        'dashboard_access', 
        'email_enabled', 
        'sms_enabled', 
        'whatsapp_enabled', 
        'global_reminders_enabled', 
        'auto_followup_enabled', 
        'landing_page_edit', 
        'landing_page_publish', 
        'analytics_advanced',
        'white_label'
    ], 
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    contact_limit = EXCLUDED.contact_limit,
    monthly_message_limit = EXCLUDED.monthly_message_limit,
    features = EXCLUDED.features;

-- ==========================================
-- 2. SUPER ADMIN PLAN & ROLE
-- ==========================================

-- Create/Update Super Admin Plan (Unlimited)
INSERT INTO public.plans (id, name, price_monthly, price_yearly, contact_limit, monthly_message_limit, features, is_active)
VALUES (
    'super_admin', 
    'Super Admin', 
    0, 
    0, 
    0, -- 0 means Unlimited in our logic
    0, -- 0 means Unlimited
    ARRAY[
        'dashboard_access', 'email_enabled', 'sms_enabled', 'whatsapp_enabled', 
        'global_reminders_enabled', 'auto_followup_enabled', 'landing_page_edit', 
        'landing_page_publish', 'analytics_advanced', 'white_label', 'admin_panel'
    ], 
    true
)
ON CONFLICT (id) DO UPDATE SET
    contact_limit = 0,
    monthly_message_limit = 0,
    features = EXCLUDED.features;

-- Force 'agentapp.my@gmail.com' to be Super Admin
UPDATE public.profiles
SET 
    role = 'super_admin',
    plan_id = 'super_admin'
WHERE email = 'agentapp.my@gmail.com';

-- Ensure RLS Policy prevents deletion of Super Admin
-- (Re-applying this policy to be safe, or creating if not exists logic is complex in pure SQL without PL/PGSQL blocks, 
-- but we can just ensure the user is updated correctly first).
