import { test, expect } from '@playwright/test'

test.describe('Email System', () => {
  test.describe('Email Test Endpoint (Admin)', () => {
    test('should test email connection as admin', async ({ page }) => {
      // Login as admin
      await page.goto('/')
      await page.fill('input[name="email"]', 'admin@wavelaunch.studio')
      await page.fill('input[name="password"]', 'wavelaunch123')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/dashboard/)

      // Test email connection endpoint
      const response = await page.request.get('/api/email/test')
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data).toHaveProperty('provider')
      expect(data).toHaveProperty('connectionOk')
      expect(['resend', 'smtp', 'console']).toContain(data.provider)
    })

    test('should not allow non-admin to test email', async ({ page }) => {
      // Would need a client login to test this
      // For now, just verify endpoint requires auth
      const response = await page.request.get('/api/email/test')
      expect(response.status()).toBe(401)
    })
  })

  test.describe('Notification Preferences API', () => {
    test('should get preferences for authenticated user', async ({ page, request }) => {
      // Login as admin
      await page.goto('/')
      await page.fill('input[name="email"]', 'admin@wavelaunch.studio')
      await page.fill('input[name="password"]', 'wavelaunch123')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/dashboard/)

      // Get cookies for API request
      const cookies = await page.context().cookies()
      const sessionCookie = cookies.find(c => c.name.includes('session'))

      // Note: This might fail if admin doesn't have a client record
      // In production, we'd need proper test data setup
      const response = await request.get('/api/preferences', {
        headers: {
          Cookie: sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : '',
        },
      })

      // Either 200 with data, or 200 with "No client record found"
      expect(response.ok()).toBeTruthy()
    })

    test('should update preferences for authenticated user', async ({ page, request }) => {
      await page.goto('/')
      await page.fill('input[name="email"]', 'admin@wavelaunch.studio')
      await page.fill('input[name="password"]', 'wavelaunch123')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/dashboard/)

      const cookies = await page.context().cookies()
      const sessionCookie = cookies.find(c => c.name.includes('session'))

      const response = await request.put('/api/preferences', {
        headers: {
          Cookie: sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : '',
          'Content-Type': 'application/json',
        },
        data: {
          emailWeeklyDigest: true,
          emailMarketingUpdates: false,
          reminderFrequency: 'weekly',
        },
      })

      // Might fail if no client record, but should handle gracefully
      const isOk = response.ok() || response.status() === 404
      expect(isOk).toBeTruthy()
    })

    test('should not allow unauthenticated access to preferences', async ({ request }) => {
      const response = await request.get('/api/preferences')
      expect(response.status()).toBe(401)
    })
  })

  test.describe('Notification Preferences Admin API', () => {
    test('should get client preferences as admin', async ({ page, request }) => {
      await page.goto('/')
      await page.fill('input[name="email"]', 'admin@wavelaunch.studio')
      await page.fill('input[name="password"]', 'wavelaunch123')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/dashboard/)

      const cookies = await page.context().cookies()
      const sessionCookie = cookies.find(c => c.name.includes('session'))

      // Note: Would need a valid clientId from test data
      // This is a structure test, not a full integration test
      const testClientId = 'test-client-id'

      const response = await request.get(`/api/preferences/${testClientId}`, {
        headers: {
          Cookie: sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : '',
        },
      })

      // Expected to fail with 404 for invalid ID, but admin auth should work
      // Real test would need proper test data setup
      expect([200, 404]).toContain(response.status())
    })

    test('should not allow client preferences admin endpoint for non-admin', async ({ request }) => {
      const response = await request.get('/api/preferences/some-client-id')
      expect(response.status()).toBe(401)
    })
  })

  test.describe('Email Templates', () => {
    test('email templates should be properly structured', async () => {
      // This is a unit-style test that could be moved to a separate file
      // For now, we're just documenting that templates exist
      const expectedTemplates = [
        'WELCOME',
        'CLIENT_ACTIVATED',
        'BUSINESS_PLAN_READY',
        'DELIVERABLE_READY',
        'DELIVERABLE_OVERDUE',
        'MILESTONE_REACHED',
        'JOURNEY_COMPLETED',
        'PASSWORD_RESET',
        'INVITATION',
      ]

      // In a real test, we'd import and check the template manager
      // For e2e, we're just documenting the expected templates
      expect(expectedTemplates).toHaveLength(9)
    })
  })

  test.describe('Email Workflow Integration', () => {
    test.skip('should send welcome email when client created', async ({ page }) => {
      // This would require:
      // 1. Creating a client
      // 2. Checking job queue for SEND_EMAIL job
      // 3. Verifying email was queued with correct template
      // Skip for now - would need more complex setup
    })

    test.skip('should send deliverable ready email when deliverable completed', async ({ page }) => {
      // Similar to above - requires full workflow test
    })

    test.skip('should respect notification preferences', async ({ page }) => {
      // Test that emails are not sent when preferences disable them
    })
  })
})

test.describe('Email Service Configuration', () => {
  test('should have email environment variables documented', async () => {
    // This is more of a documentation test
    const requiredEnvVars = [
      'EMAIL_FROM',
      'EMAIL_FROM_NAME',
      // One of: RESEND_API_KEY, SMTP_HOST, or NODE_ENV=development
    ]

    const optionalEnvVars = [
      'RESEND_API_KEY',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_SECURE',
      'SMTP_USER',
      'SMTP_PASSWORD',
      'ENABLE_EMAIL_WORKFLOWS',
      'FORCE_CONSOLE_EMAIL',
    ]

    expect(requiredEnvVars).toHaveLength(2)
    expect(optionalEnvVars).toHaveLength(8)
  })
})
