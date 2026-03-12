-- 009_fix_team_members_rls_recursion.sql
-- 修复 team_members RLS 递归问题

-- 通过 SECURITY DEFINER 函数封装权限判断，避免在 policy 中直接查询 team_members 自身
create or replace function public.is_team_member(
  _team_id uuid,
  _user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = _team_id
      and tm.user_id = _user_id
  );
$$;

create or replace function public.is_team_admin_or_owner(
  _team_id uuid,
  _user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teams t
    where t.id = _team_id
      and t.owner_id = _user_id
  )
  or exists (
    select 1
    from public.team_members tm
    where tm.team_id = _team_id
      and tm.user_id = _user_id
      and tm.role in ('owner', 'admin')
  );
$$;

alter table public.team_members enable row level security;

drop policy if exists "team_members_select" on public.team_members;
create policy "team_members_select" on public.team_members
  for select using (
    public.is_team_member(team_members.team_id)
  );

drop policy if exists "team_members_insert" on public.team_members;
create policy "team_members_insert" on public.team_members
  for insert with check (
    public.is_team_admin_or_owner(team_members.team_id)
  );

drop policy if exists "team_members_update" on public.team_members;
create policy "team_members_update" on public.team_members
  for update using (
    public.is_team_admin_or_owner(team_members.team_id)
  )
  with check (
    public.is_team_admin_or_owner(team_members.team_id)
  );

drop policy if exists "team_members_delete" on public.team_members;
create policy "team_members_delete" on public.team_members
  for delete using (
    public.is_team_admin_or_owner(team_members.team_id)
    or user_id = auth.uid()
  );

drop policy if exists "teams_select_owner" on public.teams;
drop policy if exists "teams_select_member" on public.teams;
create policy "teams_select_member" on public.teams
  for select using (
    owner_id = auth.uid()
    or public.is_team_member(teams.id)
  );
