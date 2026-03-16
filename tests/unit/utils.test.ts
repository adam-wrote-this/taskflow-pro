import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('样式类名合并工具（cn）', () => {
  it('应合并类名并去重 Tailwind 冲突项', () => {
    expect(cn('text-sm', 'p-2', 'p-4')).toBe('text-sm p-4')
  })

  it('应忽略 falsy 值', () => {
    expect(cn('inline-flex', false && 'hidden', undefined)).toBe('inline-flex')
  })
})
