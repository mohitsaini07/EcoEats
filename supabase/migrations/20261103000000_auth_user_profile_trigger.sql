-- Migration: Automatically create public.users profile on auth.users insert
-- Ensures every registered user has a public.users profile with role = 'CUSTOMER'.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    'CUSTOMER'
  )
  on conflict (id) do update
  set name = case when public.users.name is null or public.users.name = '' then excluded.name else public.users.name end,
      email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

