-- Create the function that will be called by the trigger
create or replace function public.trigger_auto_followup_on_insert()
returns trigger
language plpgsql
security definer
as $$
declare
  response_id bigint;
begin
  -- Call the Edge Function immediately for the new contact
  select
    net.http_post(
        url:='https://nywvatykietyhbhugcbl.supabase.co/functions/v1/check-auto-followups',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55d3ZhdHlraWV0eWhiaHVnY2JsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIyMTQ4MywiZXhwIjoyMDgzNzk3NDgzfQ.SWYoFd-nPa13F6t2hUdJSQjC1Y8AQRAmGZ3ir8I2cLM"}'::jsonb,
        body:=jsonb_build_object('contact_id', NEW.id)
    ) into response_id;

  return NEW;
end;
$$;

-- Create the trigger on the contacts table
drop trigger if exists on_contact_created_auto_followup on public.contacts;

create trigger on_contact_created_auto_followup
after insert on public.contacts
for each row
execute function public.trigger_auto_followup_on_insert();
