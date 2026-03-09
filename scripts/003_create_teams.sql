-- 003_create_teams.sql
-- 团队表

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

-- RLS 策略：团队成员可以查看团队
create policy "teams_select_member" on public.teams
  for select using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = teams.id
      and team_members.user_id = auth.uid()
    )
    or owner_id = auth.uid()
  );

-- RLS 策略：任何登录用户可以创建团队
create policy "teams_insert_authenticated" on public.teams
  for insert with check (auth.uid() = owner_id);

-- RLS 策略：只有团队所有者可以更新团队
create policy "teams_update_owner" on public.teams
  for update using (auth.uid() = owner_id);

-- RLS 策略：只有团队所有者可以删除团队
create policy "teams_delete_owner" on public.teams
  for delete using (auth.uid() = owner_id);
