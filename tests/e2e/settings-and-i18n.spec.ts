import { expect, test, type Page } from '@playwright/test'

const hasAuthCredentials =
  Boolean(process.env.E2E_USER_EMAIL) && Boolean(process.env.E2E_USER_PASSWORD)
const runWriteFlows = process.env.E2E_ENABLE_WRITE_TESTS === '1'

async function signIn(page: Page) {
  await page.goto('/auth/login')
  await page.locator('input[name="email"]').fill(process.env.E2E_USER_EMAIL || '')
  await page.locator('input[name="password"]').fill(process.env.E2E_USER_PASSWORD || '')
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 })
}

test.describe('语言切换器（公共页面）', () => {
  test('登录页可见语言切换按钮', async ({ page }) => {
    await page.goto('/auth/login')
    // Globe icon button for language switcher
    const langButton = page.getByRole('button', { name: /Switch language/i })
    await expect(langButton).toBeVisible()
  })

  test('登录页从 zh 切换到 en 后界面文案会变化', async ({ page }) => {
    await page.goto('/auth/login')

    // Default locale is zh — title should be in Chinese
    await expect(page.getByText(/登录|登 录/i)).toBeVisible()

    // Open language switcher
    await page.getByRole('button', { name: /Switch language/i }).click()
    await page.getByRole('menuitem', { name: 'English' }).click()

    // After switching, page should show English text
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/Log in|Sign in|Welcome back/i)).toBeVisible({ timeout: 8_000 })
  })

  test('切回 zh 后界面恢复中文文案', async ({ page }) => {
    // Start on login with English set (from cookie)
    await page.goto('/auth/login')
    await page.getByRole('button', { name: /Switch language/i }).click()
    await page.getByRole('menuitem', { name: 'English' }).click()
    await page.waitForLoadState('networkidle')

    // Switch back to Chinese
    await page.getByRole('button', { name: /Switch language/i }).click()
    await page.getByRole('menuitem', { name: '中文' }).click()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/登录|登 录/i)).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('设置页：个人资料与密码', () => {
  test.skip(
    !hasAuthCredentials,
    'Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run settings tests.',
  )

  test('设置页可正常加载并显示个人资料区域', async ({ page }) => {
    await signIn(page)
    await page.goto('/dashboard/settings')

    // Profile section heading should be present
    await expect(page.getByText(/个人资料|Profile/i)).toBeVisible({ timeout: 8_000 })
    await expect(page.getByLabel(/姓名|Full Name|Name/i)).toBeVisible()
  })

  test('设置页偏好区域可见语言相关设置', async ({ page }) => {
    await signIn(page)
    await page.goto('/dashboard/settings')

    // Navigate to the preferences / language tab if it's separate
    const preferencesTab = page.getByRole('tab', { name: /偏好设置|Preferences/i })
    if (await preferencesTab.isVisible()) {
      await preferencesTab.click()
    }

    // Language section should be present somewhere on the page
    await expect(page.getByText(/语言|Language/i)).toBeVisible({ timeout: 8_000 })
  })

  test('点击修改密码按钮后会弹出密码修改对话框', async ({ page }) => {
    await signIn(page)
    await page.goto('/dashboard/settings')

    // Security / password tab
    const securityTab = page.getByRole('tab', { name: /安全|Security/i })
    if (await securityTab.isVisible()) {
      await securityTab.click()
    }

    const changePasswordBtn = page.getByRole('button', { name: /修改密码|Change Password/i })
    await expect(changePasswordBtn).toBeVisible({ timeout: 8_000 })
    await changePasswordBtn.click()

    // Alert dialog for password change should open
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5_000 })
  })

  test('新密码与确认密码不一致时会显示错误提示', async ({ page }) => {
    await signIn(page)
    await page.goto('/dashboard/settings')

    const securityTab = page.getByRole('tab', { name: /安全|Security/i })
    if (await securityTab.isVisible()) {
      await securityTab.click()
    }

    await page.getByRole('button', { name: /修改密码|Change Password/i }).click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()

    await dialog.getByLabel(/新密码|New Password/i).fill('newpass123')
    await dialog.getByLabel(/确认密码|Confirm Password/i).fill('differentpass')
    await dialog.getByRole('button', { name: /确认修改|Confirm|Save/i }).click()

    await expect(page.getByText(/密码不一致|Passwords do not match/i)).toBeVisible({ timeout: 5_000 })
  })

  test('写入门控：可以更新显示名称', async ({ page }) => {
    test.skip(
      !runWriteFlows,
      'Set E2E_ENABLE_WRITE_TESTS=1 to run profile-update test.',
    )

    await signIn(page)
    await page.goto('/dashboard/settings')

    const nameInput = page.getByLabel(/姓名|Full Name|Name/i)
    await nameInput.fill(`E2E User ${Date.now()}`)

    await page.getByRole('button', { name: /保存|Save/i }).click()

    // Success indicator should appear
    await expect(
      page.getByText(/保存成功|Saved|操作成功/i).or(page.locator('[data-success="true"]')),
    ).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('已登录态仪表盘语言切换', () => {
  test.skip(
    !hasAuthCredentials,
    'Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run dashboard i18n tests.',
  )

  test('默认情况下仪表盘导航显示中文（或可回退英文）', async ({ page }) => {
    await signIn(page)
    await expect(page.getByText('仪表盘').or(page.getByText('Dashboard'))).toBeVisible({
      timeout: 8_000,
    })
  })

  test('切换仪表盘语言后导航文案会更新', async ({ page }) => {
    await signIn(page)

    // Switch to English via dashboard header language button
    const langButton = page.locator('header').getByRole('button', { name: /Switch language/i })
    await expect(langButton).toBeVisible()
    await langButton.click()
    await page.getByRole('menuitem', { name: 'English' }).click()
    await page.waitForLoadState('networkidle')

    // Nav should now show English labels
    await expect(page.getByText(/Dashboard|Projects|Teams/i)).toBeVisible({ timeout: 8_000 })
  })
})
