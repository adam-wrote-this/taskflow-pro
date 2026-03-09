-- 001_create_profiles.sql
-- 用户资料表

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 启用 RLS
alter table public.profiles enable row level security;

-- RLS 策略：用户可以查看所有用户资料（用于团队成员显示）
create policy "profiles_select_all" on public.profiles
  for select using (true);

-- RLS 策略：用户只能插入自己的资料
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- RLS 策略：用户只能更新自己的资料
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- RLS 策略：用户只能删除自己的资料
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);
