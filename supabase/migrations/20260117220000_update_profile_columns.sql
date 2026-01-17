-- Add missing profile columns
alter table profiles 
add column if not exists title text,
add column if not exists phone text,
add column if not exists agency_name text,
add column if not exists license_no text,
add column if not exists bio text,
add column if not exists photo_url text;

-- Add comments for documentation
comment on column profiles.title is 'Professional title for display (e.g. Takaful Advisor)';
comment on column profiles.agency_name is 'Name of the agency the user belongs to';
comment on column profiles.license_no is 'Professional license number';
comment on column profiles.bio is 'Professional biography';
comment on column profiles.photo_url is 'URL to the profile photo';
