/**
 * Email Templates
 *
 * Defines email templates for various notifications and communications.
 * Uses simple template strings with variable replacement.
 *
 * Template variables are replaced using {{variableName}} syntax.
 */

export type EmailTemplateType =
  | 'WELCOME'
  | 'CLIENT_ACTIVATED'
  | 'BUSINESS_PLAN_READY'
  | 'DELIVERABLE_READY'
  | 'DELIVERABLE_OVERDUE'
  | 'JOURNEY_COMPLETED'
  | 'MILESTONE_REACHED'
  | 'PASSWORD_RESET'
  | 'INVITATION'

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface TemplateVariables {
  [key: string]: string | number | boolean | undefined
}

/**
 * Email Template Manager
 */
class EmailTemplateManager {
  /**
   * Get template by type
   */
  getTemplate(type: EmailTemplateType, variables: TemplateVariables): EmailTemplate {
    const template = this.templates[type]
    if (!template) {
      throw new Error(`Email template not found: ${type}`)
    }

    // Replace variables in template
    return {
      subject: this.replaceVariables(template.subject, variables),
      html: this.replaceVariables(template.html, variables),
      text: this.replaceVariables(template.text, variables),
    }
  }

  /**
   * Replace template variables
   */
  private replaceVariables(template: string, variables: TemplateVariables): string {
    let result = template

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, String(value || ''))
    }

    return result
  }

  /**
   * Email templates
   */
  private templates: Record<EmailTemplateType, EmailTemplate> = {
    WELCOME: {
      subject: 'Welcome to Wavelaunch Studio! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Wavelaunch! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi {{clientName}},</p>

              <p>Welcome to Wavelaunch Studio! We're thrilled to have you on board and excited to help you build and launch your brand.</p>

              <p>Our team is already working on your business plan and monthly deliverables. You'll receive notifications as each milestone is completed.</p>

              <h3>What's Next?</h3>
              <ul>
                <li>✅ Your account has been created</li>
                <li>📊 Business plan generation in progress</li>
                <li>📅 Month 1 deliverable will be ready soon</li>
                <li>💬 Our team is here to support you</li>
              </ul>

              <p>Access your client portal to track your progress:</p>

              <a href="{{portalUrl}}" class="button">Go to Portal</a>

              <p>If you have any questions, don't hesitate to reach out to our team.</p>

              <p>Best regards,<br>The Wavelaunch Studio Team</p>
            </div>
            <div class="footer">
              <p>Wavelaunch Studio | Building Brands for Creators</p>
              <p>{{appUrl}}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to Wavelaunch Studio! 🎉

Hi {{clientName}},

Welcome to Wavelaunch Studio! We're thrilled to have you on board and excited to help you build and launch your brand.

Our team is already working on your business plan and monthly deliverables. You'll receive notifications as each milestone is completed.

What's Next?
- Your account has been created
- Business plan generation in progress
- Month 1 deliverable will be ready soon
- Our team is here to support you

Access your client portal: {{portalUrl}}

If you have any questions, don't hesitate to reach out to our team.

Best regards,
The Wavelaunch Studio Team

Wavelaunch Studio | Building Brands for Creators
{{appUrl}}
      `,
    },

    CLIENT_ACTIVATED: {
      subject: 'Your Wavelaunch Journey Begins! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Journey Begins! 🚀</h1>
            </div>
            <div class="content">
              <p>Hi {{clientName}},</p>

              <p>Great news! Your account has been activated and we're starting your 8-month brand-building journey.</p>

              <p>We're currently generating your comprehensive business plan and your first month's deliverable. You'll receive notifications when each is ready for review.</p>

              <h3>Your 8-Month Journey</h3>
              <ul>
                <li><strong>Month 1:</strong> Foundation & Planning</li>
                <li><strong>Month 2:</strong> Supplier Sourcing</li>
                <li><strong>Month 3:</strong> Product Development</li>
                <li><strong>Month 4:</strong> Brand Identity</li>
                <li><strong>Month 5:</strong> Marketing Strategy</li>
                <li><strong>Month 6:</strong> Pre-Launch</li>
                <li><strong>Month 7:</strong> Launch Execution</li>
                <li><strong>Month 8:</strong> Post-Launch & Scaling</li>
              </ul>

              <a href="{{portalUrl}}" class="button">View Your Progress</a>

              <p>Let's build something amazing together!</p>

              <p>Best regards,<br>The Wavelaunch Studio Team</p>
            </div>
            <div class="footer">
              <p>Wavelaunch Studio | Building Brands for Creators</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Your Journey Begins! 🚀

Hi {{clientName}},

Great news! Your account has been activated and we're starting your 8-month brand-building journey.

We're currently generating your comprehensive business plan and your first month's deliverable. You'll receive notifications when each is ready for review.

Your 8-Month Journey:
- Month 1: Foundation & Planning
- Month 2: Supplier Sourcing
- Month 3: Product Development
- Month 4: Brand Identity
- Month 5: Marketing Strategy
- Month 6: Pre-Launch
- Month 7: Launch Execution
- Month 8: Post-Launch & Scaling

View your progress: {{portalUrl}}

Let's build something amazing together!

Best regards,
The Wavelaunch Studio Team
      `,
    },

    BUSINESS_PLAN_READY: {
      subject: 'Your Business Plan is Ready! 📊',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Business Plan Ready! 📊</h1>
            </div>
            <div class="content">
              <p>Hi {{clientName}},</p>

              <p>Exciting news! Your comprehensive business plan has been completed and is ready for your review.</p>

              <p>This strategic document includes:</p>
              <ul>
                <li>Executive Summary</li>
                <li>Market Analysis</li>
                <li>Product Strategy</li>
                <li>Financial Projections</li>
                <li>Marketing Plan</li>
                <li>Risk Assessment</li>
              </ul>

              <p>Review your business plan now:</p>

              <a href="{{portalUrl}}" class="button">View Business Plan</a>

              <p>If you have any questions or need clarifications, our team is here to help.</p>

              <p>Best regards,<br>The Wavelaunch Studio Team</p>
            </div>
            <div class="footer">
              <p>Wavelaunch Studio | Building Brands for Creators</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Business Plan Ready! 📊

Hi {{clientName}},

Exciting news! Your comprehensive business plan has been completed and is ready for your review.

This strategic document includes:
- Executive Summary
- Market Analysis
- Product Strategy
- Financial Projections
- Marketing Plan
- Risk Assessment

View your business plan: {{portalUrl}}

If you have any questions or need clarifications, our team is here to help.

Best regards,
The Wavelaunch Studio Team
      `,
    },

    DELIVERABLE_READY: {
      subject: 'Month {{month}} Deliverable Ready! 📦',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .progress { background: #e0e0e0; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0; }
            .progress-bar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; text-align: center; color: white; line-height: 30px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Month {{month}} Deliverable Ready! 📦</h1>
            </div>
            <div class="content">
              <p>Hi {{clientName}},</p>

              <p>Great progress! Your Month {{month}} deliverable has been completed and is ready for review.</p>

              <p><strong>{{deliverableTitle}}</strong></p>

              <div class="progress">
                <div class="progress-bar" style="width: {{progressPercent}}%;">
                  {{progressPercent}}% Complete
                </div>
              </div>

              <p>This deliverable includes detailed guidance and actionable steps for this phase of your journey.</p>

              <a href="{{portalUrl}}" class="button">View Deliverable</a>

              <p>Keep up the momentum! You're building something amazing.</p>

              <p>Best regards,<br>The Wavelaunch Studio Team</p>
            </div>
            <div class="footer">
              <p>Wavelaunch Studio | Building Brands for Creators</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Month {{month}} Deliverable Ready! 📦

Hi {{clientName}},

Great progress! Your Month {{month}} deliverable has been completed and is ready for review.

{{deliverableTitle}}

Progress: {{progressPercent}}% Complete

This deliverable includes detailed guidance and actionable steps for this phase of your journey.

View your deliverable: {{portalUrl}}

Keep up the momentum! You're building something amazing.

Best regards,
The Wavelaunch Studio Team
      `,
    },

    DELIVERABLE_OVERDUE: {
      subject: 'Reminder: Deliverable Awaiting Review',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Deliverable Awaiting Review</h1>
            </div>
            <div class="content">
              <p>Hi {{clientName}},</p>

              <p>This is a friendly reminder that you have a deliverable waiting for your review:</p>

              <p><strong>{{deliverableTitle}}</strong></p>
              <p>Due: {{dueDate}}</p>

              <p>Reviewing and completing your deliverables on time helps keep your brand-building journey on track.</p>

              <a href="{{portalUrl}}" class="button">Review Deliverable</a>

              <p>If you have any questions or need assistance, please don't hesitate to reach out to our team.</p>

              <p>Best regards,<br>The Wavelaunch Studio Team</p>
            </div>
            <div class="footer">
              <p>Wavelaunch Studio | Building Brands for Creators</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Deliverable Awaiting Review

Hi {{clientName}},

This is a friendly reminder that you have a deliverable waiting for your review:

{{deliverableTitle}}
Due: {{dueDate}}

Reviewing and completing your deliverables on time helps keep your brand-building journey on track.

Review your deliverable: {{portalUrl}}

If you have any questions or need assistance, please don't hesitate to reach out to our team.

Best regards,
The Wavelaunch Studio Team
      `,
    },

    JOURNEY_COMPLETED: {
      subject: 'Congratulations! Journey Complete! 🎊',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .celebration { font-size: 48px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Journey Complete! 🎊</h1>
            </div>
            <div class="content">
              <div class="celebration">🎉 🎊 🚀 ✨</div>

              <p>Hi {{clientName}},</p>

              <p>Congratulations! You've completed all 8 months of the Wavelaunch brand-building program!</p>

              <p>This is a major achievement. Over the past 8 months, you've:</p>
              <ul>
                <li>✅ Developed a comprehensive business plan</li>
                <li>✅ Sourced suppliers and developed products</li>
                <li>✅ Built a strong brand identity</li>
                <li>✅ Created a marketing strategy</li>
                <li>✅ Successfully launched your brand</li>
                <li>✅ Set up scaling operations</li>
              </ul>

              <p>Your brand is now ready to thrive in the market. We're so proud of what you've accomplished!</p>

              <a href="{{portalUrl}}" class="button">Review Your Journey</a>

              <p>Thank you for choosing Wavelaunch Studio. We can't wait to see where your brand goes from here!</p>

              <p>With gratitude,<br>The Wavelaunch Studio Team</p>
            </div>
            <div class="footer">
              <p>Wavelaunch Studio | Building Brands for Creators</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Journey Complete! 🎊

🎉 🎊 🚀 ✨

Hi {{clientName}},

Congratulations! You've completed all 8 months of the Wavelaunch brand-building program!

This is a major achievement. Over the past 8 months, you've:
- Developed a comprehensive business plan
- Sourced suppliers and developed products
- Built a strong brand identity
- Created a marketing strategy
- Successfully launched your brand
- Set up scaling operations

Your brand is now ready to thrive in the market. We're so proud of what you've accomplished!

Review your journey: {{portalUrl}}

Thank you for choosing Wavelaunch Studio. We can't wait to see where your brand goes from here!

With gratitude,
The Wavelaunch Studio Team
      `,
    },

    MILESTONE_REACHED: {
      subject: 'Milestone Achieved: {{milestone}}! 🎯',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Milestone Achieved! 🎯</h1>
            </div>
            <div class="content">
              <p>Hi {{clientName}},</p>

              <p>Congratulations! You've reached an important milestone:</p>

              <p><strong>{{milestone}}</strong></p>

              <p>This achievement is a significant step forward in your brand-building journey. Keep up the excellent work!</p>

              <a href="{{portalUrl}}" class="button">View Dashboard</a>

              <p>Celebrate this win and keep the momentum going!</p>

              <p>Best regards,<br>The Wavelaunch Studio Team</p>
            </div>
            <div class="footer">
              <p>Wavelaunch Studio | Building Brands for Creators</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Milestone Achieved! 🎯

Hi {{clientName}},

Congratulations! You've reached an important milestone:

{{milestone}}

This achievement is a significant step forward in your brand-building journey. Keep up the excellent work!

View your dashboard: {{portalUrl}}

Celebrate this win and keep the momentum going!

Best regards,
The Wavelaunch Studio Team
      `,
    },

    PASSWORD_RESET: {
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #374151; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #374151; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi {{userName}},</p>

              <p>We received a request to reset your password. Click the button below to create a new password:</p>

              <a href="{{resetUrl}}" class="button">Reset Password</a>

              <p>This link will expire in {{expiryHours}} hours.</p>

              <div class="warning">
                <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email and contact our support team immediately.
              </div>

              <p>Best regards,<br>The Wavelaunch Studio Team</p>
            </div>
            <div class="footer">
              <p>Wavelaunch Studio | Building Brands for Creators</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Reset Your Password

Hi {{userName}},

We received a request to reset your password. Use the link below to create a new password:

{{resetUrl}}

This link will expire in {{expiryHours}} hours.

SECURITY NOTICE: If you didn't request this password reset, please ignore this email and contact our support team immediately.

Best regards,
The Wavelaunch Studio Team
      `,
    },

    INVITATION: {
      subject: 'You\'ve Been Invited to Wavelaunch Studio',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You're Invited! ✉️</h1>
            </div>
            <div class="content">
              <p>Hello,</p>

              <p>{{inviterName}} has invited you to join Wavelaunch Studio as a client.</p>

              <p>Wavelaunch Studio helps creators build and launch successful brands through our comprehensive 8-month program.</p>

              <p>Click the button below to accept your invitation and get started:</p>

              <a href="{{inviteUrl}}" class="button">Accept Invitation</a>

              <p>This invitation will expire in {{expiryDays}} days.</p>

              <p>We look forward to working with you!</p>

              <p>Best regards,<br>The Wavelaunch Studio Team</p>
            </div>
            <div class="footer">
              <p>Wavelaunch Studio | Building Brands for Creators</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
You're Invited! ✉️

Hello,

{{inviterName}} has invited you to join Wavelaunch Studio as a client.

Wavelaunch Studio helps creators build and launch successful brands through our comprehensive 8-month program.

Accept your invitation: {{inviteUrl}}

This invitation will expire in {{expiryDays}} days.

We look forward to working with you!

Best regards,
The Wavelaunch Studio Team
      `,
    },
  }
}

// Singleton instance
export const emailTemplateManager = new EmailTemplateManager()
