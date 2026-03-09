-- 008_create_notifications.sql
-- 通知表

-- 创建通知类型枚举
do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type notification_type as enum (
      'task_assigned',
      'task_updated',
      'task_commented',
      'team_invited',
      'project_created',
      'deadline_reminder'
    );
  end if;
end
$$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  content text,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- 创建索引
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_is_read_idx on public.notifications(is_read);

-- 启用 RLS
alter table public.notifications enable row level security;

-- RLS 策略：用户只能查看自己的通知
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);

-- RLS 策略：系统可以插入通知（通过 service role）
-- 普通用户不能直接插入通知
create policy "notifications_insert_service" on public.notifications
  for insert with check (auth.uid() = user_id);

-- RLS 策略：用户只能更新自己的通知（标记已读）
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id);

-- RLS 策略：用户只能删除自己的通知
create policy "notifications_delete_own" on public.notifications
  for delete using (auth.uid() = user_id);
