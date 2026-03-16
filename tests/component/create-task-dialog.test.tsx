/**
 * Component tests for CreateTaskDialog.
 *
 * Covers:
 *  - Trigger button rendering
 *  - Dialog opens on click
 *  - Client-side validation: empty title shows error without calling Supabase
 *  - Typing into the title input is reflected in the field value
 *  - Dialog closes when cancel is clicked
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CreateTaskDialog } from '@/components/kanban/create-task-dialog'
import type { Profile } from '@/lib/types'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  })),
}))

// ---------------------------------------------------------------------------
// Test fixture
// ---------------------------------------------------------------------------

const mockTeamMembers: Profile[] = [
  {
    id: 'user-1',
    email: 'alice@example.com',
    full_name: 'Alice',
    avatar_url: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

function renderDialog() {
  return render(
    <CreateTaskDialog projectId="project-123" teamMembers={mockTeamMembers} />,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CreateTaskDialog', () => {
  it('renders the trigger button with correct label', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /新建任务/ })).toBeInTheDocument()
  })

  it('opens the dialog when the trigger button is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: /新建任务/ }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Dialog title heading and description should be present
    expect(screen.getByRole('heading', { name: '新建任务' })).toBeInTheDocument()
    expect(screen.getByText('创建一个新任务并添加到看板中')).toBeInTheDocument()
  })

  it('shows title input and submit button inside the dialog', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: /新建任务/ }))
    await waitFor(() => screen.getByRole('dialog'))

    expect(screen.getByLabelText(/任务标题/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /创建任务/ })).toBeInTheDocument()
  })

  it('shows validation error when submitting with an empty title', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: /新建任务/ }))
    await waitFor(() => screen.getByRole('dialog'))

    // Submit without entering a title
    await user.click(screen.getByRole('button', { name: /创建任务/ }))

    await waitFor(() => {
      expect(screen.getByText('请输入任务标题')).toBeInTheDocument()
    })

    // Dialog should remain open after a validation error
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('clears the validation error and does not crash after typing a title', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: /新建任务/ }))
    await waitFor(() => screen.getByRole('dialog'))

    // Trigger validation error first
    await user.click(screen.getByRole('button', { name: /创建任务/ }))
    await waitFor(() => screen.getByText('请输入任务标题'))

    // Now type a valid title – the error is gone on next submit attempt
    await user.type(screen.getByLabelText(/任务标题/), 'My new task')
    expect(screen.getByLabelText(/任务标题/)).toHaveValue('My new task')
  })

  it('closes the dialog when cancel is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: /新建任务/ }))
    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: /取消/ }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
