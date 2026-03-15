import type { Task, TaskStatus } from '@/lib/types'

const VALID_TASK_STATUSES: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done']

export function normalizeTaskStatus(rawStatus: string): TaskStatus | null {
  const normalized = rawStatus === 'in_review' ? 'review' : rawStatus

  return (VALID_TASK_STATUSES as string[]).includes(normalized)
    ? (normalized as TaskStatus)
    : null
}

export function isDueWithinDays(
  dueDate: string | null | undefined,
  days: number,
  now = new Date(),
): boolean {
  if (!dueDate) return false

  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return false
  if (due.getTime() < now.getTime()) return false

  const msPerDay = 1000 * 60 * 60 * 24
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / msPerDay)

  return diffDays <= days
}

export function countDueSoonTasks(
  tasks: Array<Pick<Task, 'due_date'>>,
  days = 3,
  now = new Date(),
): number {
  return tasks.filter((task) => isDueWithinDays(task.due_date, days, now)).length
}
