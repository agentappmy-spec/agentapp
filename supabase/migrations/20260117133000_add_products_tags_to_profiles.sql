alter table profiles 
add column if not exists products text[] default '{}',
add column if not exists tags text[] default '{}';
