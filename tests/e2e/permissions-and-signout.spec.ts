import { expect, test, type Page } from '@playwright/test'

const hasAuthCredentials =
  Boolean(process.env.E2E_USER_EMAIL) && Boolean(process.env.E2E_USER_PASSWORD)

async function signIn(page: Page) {
  await page.goto('/auth/login')
  await page.locator('input[name="email"]').fill(process.env.E2E_USER_EMAIL || '')
  await page.locator('input[name="password"]').fill(process.env.E2E_USER_PASSWORD || '')
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 })
}

test.describe('Sign-out flow', () => {
  test.skip(
    !hasAuthCredentials,
    'Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run sign-out tests.',
  )

  test('authenticated user can sign out and is redirected to home page', async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL(/\/dashboard/)

    // Open user menu dropdown in the header
    const userMenuTrigger = page.locator('header').getByRole('button').filter({
      has: page.locator('.rounded-full'),
    }).first()
    await userMenuTrigger.click()

    // Click the logout menu item
    const logoutItem = page.getByRole('menuitem', { name: /退出登录|Log out/i })
    await expect(logoutItem).toBeVisible()
    await logoutItem.click()

    // After sign-out, should be redirected away from dashboard
    await expect(page).not.toHaveURL(/\/dashboard/, { timeout: 10_000 })
  })

  test('after sign-out, visiting dashboard redirects to login', async ({ page }) => {
    await signIn(page)

    // Sign out via the user menu
    const userMenuTrigger = page.locator('header').getByRole('button').filter({
      has: page.locator('.rounded-full'),
    }).first()
    await userMenuTrigger.click()
    await page.getByRole('menuitem', { name: /退出登录|Log out/i }).click()
    await page.waitForURL(/^(?!.*\/dashboard).*$/, { timeout: 10_000 })

    // Now navigate to dashboard — should be redirected to login
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})

test.describe('Route permission guards', () => {
  test('unauthenticated user cannot access /dashboard/teams', async ({ page }) => {
    await page.goto('/dashboard/teams')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('unauthenticated user cannot access /dashboard/projects', async ({ page }) => {
    await page.goto('/dashboard/projects')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('unauthenticated user cannot access /dashboard/settings', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('unauthenticated user cannot access /dashboard/teams/new', async ({ page }) => {
    await page.goto('/dashboard/teams/new')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('unauthenticated user cannot access /dashboard/projects/new', async ({ page }) => {
    await page.goto('/dashboard/projects/new')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('unauthenticated user visiting an unknown team ID is redirected to login', async ({ page }) => {
    await page.goto('/dashboard/teams/non-existent-team-id-000')
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
