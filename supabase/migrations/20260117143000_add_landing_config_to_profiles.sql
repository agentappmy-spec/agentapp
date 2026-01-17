alter table profiles 
add column if not exists landing_config jsonb default null;
