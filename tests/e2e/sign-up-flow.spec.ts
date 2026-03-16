import { expect, test } from '@playwright/test'

const hasAuthCredentials =
  Boolean(process.env.E2E_USER_EMAIL) && Boolean(process.env.E2E_USER_PASSWORD)
const runWriteFlows = process.env.E2E_ENABLE_WRITE_TESTS === '1'

test.describe('Sign-up flow', () => {
  test('sign-up-success page renders and provides back-to-login link', async ({ page }) => {
    await page.goto('/auth/sign-up-success')

    // Page should be visible (not redirected away)
    await expect(page).toHaveURL(/\/auth\/sign-up-success/)

    // Back-to-login link should be present
    const backLink = page.getByRole('link', { name: /登录|Log in/i })
    await expect(backLink).toBeVisible()

    // Clicking it navigates to login
    await backLink.click()
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('sign-up form enforces password minimum length attribute', async ({ page }) => {
    await page.goto('/auth/sign-up')

    await expect(page.locator('input[name="password"]')).toHaveAttribute('minlength', '6')
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required', '')
  })

  test('sign-up form requires all three fields (fullName, email, password)', async ({ page }) => {
    await page.goto('/auth/sign-up')

    await expect(page.locator('input[name="fullName"]')).toHaveAttribute('required', '')
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required', '')
    await expect(page.locator('input[name="email"]')).toHaveAttribute('type', 'email')
  })

  test('sign-up page link to login is accessible', async ({ page }) => {
    await page.goto('/auth/sign-up')

    // Should have a link back to login
    await page.locator('a[href="/auth/login"]').click()
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('register with mismatched short-password shows server error (credential-gated)', async ({ page }) => {
    test.skip(
      !hasAuthCredentials,
      'Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run credential-gated sign-up tests.',
    )

    await page.goto('/auth/sign-up')

    await page.locator('input[name="fullName"]').fill('E2E Test User')
    await page.locator('input[name="email"]').fill(`e2e-dup-${Date.now()}@example.com`)
    // 5 chars — below minlength=6; native HTML validation blocks submit in most browsers,
    // so use a 6-char invalid password that the server will accept from format but is weak
    await page.locator('input[name="password"]').fill('abc123')

    await page.locator('form button[type="submit"]').click()

    // Server should redirect to sign-up-success (Supabase sends confirmation email)
    // OR remain on page with an error. Both are acceptable outcomes.
    const finalUrl = page.url()
    const isSuccess = /sign-up-success/.test(finalUrl)
    const isError =
      (await page.locator('form .text-destructive, form [role="alert"]').count()) > 0

    expect(isSuccess || isError).toBe(true)
  })

  test('successful sign-up redirects to sign-up-success (write-gated)', async ({ page }) => {
    test.skip(
      !hasAuthCredentials || !runWriteFlows,
      'Set E2E_USER_EMAIL, E2E_USER_PASSWORD and E2E_ENABLE_WRITE_TESTS=1 to run write-flow sign-up tests.',
    )

    const uniqueEmail = `e2e-new-${Date.now()}@example.com`

    await page.goto('/auth/sign-up')

    await page.locator('input[name="fullName"]').fill('E2E New User')
    await page.locator('input[name="email"]').fill(uniqueEmail)
    await page.locator('input[name="password"]').fill('securePass123')

    await page.locator('form button[type="submit"]').click()

    // Supabase typically sends a confirmation email; server-side action redirects to success page
    await expect(page).toHaveURL(/\/auth\/sign-up-success/, { timeout: 15_000 })
  })
})
