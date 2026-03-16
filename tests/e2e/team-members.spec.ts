import { expect, test, type Page } from '@playwright/test'

const hasAuthCredentials =
  Boolean(process.env.E2E_USER_EMAIL) && Boolean(process.env.E2E_USER_PASSWORD)
const runWriteFlows = process.env.E2E_ENABLE_WRITE_TESTS === '1'

/**
 * Second "invite target" account – optional. Needed only for the invite test.
 * When absent, the invite test is skipped.
 */
const hasSecondUser =
  Boolean(process.env.E2E_SECOND_USER_EMAIL)

async function signIn(page: Page) {
  await page.goto('/auth/login')
  await page.locator('input[name="email"]').fill(process.env.E2E_USER_EMAIL || '')
  await page.locator('input[name="password"]').fill(process.env.E2E_USER_PASSWORD || '')
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 })
}

/**
 * Team member management – invite / role change / remove.
 *
 * Requires:
 *   E2E_USER_EMAIL + E2E_USER_PASSWORD   (owner account)
 *   E2E_ENABLE_WRITE_TESTS=1             (write permission)
 *   E2E_SECOND_USER_EMAIL                (target account for invite, optional)
 */
test.describe.serial('团队成员管理（Team member management）', () => {
  test.skip(
    !hasAuthCredentials || !runWriteFlows,
    'Set E2E_USER_EMAIL, E2E_USER_PASSWORD and E2E_ENABLE_WRITE_TESTS=1 to run member-management tests.',
  )

  let teamUrl = ''

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await signIn(page)

    const teamName = `Members Team ${Date.now()}`
    await page.goto('/dashboard/teams/new')
    await page.locator('input[name="name"]').fill(teamName)
    await page.locator('form button[type="submit"]').click()
    await page.waitForURL(/\/dashboard\/teams\/[^/]+$/, { timeout: 15_000 })
    teamUrl = page.url()

    await context.close()
  })

  test('团队所有者在团队页可以看到邀请成员按钮', async ({ page }) => {
    await signIn(page)
    await page.goto(teamUrl)

    await expect(page.getByRole('button', { name: /邀请|Invite/i })).toBeVisible()
  })

  test('邀请弹窗可打开且显示邮箱与角色字段', async ({ page }) => {
    await signIn(page)
    await page.goto(teamUrl)

    await page.getByRole('button', { name: /邀请|Invite/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await expect(dialog.getByLabel(/邮箱地址|Email/i)).toBeVisible()
    // Role selector should be present
    await expect(dialog.getByRole('button', { name: /成员|Member/i })).toBeVisible()
  })

  test('邀请弹窗在邮箱为空时会显示错误提示', async ({ page }) => {
    await signIn(page)
    await page.goto(teamUrl)

    await page.getByRole('button', { name: /邀请|Invite/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Submit without entering an email
    await page.getByRole('button', { name: /发送邀请|Send Invite/i }).click()

    await expect(page.getByText(/请输入邮箱地址/)).toBeVisible()
  })

  test('第二账号门控：可以邀请已存在用户为成员', async ({ page }) => {
    test.skip(
      !hasSecondUser,
      'Set E2E_SECOND_USER_EMAIL to run invite-by-email test.',
    )

    await signIn(page)
    await page.goto(teamUrl)

    await page.getByRole('button', { name: /邀请|Invite/i }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel(/邮箱地址|Email/i).fill(process.env.E2E_SECOND_USER_EMAIL || '')
    await page.getByRole('button', { name: /发送邀请|Send Invite/i }).click()

    // Dialog should close and new member should appear in the list
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(process.env.E2E_SECOND_USER_EMAIL || '')).toBeVisible({
      timeout: 10_000,
    })
  })

  test('第二账号门控：所有者可以修改成员角色', async ({ page }) => {
    test.skip(
      !hasSecondUser,
      'Set E2E_SECOND_USER_EMAIL to run role-change test.',
    )

    await signIn(page)
    await page.goto(teamUrl)

    // Find the member row by email and open the action menu
    const memberRow = page.getByText(process.env.E2E_SECOND_USER_EMAIL || '').locator('..').locator('..')
    await memberRow.getByRole('button').click()

    // Click "设为管理员" or equivalent role-change option
    const adminOption = page.getByRole('menuitem', { name: /设为管理员|Make Admin/i })
    await expect(adminOption).toBeVisible()
    await adminOption.click()

    // Should display admin role for that member
    await expect(page.getByText(/管理员|Admin/i)).toBeVisible({ timeout: 8_000 })
  })

  test('第二账号门控：所有者可以移除成员', async ({ page }) => {
    test.skip(
      !hasSecondUser,
      'Set E2E_SECOND_USER_EMAIL to run remove-member test.',
    )

    await signIn(page)
    await page.goto(teamUrl)

    const memberRow = page.getByText(process.env.E2E_SECOND_USER_EMAIL || '').locator('..').locator('..')
    await memberRow.getByRole('button').click()

    // Click remove option
    await page.getByRole('menuitem', { name: /移除|Remove/i }).click()

    // Confirmation dialog
    const confirmDialog = page.getByRole('alertdialog')
    await expect(confirmDialog).toBeVisible()
    await confirmDialog.getByRole('button', { name: /移除|确认|Confirm/i }).click()

    // Member email should no longer appear in the list
    await expect(
      page.getByText(process.env.E2E_SECOND_USER_EMAIL || ''),
    ).not.toBeVisible({ timeout: 10_000 })
  })
})
