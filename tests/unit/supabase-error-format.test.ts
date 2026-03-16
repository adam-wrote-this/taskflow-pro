import { describe, expect, it } from 'vitest'
import { formatDbSetupError } from '@/lib/supabase/error-format'

describe('数据库初始化错误文案格式化（formatDbSetupError）', () => {
  it('遇到 schema cache 错误码时应返回初始化引导文案', () => {
    const result = formatDbSetupError({
      message: 'some message',
      code: 'PGRST205',
    })

    expect(result).toContain('数据库未初始化')
  })

  it('遇到 schema cache 错误文本时应返回初始化引导文案', () => {
    const result = formatDbSetupError({
      message: "Could not find the table 'public.teams' in the schema cache",
    })

    expect(result).toContain('scripts/001 到 scripts/008')
  })

  it('未知错误应透传原始消息', () => {
    const result = formatDbSetupError({
      message: 'permission denied for table teams',
      code: '42501',
    })

    expect(result).toBe('permission denied for table teams')
  })
})
