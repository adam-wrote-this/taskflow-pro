import { describe, expect, it } from 'vitest'
import { formatDbSetupError } from '@/lib/supabase/error-format'

describe('formatDbSetupError', () => {
  it('returns setup guide message for schema cache error code', () => {
    const result = formatDbSetupError({
      message: 'some message',
      code: 'PGRST205',
    })

    expect(result).toContain('数据库未初始化')
  })

  it('returns setup guide message for schema cache error text', () => {
    const result = formatDbSetupError({
      message: "Could not find the table 'public.teams' in the schema cache",
    })

    expect(result).toContain('scripts/001 到 scripts/008')
  })

  it('passes through unknown errors', () => {
    const result = formatDbSetupError({
      message: 'permission denied for table teams',
      code: '42501',
    })

    expect(result).toBe('permission denied for table teams')
  })
})
