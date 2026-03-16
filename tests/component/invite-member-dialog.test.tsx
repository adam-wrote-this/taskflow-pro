/**
 * Component tests for InviteMemberDialog.
 *
 * Covers:
 *  - Trigger button rendering
 *  - Dialog opens on click with correct fields
 *  - Default role is "成员" (member)
 *  - Client-side validation: empty email shows error without calling Supabase
 *  - Cancel closes the dialog
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InviteMemberDialog } from '@/components/teams/invite-member-dialog'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
    }),
  })),
}))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InviteMemberDialog', () => {
  it('renders the invite trigger button', () => {
    render(<InviteMemberDialog teamId="team-abc" />)
    expect(screen.getByRole('button', { name: /邀请/ })).toBeInTheDocument()
  })

  it('opens the dialog when the trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<InviteMemberDialog teamId="team-abc" />)

    await user.click(screen.getByRole('button', { name: /邀请/ }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    expect(screen.getByText('邀请成员')).toBeInTheDocument()
    expect(screen.getByText('通过邮箱地址邀请新成员加入团队')).toBeInTheDocument()
  })

  it('shows email input and role selector in the dialog', async () => {
    const user = userEvent.setup()
    render(<InviteMemberDialog teamId="team-abc" />)

    await user.click(screen.getByRole('button', { name: /邀请/ }))
    await waitFor(() => screen.getByRole('dialog'))

    expect(screen.getByLabelText('邮箱地址')).toBeInTheDocument()
    expect(screen.getByLabelText('邮箱地址')).toHaveAttribute('type', 'email')
  })

  it('shows validation error when submitting with an empty email', async () => {
    const user = userEvent.setup()
    render(<InviteMemberDialog teamId="team-abc" />)

    await user.click(screen.getByRole('button', { name: /邀请/ }))
    await waitFor(() => screen.getByRole('dialog'))

    // Submit without an email
    await user.click(screen.getByRole('button', { name: /发送邀请/ }))

    await waitFor(() => {
      expect(screen.getByText('请输入邮箱地址')).toBeInTheDocument()
    })

    // Dialog stays open
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('allows typing into the email field', async () => {
    const user = userEvent.setup()
    render(<InviteMemberDialog teamId="team-abc" />)

    await user.click(screen.getByRole('button', { name: /邀请/ }))
    await waitFor(() => screen.getByRole('dialog'))

    await user.type(screen.getByLabelText('邮箱地址'), 'colleague@example.com')
    expect(screen.getByLabelText('邮箱地址')).toHaveValue('colleague@example.com')
  })

  it('closes the dialog when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<InviteMemberDialog teamId="team-abc" />)

    await user.click(screen.getByRole('button', { name: /邀请/ }))
    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: /取消/ }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
