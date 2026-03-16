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

describe('任务状态配置（TASK_STATUS_CONFIG）', () => {
  const validStatuses: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done']

  it('应包含所有合法任务状态的配置项', () => {
    for (const status of validStatuses) {
      expect(TASK_STATUS_CONFIG).toHaveProperty(status)
    }
  })

  it('应包含 SQL 010 迁移要求的 backlog 与 review 状态', () => {
    expect(TASK_STATUS_CONFIG.backlog).toBeDefined()
    expect(TASK_STATUS_CONFIG.review).toBeDefined()
  })

  it('不应包含历史遗留状态 in_review', () => {
    expect(Object.keys(TASK_STATUS_CONFIG)).not.toContain('in_review')
  })

  it('每个状态配置都应具有非空 label 和 color', () => {
    for (const [, config] of Object.entries(TASK_STATUS_CONFIG)) {
      expect(config.label).toBeTruthy()
      expect(config.color).toBeTruthy()
    }
  })

  it('配置应严格覆盖预期的 5 个状态且无额外项', () => {
    expect(Object.keys(TASK_STATUS_CONFIG).sort()).toEqual(
      ['backlog', 'done', 'in_progress', 'review', 'todo'],
    )
  })
})

describe('任务优先级配置（TASK_PRIORITY_CONFIG）', () => {
  const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

  it('应包含所有合法优先级配置项', () => {
    for (const priority of validPriorities) {
      expect(TASK_PRIORITY_CONFIG).toHaveProperty(priority)
    }
  })

  it('每个优先级配置都应具有非空 label 和 color', () => {
    for (const [, config] of Object.entries(TASK_PRIORITY_CONFIG)) {
      expect(config.label).toBeTruthy()
      expect(config.color).toBeTruthy()
    }
  })
})

describe('项目状态配置（PROJECT_STATUS_CONFIG）', () => {
  const validStatuses: ProjectStatus[] = ['active', 'completed', 'archived']

  it('应包含所有项目状态配置项', () => {
    for (const status of validStatuses) {
      expect(PROJECT_STATUS_CONFIG).toHaveProperty(status)
    }
  })

  it('每个项目状态配置都应具有非空 label 和 color', () => {
    for (const [, config] of Object.entries(PROJECT_STATUS_CONFIG)) {
      expect(config.label).toBeTruthy()
      expect(config.color).toBeTruthy()
    }
  })
})

describe('团队角色配置（TEAM_ROLE_CONFIG）', () => {
  const validRoles: TeamRole[] = ['owner', 'admin', 'member']

  it('应包含所有团队角色配置项', () => {
    for (const role of validRoles) {
      expect(TEAM_ROLE_CONFIG).toHaveProperty(role)
    }
  })

  it('每个角色配置都应具有非空 label 和 description', () => {
    for (const [, config] of Object.entries(TEAM_ROLE_CONFIG)) {
      expect(config.label).toBeTruthy()
      expect(config.description).toBeTruthy()
    }
  })

  it('所有者角色文案应与管理员、成员保持区分', () => {
    expect(TEAM_ROLE_CONFIG.owner.label).not.toBe(TEAM_ROLE_CONFIG.admin.label)
    expect(TEAM_ROLE_CONFIG.owner.label).not.toBe(TEAM_ROLE_CONFIG.member.label)
  })
})
