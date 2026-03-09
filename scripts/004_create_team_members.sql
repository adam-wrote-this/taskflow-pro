-- 004_create_team_members.sql
-- 团队成员关联表

-- 创建角色枚举类型
do $$
begin
  if not exists (select 1 from pg_type where typname = 'team_role') then
    create type team_role as enum ('owner', 'admin', 'member');
  end if;
end
$$;

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role team_role not null default 'member',
  joined_at timestamp with time zone default now(),
  unique(team_id, user_id)
);

-- 启用 RLS
alter table public.team_members enable row level security;

-- RLS 策略：团队成员可以查看同团队的成员
create policy "team_members_select" on public.team_members
  for select using (
    exists (
      select 1 from public.team_members as tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
    )
  );

-- RLS 策略：团队所有者或管理员可以添加成员
create policy "team_members_insert" on public.team_members
  for insert with check (
    exists (
      select 1 from public.teams
      where teams.id = team_members.team_id
      and teams.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.team_members as tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin')
    )
  );

-- RLS 策略：团队所有者或管理员可以更新成员角色
create policy "team_members_update" on public.team_members
  for update using (
    exists (
      select 1 from public.teams
      where teams.id = team_members.team_id
      and teams.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.team_members as tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin')
    )
  );

-- RLS 策略：团队所有者或管理员可以移除成员
create policy "team_members_delete" on public.team_members
  for delete using (
    exists (
      select 1 from public.teams
      where teams.id = team_members.team_id
      and teams.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.team_members as tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin')
    )
    or user_id = auth.uid() -- 用户可以自己退出团队
  );
