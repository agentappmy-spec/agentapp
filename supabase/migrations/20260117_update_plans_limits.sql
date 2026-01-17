ALTER TABLE plans ADD COLUMN IF NOT EXISTS monthly_message_limit INTEGER DEFAULT 0;

-- Update Free Plan
INSERT INTO plans (id, name, price_monthly, price_yearly, contact_limit, monthly_message_limit, features, is_active)
VALUES (
  'free',
  'Free Starter',
  0,
  0,
  20,
  0,
  '["dashboard", "email", "reminder_global", "landing_page_view"]'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET
  contact_limit = EXCLUDED.contact_limit,
  monthly_message_limit = EXCLUDED.monthly_message_limit,
  features = EXCLUDED.features;

-- Update Pro Plan
INSERT INTO plans (id, name, price_monthly, price_yearly, contact_limit, monthly_message_limit, features, is_active)
VALUES (
  'pro',
  'Pro',
  22,
  220,
  1000,
  3000,
  '["dashboard", "landing_page_view", "landing_page_pub", "auto_follow_up", "reminder_global", "reminder_sms", "reminder_whatsapp", "email", "sms", "whatsapp", "analytics"]'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET
  contact_limit = EXCLUDED.contact_limit,
  monthly_message_limit = EXCLUDED.monthly_message_limit,
  features = EXCLUDED.features;
