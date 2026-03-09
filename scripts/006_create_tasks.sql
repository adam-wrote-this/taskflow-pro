-- 006_create_tasks.sql
-- 任务表

-- 创建任务状态枚举类型
do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('todo', 'in_progress', 'in_review', 'done');
  end if;
end
$$;

-- 创建任务优先级枚举类型
do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type task_priority as enum ('low', 'medium', 'high', 'urgent');
  end if;
end
$$;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status task_status not null default 'todo',
  priority task_priority not null default 'medium',
  assignee_id uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id),
  due_date timestamp with time zone,
  position integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 创建索引以提高查询性能
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_assignee_id_idx on public.tasks(assignee_id);

-- 启用 RLS
alter table public.tasks enable row level security;

-- RLS 策略：团队成员可以查看任务
create policy "tasks_select_member" on public.tasks
  for select using (
    exists (
      select 1 from public.projects
      join public.team_members on team_members.team_id = projects.team_id
      where projects.id = tasks.project_id
      and team_members.user_id = auth.uid()
    )
  );

-- RLS 策略：团队成员可以创建任务
create policy "tasks_insert_member" on public.tasks
  for insert with check (
    exists (
      select 1 from public.projects
      join public.team_members on team_members.team_id = projects.team_id
      where projects.id = tasks.project_id
      and team_members.user_id = auth.uid()
    )
  );

-- RLS 策略：团队成员可以更新任务
create policy "tasks_update_member" on public.tasks
  for update using (
    exists (
      select 1 from public.projects
      join public.team_members on team_members.team_id = projects.team_id
      where projects.id = tasks.project_id
      and team_members.user_id = auth.uid()
    )
  );

-- RLS 策略：任务创建者或团队管理员可以删除任务
create policy "tasks_delete_creator_or_admin" on public.tasks
  for delete using (
    created_by = auth.uid()
    or exists (
      select 1 from public.projects
      join public.team_members on team_members.team_id = projects.team_id
      where projects.id = tasks.project_id
      and team_members.user_id = auth.uid()
      and team_members.role in ('owner', 'admin')
    )
  );
