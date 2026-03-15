import { describe, expect, it } from 'vitest'
import { countDueSoonTasks, isDueWithinDays, normalizeTaskStatus } from '@/lib/task-logic'

describe('normalizeTaskStatus', () => {
  it('normalizes legacy in_review status', () => {
    expect(normalizeTaskStatus('in_review')).toBe('review')
  })

  it('keeps valid status values', () => {
    expect(normalizeTaskStatus('todo')).toBe('todo')
    expect(normalizeTaskStatus('backlog')).toBe('backlog')
  })

  it('returns null for unknown status', () => {
    expect(normalizeTaskStatus('unknown_status')).toBeNull()
  })
})

describe('isDueWithinDays', () => {
  const now = new Date('2026-03-15T10:00:00.000Z')

  it('returns true for due date in next 3 days', () => {
    expect(isDueWithinDays('2026-03-18T09:00:00.000Z', 3, now)).toBe(true)
  })

  it('returns false for overdue tasks', () => {
    expect(isDueWithinDays('2026-03-14T23:59:59.000Z', 3, now)).toBe(false)
  })

  it('returns false for invalid date', () => {
    expect(isDueWithinDays('not-a-date', 3, now)).toBe(false)
  })
})

describe('countDueSoonTasks', () => {
  it('counts tasks due within threshold days', () => {
    const now = new Date('2026-03-15T10:00:00.000Z')
    const tasks = [
      { due_date: '2026-03-16T10:00:00.000Z' },
      { due_date: '2026-03-18T10:00:00.000Z' },
      { due_date: '2026-03-20T10:00:00.000Z' },
      { due_date: null },
    ]

    expect(countDueSoonTasks(tasks, 3, now)).toBe(2)
  })
})
