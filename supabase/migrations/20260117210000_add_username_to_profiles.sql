-- Add username and publishing status to profiles
alter table profiles 
add column if not exists username text unique,
add column if not exists is_published boolean default false;

-- Create unique index for username lookups
create unique index if not exists idx_profiles_username on profiles(username) where username is not null;

-- Add comment for documentation
comment on column profiles.username is 'Unique username for public bio link URL (@username)';
comment on column profiles.is_published is 'Whether the landing page is published and publicly accessible';
