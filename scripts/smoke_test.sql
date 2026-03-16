-- =============================================================================
-- TaskFlow Pro – SQL Smoke Tests
--
-- Purpose: Quickly verify that all migration scripts (001–010) have been
--          applied correctly by inspecting schema and enum state.
--
-- Run against your test/development Supabase database:
--   psql $DATABASE_URL -f scripts/smoke_test.sql
--
-- Pass = no rows in the FAILED section at the end.
-- =============================================================================

-- Temporary results table
CREATE TEMP TABLE smoke_results (
  test_id   SERIAL PRIMARY KEY,
  test_name TEXT    NOT NULL,
  status    TEXT    NOT NULL,  -- 'PASS' | 'FAIL'
  detail    TEXT
);

-- ---------------------------------------------------------------------------
-- Helper: assert a boolean expression
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION smoke_assert(
  p_name   TEXT,
  p_result BOOLEAN,
  p_detail TEXT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO smoke_results (test_name, status, detail)
  VALUES (
    p_name,
    CASE WHEN p_result THEN 'PASS' ELSE 'FAIL' END,
    p_detail
  );
END;
$$;

-- =============================================================================
-- 1. Table existence (scripts/001–008)
-- =============================================================================

SELECT smoke_assert(
  '001 profiles table exists',
  EXISTS (SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'profiles')
);

SELECT smoke_assert(
  '003 teams table exists',
  EXISTS (SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'teams')
);

SELECT smoke_assert(
  '004 team_members table exists',
  EXISTS (SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'team_members')
);

SELECT smoke_assert(
  '005 projects table exists',
  EXISTS (SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'projects')
);

SELECT smoke_assert(
  '006 tasks table exists',
  EXISTS (SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'tasks')
);

SELECT smoke_assert(
  '007 comments table exists',
  EXISTS (SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'comments')
);

SELECT smoke_assert(
  '008 notifications table exists',
  EXISTS (SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'notifications')
);

-- =============================================================================
-- 2. Critical column presence
-- =============================================================================

SELECT smoke_assert(
  'profiles.full_name column exists',
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'profiles'
            AND column_name = 'full_name')
);

SELECT smoke_assert(
  'teams.owner_id column exists',
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'teams'
            AND column_name = 'owner_id')
);

SELECT smoke_assert(
  'team_members.role column exists',
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'team_members'
            AND column_name = 'role')
);

SELECT smoke_assert(
  'tasks.position column exists',
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'tasks'
            AND column_name = 'position')
);

SELECT smoke_assert(
  'tasks.due_date column exists',
  EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'tasks'
            AND column_name = 'due_date')
);

-- =============================================================================
-- 3. task_status enum (scripts/006 + script/010)
-- =============================================================================

SELECT smoke_assert(
  '010 task_status enum contains "backlog"',
  EXISTS (SELECT 1 FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
          WHERE t.typname = 'task_status' AND e.enumlabel = 'backlog')
);

SELECT smoke_assert(
  '010 task_status enum contains "review" (not in_review)',
  EXISTS (SELECT 1 FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
          WHERE t.typname = 'task_status' AND e.enumlabel = 'review')
);

SELECT smoke_assert(
  '010 task_status enum does NOT contain legacy "in_review"',
  NOT EXISTS (SELECT 1 FROM pg_enum e
              JOIN pg_type t ON t.oid = e.enumtypid
              WHERE t.typname = 'task_status' AND e.enumlabel = 'in_review')
);

SELECT smoke_assert(
  '010 task_status enum contains "todo"',
  EXISTS (SELECT 1 FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
          WHERE t.typname = 'task_status' AND e.enumlabel = 'todo')
);

SELECT smoke_assert(
  '010 task_status enum contains "in_progress"',
  EXISTS (SELECT 1 FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
          WHERE t.typname = 'task_status' AND e.enumlabel = 'in_progress')
);

SELECT smoke_assert(
  '010 task_status enum contains "done"',
  EXISTS (SELECT 1 FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
          WHERE t.typname = 'task_status' AND e.enumlabel = 'done')
);

-- No obsolete in_review values remain in tasks table
SELECT smoke_assert(
  '010 tasks table has zero rows with status = in_review',
  NOT EXISTS (
    SELECT 1 FROM tasks
    WHERE status::text = 'in_review'
    LIMIT 1
  )
);

-- =============================================================================
-- 4. team_role enum
-- =============================================================================

SELECT smoke_assert(
  'team_role enum contains "owner"',
  EXISTS (SELECT 1 FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
          WHERE t.typname = 'team_role' AND e.enumlabel = 'owner')
);

SELECT smoke_assert(
  'team_role enum contains "admin"',
  EXISTS (SELECT 1 FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
          WHERE t.typname = 'team_role' AND e.enumlabel = 'admin')
);

SELECT smoke_assert(
  'team_role enum contains "member"',
  EXISTS (SELECT 1 FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
          WHERE t.typname = 'team_role' AND e.enumlabel = 'member')
);

-- =============================================================================
-- 5. Row Level Security enabled (scripts/009)
-- =============================================================================

SELECT smoke_assert(
  '009 RLS enabled on teams',
  (SELECT relrowsecurity FROM pg_class
   WHERE relname = 'teams' AND relnamespace = 'public'::regnamespace)
);

SELECT smoke_assert(
  '009 RLS enabled on team_members',
  (SELECT relrowsecurity FROM pg_class
   WHERE relname = 'team_members' AND relnamespace = 'public'::regnamespace)
);

SELECT smoke_assert(
  '009 RLS enabled on projects',
  (SELECT relrowsecurity FROM pg_class
   WHERE relname = 'projects' AND relnamespace = 'public'::regnamespace)
);

SELECT smoke_assert(
  '009 RLS enabled on tasks',
  (SELECT relrowsecurity FROM pg_class
   WHERE relname = 'tasks' AND relnamespace = 'public'::regnamespace)
);

-- =============================================================================
-- 6. Profile trigger (script/002)
-- =============================================================================

SELECT smoke_assert(
  '002 handle_new_user trigger exists on auth.users',
  EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_schema = 'public'
      AND trigger_name ILIKE '%new_user%'
  )
  OR
  EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE c.relname = 'users' AND t.tgname ILIKE '%new_user%'
  )
);

-- =============================================================================
-- Results summary
-- =============================================================================

SELECT
  status,
  COUNT(*) AS total,
  ARRAY_AGG(test_name ORDER BY test_id) AS tests
FROM smoke_results
GROUP BY status
ORDER BY status;

-- Fail fast: show failures prominently
SELECT
  test_id,
  test_name,
  detail
FROM smoke_results
WHERE status = 'FAIL'
ORDER BY test_id;

DO $$
DECLARE
  fail_count INT;
BEGIN
  SELECT COUNT(*) INTO fail_count FROM smoke_results WHERE status = 'FAIL';
  IF fail_count > 0 THEN
    RAISE EXCEPTION 'Smoke tests FAILED: % failure(s) detected.', fail_count;
  ELSE
    RAISE NOTICE 'All smoke tests PASSED.';
  END IF;
END;
$$;
