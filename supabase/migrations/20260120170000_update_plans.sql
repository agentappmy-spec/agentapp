-- Migration: Update Subscription Plans
-- Cleans up old plan data and inserts the correct Free/Pro tiers as requested by the user.

-- 1. Clear existing plans to avoid duplicates/conflicts (Profiles might reference them, so we handle dependencies if needed)
-- Note: If profiles reference these plans, we should be careful. 
-- However, since plan_id is text and 'free'/'pro' are standard, we can update them in place or delete and re-insert if IDs match.
-- Let's try to UPDATE existing ones to preserve references, and INSERT if missing.

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
        'analytics_advanced'
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
