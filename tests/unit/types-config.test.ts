import { describe, expect, it } from 'vitest'
import {
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  PROJECT_STATUS_CONFIG,
  TEAM_ROLE_CONFIG,
  type TaskStatus,
  type TaskPriority,
  type ProjectStatus,
  type TeamRole,
} from '@/lib/types'

describe('TASK_STATUS_CONFIG', () => {
  const validStatuses: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done']

  it('has entries for all valid statuses', () => {
    for (const status of validStatuses) {
      expect(TASK_STATUS_CONFIG).toHaveProperty(status)
    }
  })

  it('includes backlog and review statuses required by SQL migration 010', () => {
    expect(TASK_STATUS_CONFIG.backlog).toBeDefined()
    expect(TASK_STATUS_CONFIG.review).toBeDefined()
  })

  it('does not include the legacy in_review status', () => {
    expect(Object.keys(TASK_STATUS_CONFIG)).not.toContain('in_review')
  })

  it('all entries have non-empty label and color', () => {
    for (const [, config] of Object.entries(TASK_STATUS_CONFIG)) {
      expect(config.label).toBeTruthy()
      expect(config.color).toBeTruthy()
    }
  })

  it('config covers exactly the 5 expected statuses and no extras', () => {
    expect(Object.keys(TASK_STATUS_CONFIG).sort()).toEqual(
      ['backlog', 'done', 'in_progress', 'review', 'todo'],
    )
  })
})

describe('TASK_PRIORITY_CONFIG', () => {
  const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

  it('has entries for all valid priorities', () => {
    for (const priority of validPriorities) {
      expect(TASK_PRIORITY_CONFIG).toHaveProperty(priority)
    }
  })

  it('all entries have non-empty label and color', () => {
    for (const [, config] of Object.entries(TASK_PRIORITY_CONFIG)) {
      expect(config.label).toBeTruthy()
      expect(config.color).toBeTruthy()
    }
  })
})

describe('PROJECT_STATUS_CONFIG', () => {
  const validStatuses: ProjectStatus[] = ['active', 'completed', 'archived']

  it('has entries for all project statuses', () => {
    for (const status of validStatuses) {
      expect(PROJECT_STATUS_CONFIG).toHaveProperty(status)
    }
  })

  it('all entries have non-empty label and color', () => {
    for (const [, config] of Object.entries(PROJECT_STATUS_CONFIG)) {
      expect(config.label).toBeTruthy()
      expect(config.color).toBeTruthy()
    }
  })
})

describe('TEAM_ROLE_CONFIG', () => {
  const validRoles: TeamRole[] = ['owner', 'admin', 'member']

  it('has entries for all team roles', () => {
    for (const role of validRoles) {
      expect(TEAM_ROLE_CONFIG).toHaveProperty(role)
    }
  })

  it('all entries have non-empty label and description', () => {
    for (const [, config] of Object.entries(TEAM_ROLE_CONFIG)) {
      expect(config.label).toBeTruthy()
      expect(config.description).toBeTruthy()
    }
  })

  it('owner role is distinct from admin and member', () => {
    expect(TEAM_ROLE_CONFIG.owner.label).not.toBe(TEAM_ROLE_CONFIG.admin.label)
    expect(TEAM_ROLE_CONFIG.owner.label).not.toBe(TEAM_ROLE_CONFIG.member.label)
  })
})
