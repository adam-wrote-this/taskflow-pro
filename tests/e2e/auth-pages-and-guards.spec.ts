import { expect, test } from '@playwright/test'

test.describe('认证页面与路由守卫（Auth pages and route guards）', () => {
  test('未登录用户访问 dashboard 时会重定向到登录页', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  test('登录页与注册页可互相跳转且包含预期字段', async ({ page }) => {
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
