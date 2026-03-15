import { expect, test, type Page } from '@playwright/test'

const hasAuthCredentials =
  Boolean(process.env.E2E_USER_EMAIL) && Boolean(process.env.E2E_USER_PASSWORD)
const runWriteFlows = process.env.E2E_ENABLE_WRITE_TESTS === '1'

async function signIn(page: Page) {
  await page.goto('/auth/login')
  await page.locator('input[name="email"]').fill(process.env.E2E_USER_EMAIL || '')
  await page.locator('input[name="password"]').fill(process.env.E2E_USER_PASSWORD || '')
  await page.locator('form button[type="submit"]').click()
}

test.describe('Authenticated dashboard flow', () => {
  test.skip(
    !hasAuthCredentials,
    'Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run authenticated flow tests.',
  )

  test('user sees an error on invalid login password', async ({ page }) => {
    await page.goto('/auth/login')

    await page.locator('input[name="email"]').fill(process.env.E2E_USER_EMAIL || '')
    await page.locator('input[name="password"]').fill(`${process.env.E2E_USER_PASSWORD || ''}-wrong`)
    await page.locator('form button[type="submit"]').click()

    await expect(page).toHaveURL(/\/auth\/login/)
    const errorBox = page.locator('form div.text-destructive').first()
    await expect(errorBox).toBeVisible()
    await expect(errorBox).not.toHaveText('')
  })

  test('user can sign in and reach dashboard', async ({ page }) => {
    await signIn(page)

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('main')).toBeVisible()
  })

  test('authenticated user can create a team', async ({ page }) => {
    test.skip(
      !runWriteFlows,
      'Set E2E_ENABLE_WRITE_TESTS=1 to run team creation flow tests.',
    )

    await signIn(page)
    await page.goto('/dashboard/teams/new')

    const teamName = `E2E Team ${Date.now()}`
    await page.locator('input[name="name"]').fill(teamName)
    await page.locator('textarea[name="description"]').fill('Created by Playwright E2E flow')
    await page.locator('form button[type="submit"]').click()

    await expect(page).toHaveURL(/\/dashboard\/teams\/[^/]+$/)
    await expect(page.getByRole('heading', { name: teamName })).toBeVisible()
  })
})
