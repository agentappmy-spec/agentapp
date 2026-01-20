-- Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule the 'check-auto-followups' function to run every hour
-- NOTE: You must replace 'REPLACE_WITH_YOUR_SERVICE_ROLE_KEY' with your actual Supabase Service Role Key.
-- You can find this in Supabase Dashboard -> Project Settings -> API -> service_role secret.

select
  cron.schedule(
    'check-auto-followups-hourly', -- Job name
    '0 * * * *',                   -- Schedule: Every hour at minute 0
    $$
    select
      net.http_post(
          url:='https://nywvatykietyhbhugcbl.supabase.co/functions/v1/check-auto-followups',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer REPLACE_WITH_YOUR_SERVICE_ROLE_KEY"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
  );
