-- 007_create_comments.sql
-- 任务评论表

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 创建索引
create index if not exists comments_task_id_idx on public.comments(task_id);

-- 启用 RLS
alter table public.comments enable row level security;

-- RLS 策略：团队成员可以查看评论
create policy "comments_select_member" on public.comments
  for select using (
    exists (
      select 1 from public.tasks
      join public.projects on projects.id = tasks.project_id
      join public.team_members on team_members.team_id = projects.team_id
      where tasks.id = comments.task_id
      and team_members.user_id = auth.uid()
    )
  );

-- RLS 策略：团队成员可以添加评论
create policy "comments_insert_member" on public.comments
  for insert with check (
    exists (
      select 1 from public.tasks
      join public.projects on projects.id = tasks.project_id
      join public.team_members on team_members.team_id = projects.team_id
      where tasks.id = comments.task_id
      and team_members.user_id = auth.uid()
    )
    and auth.uid() = user_id
  );

-- RLS 策略：只有评论作者可以更新自己的评论
create policy "comments_update_own" on public.comments
  for update using (auth.uid() = user_id);

-- RLS 策略：评论作者或团队管理员可以删除评论
create policy "comments_delete_own_or_admin" on public.comments
  for delete using (
    auth.uid() = user_id
    or exists (
      select 1 from public.tasks
      join public.projects on projects.id = tasks.project_id
      join public.team_members on team_members.team_id = projects.team_id
      where tasks.id = comments.task_id
      and team_members.user_id = auth.uid()
      and team_members.role in ('owner', 'admin')
    )
  );
