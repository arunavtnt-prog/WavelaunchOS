import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/WavelaunchOS/)
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Wait for error message
    await expect(page.getByText(/invalid/i)).toBeVisible()
  })

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[name="email"]', 'admin@wavelaunch.studio')
    await page.fill('input[name="password"]', 'wavelaunch123')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })
})
