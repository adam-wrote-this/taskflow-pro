import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names and deduplicates tailwind conflicts', () => {
    expect(cn('text-sm', 'p-2', 'p-4')).toBe('text-sm p-4')
  })

  it('omits falsy values', () => {
    expect(cn('inline-flex', false && 'hidden', undefined)).toBe('inline-flex')
  })
})
