import { Resend } from 'resend'


// Initialize Resend lazily or check for key
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not defined. Email sending will be skipped.')
    return null
  }
  return new Resend(apiKey)
}


export interface ApplicationEmailData {
  fullName: string
  email: string
  applicationId: string
  industryNiche?: string
  instagramHandle?: string
  tiktokHandle?: string
  country?: string
}

export async function sendApplicationConfirmation(data: ApplicationEmailData) {
  try {
    const resend = getResend()
    if (!resend) return { success: false, error: 'Missing RESEND_API_KEY' }

    await resend.emails.send({
      from: 'Wavelaunch Studio <noreply@wavelaunch.studio>',
      to: data.email,
      subject: 'Application Received - Wavelaunch Studio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; margin-bottom: 20px;">Thank You for Applying!</h1>

          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Dear ${data.fullName},
          </p>

          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            We've received your application to Wavelaunch Studio. Our team will review your submission and create a custom business roadmap tailored to your vision.
          </p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #666;"><strong>Application ID:</strong> ${data.applicationId}</p>
            <p style="margin: 10px 0 0 0; color: #666;"><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            <strong>What happens next:</strong>
          </p>

          <ul style="color: #4a4a4a; font-size: 16px; line-height: 1.8;">
            <li>Our team will review your application within 5-7 business days</li>
            <li>We'll analyze your audience, niche, and brand vision</li>
            <li>You'll receive a custom roadmap with product recommendations and strategy</li>
            <li>If approved, we'll schedule a call to discuss next steps</li>
          </ul>

          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            In the meantime, feel free to explore more about Wavelaunch VC at
            <a href="${process.env.NEXT_PUBLIC_WAVELAUNCH_URL}" style="color: #2563eb;">wavelaunch.vc</a>
          </p>

          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Best regards,<br/>
            <strong>The Wavelaunch Studio Team</strong>
          </p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
    return { success: false, error }
  }
}

export async function sendAdminNotification(data: ApplicationEmailData) {
  const adminEmail = process.env.ADMIN_EMAIL || 'arunav@wavelaunch.org'

  try {
    const resend = getResend()
    if (!resend) return { success: false, error: 'Missing RESEND_API_KEY' }

    await resend.emails.send({
      from: 'Wavelaunch Studio <noreply@wavelaunch.studio>',
      to: adminEmail,
      subject: `New Application: ${data.fullName} - ${data.industryNiche}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; margin-bottom: 20px;">New Application Received</h1>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1a1a1a;">Applicant Details</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${data.fullName}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${data.email}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Industry/Niche:</strong> ${data.industryNiche}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Country:</strong> ${data.country}</p>
            ${data.instagramHandle ? `<p style="margin: 5px 0; color: #666;"><strong>Instagram:</strong> @${data.instagramHandle}</p>` : ''}
            ${data.tiktokHandle ? `<p style="margin: 5px 0; color: #666;"><strong>TikTok:</strong> @${data.tiktokHandle}</p>` : ''}
            <p style="margin: 15px 0 5px 0; color: #666;"><strong>Application ID:</strong> ${data.applicationId}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/applications/${data.applicationId}"
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Full Application
            </a>
          </p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send admin notification:', error)
    return { success: false, error }
  }
}
