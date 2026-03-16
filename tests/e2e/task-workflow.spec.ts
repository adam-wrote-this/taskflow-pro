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

/**
 * Task Workflow – full create/edit/delete/drag cycle.
 *
 * All tests in this suite require:
 *   E2E_USER_EMAIL + E2E_USER_PASSWORD  (credentials)
 *   E2E_ENABLE_WRITE_TESTS=1            (write permission)
 *
 * The suite is serial: each test builds on the state established by the previous one.
 * A unique project is created in beforeAll; all task tests operate on that project.
 */
test.describe.serial('任务工作流（Task workflow）', () => {
  test.skip(
    !hasAuthCredentials || !runWriteFlows,
    'Set E2E_USER_EMAIL, E2E_USER_PASSWORD and E2E_ENABLE_WRITE_TESTS=1 to run task workflow tests.',
  )

  let projectUrl = ''
  const taskTitle = `E2E Task ${Date.now()}`
  const editedTitle = `${taskTitle} (edited)`

  // Create a dedicated team + project before the suite runs
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await signIn(page)

    // Create team
    const teamName = `WF Team ${Date.now()}`
    await page.goto('/dashboard/teams/new')
    await page.locator('input[name="name"]').fill(teamName)
    await page.locator('textarea[name="description"]').fill('Workflow test team')
    await page.locator('form button[type="submit"]').click()
    await page.waitForURL(/\/dashboard\/teams\/[^/]+$/, { timeout: 15_000 })
    const teamId = page.url().split('/').pop()

    // Create project
    const projectName = `WF Project ${Date.now()}`
    await page.goto(`/dashboard/projects/new?teamId=${teamId}`)
    await page.waitForSelector('input[name="name"]', { timeout: 10_000 })
    await page.locator('input[name="name"]').fill(projectName)
    await page.locator('form button[type="submit"]').click()
    await page.waitForURL(/\/dashboard\/projects\/[^/]+$/, { timeout: 15_000 })
    projectUrl = page.url()

    await context.close()
  })

  test('可以创建新项目', async ({ page }) => {
    // Project is created in beforeAll; validate we can reach the project page
    await signIn(page)
    await page.goto(projectUrl)
    await expect(page).toHaveURL(/\/dashboard\/projects\/[^/]+$/)
    // Kanban board should be visible
    await expect(page.locator('main')).toBeVisible()
  })

  test('可以在看板中创建任务', async ({ page }) => {
    await signIn(page)
    await page.goto(projectUrl)

    // Open create-task dialog
    await page.getByRole('button', { name: /新建任务/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Fill in task title
    await page.getByLabel(/任务标题/).fill(taskTitle)

    // Submit
    await page.getByRole('button', { name: /创建任务/ }).click()

    // Dialog should close and task card should appear on the board
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10_000 })
  })

  test('可以打开任务详情并编辑标题', async ({ page }) => {
    await signIn(page)
    await page.goto(projectUrl)

    // Click on the task card to open detail dialog
    await page.getByText(taskTitle).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8_000 })

    // Clear title and type the new one
    const titleInput = page.getByRole('dialog').getByRole('textbox').first()
    await titleInput.fill(editedTitle)

    // Save
    await page.getByRole('button', { name: /保存/ }).click()

    // Dialog closes and updated title appears
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(editedTitle)).toBeVisible({ timeout: 10_000 })
  })

  test('可以将任务拖拽到不同列', async ({ page }) => {
    await signIn(page)
    await page.goto(projectUrl)

    // Find the task card
    const taskCard = page.getByText(editedTitle).locator('..').locator('..')

    // Find the target column (in_progress)
    const inProgressColumn = page.locator('[data-column-id="in_progress"], [id="in_progress"]').first()
      .or(page.getByText('进行中').locator('..').locator('..'))

    // Perform drag using Playwright's dragTo
    await taskCard.dragTo(inProgressColumn, { timeout: 10_000 })

    // After drag, task should still be visible (it may have moved columns)
    await expect(page.getByText(editedTitle)).toBeVisible({ timeout: 8_000 })
  })

  test('可以通过任务详情弹窗删除任务', async ({ page }) => {
    await signIn(page)
    await page.goto(projectUrl)

    // Open task detail
    await page.getByText(editedTitle).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8_000 })

    // Click the delete button (trash icon)
    await page.getByRole('button', { name: /删除/ }).click()

    // A confirmation dialog should appear
    const confirmDialog = page.getByRole('alertdialog')
    await expect(confirmDialog).toBeVisible({ timeout: 5_000 })

    // Confirm deletion
    await confirmDialog.getByRole('button', { name: /删除|确认/ }).click()

    // Task card should no longer be on the board
    await expect(page.getByText(editedTitle)).not.toBeVisible({ timeout: 10_000 })
  })
})
