-- 010_fix_task_status_enum_mismatch.sql
-- 修复 task_status 枚举与前端状态不一致（backlog/review）

do $$
begin
  -- 若同时存在 in_review 与 review，先将历史数据归一化到 review
  if exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    join pg_enum e on e.enumtypid = t.oid
    where n.nspname = 'public'
      and t.typname = 'task_status'
      and e.enumlabel = 'in_review'
  )
  and exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    join pg_enum e on e.enumtypid = t.oid
    where n.nspname = 'public'
      and t.typname = 'task_status'
      and e.enumlabel = 'review'
  ) then
    update public.tasks
    set status = 'review'
    where status = 'in_review';
  end if;

  -- 当 review 尚不存在时，直接把枚举值 in_review 改名为 review
  if exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    join pg_enum e on e.enumtypid = t.oid
    where n.nspname = 'public'
      and t.typname = 'task_status'
      and e.enumlabel = 'in_review'
  )
  and not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    join pg_enum e on e.enumtypid = t.oid
    where n.nspname = 'public'
      and t.typname = 'task_status'
      and e.enumlabel = 'review'
  ) then
    execute 'alter type public.task_status rename value ''in_review'' to ''review''';
  end if;

  -- 新增 backlog 状态（放在 todo 前，便于看板排序）
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    join pg_enum e on e.enumtypid = t.oid
    where n.nspname = 'public'
      and t.typname = 'task_status'
      and e.enumlabel = 'backlog'
  ) then
    execute 'alter type public.task_status add value ''backlog'' before ''todo''';
  end if;
end
$$;
