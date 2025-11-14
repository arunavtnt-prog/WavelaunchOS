import { test, expect } from '@playwright/test'

// Helper to login before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.fill('input[name="email"]', 'admin@wavelaunch.studio')
  await page.fill('input[name="password"]', 'wavelaunch123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/)
})

test.describe('Client Management', () => {
  test('should display clients page', async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByRole('heading', { name: /clients/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search clients/i)).toBeVisible()
  })

  test('should navigate to new client form', async ({ page }) => {
    await page.goto('/clients')
    await page.click('a:has-text("New Client")')
    await expect(page).toHaveURL(/\/clients\/new/)
    await expect(page.getByRole('heading', { name: /onboard client/i })).toBeVisible()
  })

  test('should create a new client', async ({ page }) => {
    await page.goto('/clients/new')

    // Fill required fields
    await page.fill('input[name="creatorName"]', 'Test Creator')
    await page.fill('input[name="email"]', 'testcreator@example.com')
    await page.fill('input[name="niche"]', 'Technology')
    await page.fill('input[name="socialPlatform"]', 'YouTube')
    await page.fill('input[name="followersCount"]', '100000')
    await page.fill('input[name="avgViews"]', '50000')
    await page.fill('input[name="engagementRate"]', '5')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to client detail page
    await expect(page).toHaveURL(/\/clients\/[a-z0-9-]+/)
    await expect(page.getByText('Test Creator')).toBeVisible()
  })

  test('should search for clients', async ({ page }) => {
    await page.goto('/clients')

    // Type in search box
    await page.fill('input[placeholder*="Search clients"]', 'Test Creator')

    // Wait for search results (debounced)
    await page.waitForTimeout(500)

    // Should see filtered results
    const clientCards = page.locator('[href*="/clients/"]')
    await expect(clientCards.first()).toBeVisible()
  })

  test('should view client details', async ({ page }) => {
    // First go to clients page
    await page.goto('/clients')

    // Click on first client card
    const firstClient = page.locator('[href*="/clients/"][class*="group"]').first()
    await firstClient.click()

    // Should see client details
    await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /business plan/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /deliverables/i })).toBeVisible()
  })
})
