import { expect, test } from '@playwright/test'

test.describe('Auth pages and route guards', () => {
  test('unauthenticated user is redirected from dashboard to login page', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  test('login and sign-up pages link to each other and expose expected fields', async ({ page }) => {
    await page.goto('/auth/login')

    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()

    await page.locator('a[href="/auth/sign-up"]').click()
    await expect(page).toHaveURL(/\/auth\/sign-up/)

    await expect(page.locator('input[name="fullName"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()

    await expect(page.locator('input[name="password"]')).toHaveAttribute('minlength', '6')
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required', '')

    await page.locator('a[href="/auth/login"]').click()
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
