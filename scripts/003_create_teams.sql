-- 003_create_teams.sql
-- 团队表（仅创建表结构，RLS 策略在 team_members 创建后添加）

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 启用 RLS
alter table public.teams enable row level security;

-- 基本 RLS 策略：创建、更新、删除（不依赖 team_members）
create policy "teams_insert_authenticated" on public.teams
  for insert with check (auth.uid() = owner_id);

create policy "teams_update_owner" on public.teams
  for update using (auth.uid() = owner_id);

create policy "teams_delete_owner" on public.teams
  for delete using (auth.uid() = owner_id);

-- 临时查看策略：所有者可以查看自己的团队
create policy "teams_select_owner" on public.teams
  for select using (owner_id = auth.uid());
