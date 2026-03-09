-- 005_create_projects.sql
-- 项目表

-- 创建项目状态枚举类型
do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_status') then
    create type project_status as enum ('active', 'archived', 'completed');
  end if;
end
$$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  description text,
  status project_status not null default 'active',
  created_by uuid not null references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 启用 RLS
alter table public.projects enable row level security;

-- RLS 策略：团队成员可以查看项目
create policy "projects_select_member" on public.projects
  for select using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = projects.team_id
      and team_members.user_id = auth.uid()
    )
  );

-- RLS 策略：团队成员可以创建项目
create policy "projects_insert_member" on public.projects
  for insert with check (
    exists (
      select 1 from public.team_members
      where team_members.team_id = projects.team_id
      and team_members.user_id = auth.uid()
    )
  );

-- RLS 策略：团队所有者或管理员可以更新项目
create policy "projects_update_admin" on public.projects
  for update using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = projects.team_id
      and team_members.user_id = auth.uid()
      and team_members.role in ('owner', 'admin')
    )
    or exists (
      select 1 from public.teams
      where teams.id = projects.team_id
      and teams.owner_id = auth.uid()
    )
  );

-- RLS 策略：团队所有者可以删除项目
create policy "projects_delete_owner" on public.projects
  for delete using (
    exists (
      select 1 from public.teams
      where teams.id = projects.team_id
      and teams.owner_id = auth.uid()
    )
  );
