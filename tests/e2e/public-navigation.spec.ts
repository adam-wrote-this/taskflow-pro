import { expect, test } from '@playwright/test'

test.describe('Public navigation smoke', () => {
  test('landing page can navigate to login and sign up', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/TaskFlow Pro/i)

    await page.locator('a[href="/auth/login"]').first().click()
    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(page.locator('input[name="email"]')).toBeVisible()

    await page.goto('/')
    await page.locator('a[href="/auth/sign-up"]').first().click()
    await expect(page).toHaveURL(/\/auth\/sign-up/)
    await expect(page.locator('input[name="fullName"]')).toBeVisible()
  })
})
