-- Create plans table
create table if not exists public.plans (
  id text primary key,
  name text not null,
  price_monthly numeric not null default 0,
  price_yearly numeric not null default 0,
  contact_limit int not null default 0,
  features jsonb not null default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.plans enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow public read access" on public.plans;
drop policy if exists "Allow super_admin insert" on public.plans;
drop policy if exists "Allow super_admin update" on public.plans;
drop policy if exists "Allow super_admin delete" on public.plans;

-- Policies
create policy "Allow public read access" on public.plans for select using (true);
create policy "Allow super_admin insert" on public.plans for insert with check (auth.uid() in (select id from profiles where role = 'super_admin'));
create policy "Allow super_admin update" on public.plans for update using (auth.uid() in (select id from profiles where role = 'super_admin'));
create policy "Allow super_admin delete" on public.plans for delete using (auth.uid() in (select id from profiles where role = 'super_admin'));

-- Seed Data (Upsert)
insert into public.plans (id, name, price_monthly, price_yearly, contact_limit, features)
values 
  ('free', 'Free Starter', 0, 0, 50, '["Email Only", "Dashboard", "Keep your client contact safe"]'),
  ('pro', 'Pro', 22, 220, 1000, '["WhatsApp, SMS, Email", "Auto Follow Up", "Auto Reminder", "Landing Page", "Analytics"]')
on conflict (id) do update 
set 
  name = excluded.name,
  price_monthly = excluded.price_monthly,
  price_yearly = excluded.price_yearly,
  contact_limit = excluded.contact_limit,
  features = excluded.features;
