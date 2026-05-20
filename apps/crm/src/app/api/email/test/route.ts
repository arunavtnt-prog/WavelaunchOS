import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/authorize'
import { testEmailConnection, getEmailProvider } from '@/lib/email/sender'
import { handleError } from '@/lib/api/responses'

/**
 * GET /api/email/test - Test email connection and get provider info
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin()

    // Get email provider
    const provider = getEmailProvider()

    // Test connection
    const connectionOk = await testEmailConnection()

    return NextResponse.json({
      success: true,
      data: {
        provider,
        connectionOk,
        message: connectionOk
          ? `Email service is working (using ${provider})`
          : `Email connection test failed (${provider})`,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
