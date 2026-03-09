-- 002_profile_trigger.sql
-- 自动创建用户资料触发器

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- 删除旧触发器（如果存在）
drop trigger if exists on_auth_user_created on auth.users;

-- 创建新触发器
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
