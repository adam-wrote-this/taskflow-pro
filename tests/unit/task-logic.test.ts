import { describe, expect, it } from 'vitest'
import { countDueSoonTasks, isDueWithinDays, normalizeTaskStatus } from '@/lib/task-logic'

describe('任务状态归一化（normalizeTaskStatus）', () => {
  it('应将历史 in_review 状态归一化为 review', () => {
    expect(normalizeTaskStatus('in_review')).toBe('review')
  })

  it('应保留合法状态值不变', () => {
    expect(normalizeTaskStatus('todo')).toBe('todo')
    expect(normalizeTaskStatus('backlog')).toBe('backlog')
  })

  it('未知状态应返回 null', () => {
    expect(normalizeTaskStatus('unknown_status')).toBeNull()
  })
})

describe('截止日期窗口判断（isDueWithinDays）', () => {
  const now = new Date('2026-03-15T10:00:00.000Z')

  it('截止日期在未来 3 天内时应返回 true', () => {
    expect(isDueWithinDays('2026-03-18T09:00:00.000Z', 3, now)).toBe(true)
  })

  it('已过期任务应返回 false', () => {
    expect(isDueWithinDays('2026-03-14T23:59:59.000Z', 3, now)).toBe(false)
  })

  it('非法日期字符串应返回 false', () => {
    expect(isDueWithinDays('not-a-date', 3, now)).toBe(false)
  })
})

describe('临近截止任务计数（countDueSoonTasks）', () => {
  it('应统计在阈值天数内即将截止的任务数量', () => {
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
