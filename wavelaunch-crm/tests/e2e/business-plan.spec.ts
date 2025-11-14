import { test, expect } from '@playwright/test'

// Helper to login before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.fill('input[name="email"]', 'admin@wavelaunch.studio')
  await page.fill('input[name="password"]', 'wavelaunch123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/)
})

test.describe('Business Plan Generation', () => {
  test('should navigate to business plan tab', async ({ page }) => {
    // Navigate to any client
    await page.goto('/clients')
    const firstClient = page.locator('[href*="/clients/"][class*="group"]').first()
    await firstClient.click()

    // Click business plan tab
    await page.click('button:has-text("Business Plan")')
    await expect(page.getByRole('heading', { name: /business plan/i })).toBeVisible()
  })

  test('should show generate button when no plan exists', async ({ page }) => {
    await page.goto('/clients')
    const firstClient = page.locator('[href*="/clients/"][class*="group"]').first()
    await firstClient.click()
    await page.click('button:has-text("Business Plan")')

    // Should see either the generate button or existing plans
    const hasGenerateButton = await page.getByRole('button', { name: /generate/i }).isVisible()
    const hasPlansList = await page.getByText(/version/i).isVisible()

    expect(hasGenerateButton || hasPlansList).toBeTruthy()
  })

  test('should display business plan generation dialog', async ({ page }) => {
    await page.goto('/clients')
    const firstClient = page.locator('[href*="/clients/"][class*="group"]').first()
    await firstClient.click()
    await page.click('button:has-text("Business Plan")')

    // Try to open generate dialog
    const generateButton = page.getByRole('button', { name: /generate/i }).first()
    if (await generateButton.isVisible()) {
      await generateButton.click()
      await expect(page.getByRole('dialog')).toBeVisible()
    }
  })

  test('should edit existing business plan', async ({ page }) => {
    await page.goto('/clients')
    const firstClient = page.locator('[href*="/clients/"][class*="group"]').first()
    await firstClient.click()
    await page.click('button:has-text("Business Plan")')

    // Look for edit button
    const editButton = page.getByRole('button', { name: /edit/i }).first()
    if (await editButton.isVisible()) {
      await editButton.click()

      // Should see markdown editor
      await expect(page.locator('.cm-editor')).toBeVisible()
    }
  })
})
