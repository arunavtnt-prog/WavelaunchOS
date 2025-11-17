# Administrator Guide

This guide will help you manage the Wavelaunch CRM system as an administrator. You'll learn how to manage clients, create business plans, track deliverables, and more.

## Accessing the Admin Dashboard

### Login

1. Go to: `https://wavelaunch.com/login`
2. Enter your admin email and password
3. Click "Sign In"

### First-Time Setup

If this is a new installation:
- Default email: `admin@wavelaunch.com`
- Default password: `Admin123!`

**IMPORTANT**: Change this password immediately after first login!

## Dashboard Overview

When you log in, you'll see the main dashboard with four sections:

### 1. Statistics Cards
Quick metrics showing:
- **Total Clients**: Number of clients in the system
- **Active Clients**: Clients currently in the program
- **Pending Invites**: Clients who haven't activated their portal yet
- **This Month's Deliverables**: Deliverables due this month

### 2. Recent Activity Feed
Real-time updates showing:
- Client portal registrations
- Onboarding completions
- Document downloads
- Message activity
- System events

### 3. Clients Overview
Quick list of recent clients with their:
- Name and company
- Status (Active, Onboarded, Invited, etc.)
- Onboarding completion
- Quick actions

### 4. Pending Actions
Tasks that need your attention:
- Clients who completed onboarding (ready for business plan)
- Pending invites to resend
- Outstanding deliverables
- Unread messages

## Managing Clients

### Creating a New Client

1. Click "Clients" in the navigation
2. Click "Add Client" button
3. Fill in the form:

   **Required Information**:
   - Creator/Business Name
   - Email address (must be unique)
   - Brand Name (if different from creator name)
   - Status: Select from dropdown
     - `LEAD`: Potential client
     - `ONBOARDING`: Currently signing up
     - `ACTIVE`: In the program
     - `PAUSED`: Temporarily inactive
     - `COMPLETED`: Finished the program
     - `CHURNED`: Left before completion

   **Optional Information**:
   - Niche/Industry
   - Phone number
   - Website
   - Social media handles
   - Notes (internal use only)

4. Click "Create Client"

### Viewing Client Details

1. Go to "Clients"
2. Click on any client name
3. You'll see:
   - **Overview Tab**: Basic information and stats
   - **Onboarding Tab**: Their questionnaire responses
   - **Business Plan Tab**: Generated business plans
   - **Deliverables Tab**: Monthly deliverables tracking
   - **Activity Tab**: Client's recent actions
   - **Messages Tab**: Communication history

### Editing Client Information

1. Go to client details page
2. Click "Edit Client" button
3. Update any information
4. Click "Save Changes"

### Archiving Clients

For clients who are no longer active:
1. Go to client details
2. Click "Archive Client"
3. Confirm the action

Archived clients:
- Don't appear in main client list (unless you filter for them)
- Can't access their portal
- Can be restored later if needed

## Portal Access Management

### Sending Portal Invites

When you create a client, they don't automatically get portal access. You need to send them an invite.

**Automatic Invite**:
1. Go to client details
2. Click "Send Portal Invite" button
3. System generates a unique, secure link
4. Copy the link to send to your client

**Invite Details**:
- Link expires in 7 days
- Can only be used once
- Contains a secure, hashed token
- Example: `https://wavelaunch.com/portal/invite/abc123...`

### Resending Invites

If a client's invite expired or they lost it:
1. Go to client details
2. Click "Resend Invite" button
3. A new link is generated (old one becomes invalid)
4. Send the new link to the client

### Checking Portal Status

On the client details page, you can see:
- **Portal User Status**:
  - Not Created: No portal account yet
  - Invited: Invite sent, waiting for activation
  - Active: Account is active
  - Inactive: Account disabled

- **Last Portal Activity**: When they last logged in
- **Onboarding Status**: Whether they completed the questionnaire

### Deactivating Portal Access

If you need to temporarily disable a client's portal:
1. Go to client details
2. Click "Deactivate Portal"
3. Client can no longer log in
4. Click "Reactivate Portal" to restore access

## Onboarding Management

### Reviewing Onboarding Responses

When a client completes onboarding:
1. You'll see it in the activity feed
2. Go to their client details
3. Click "Onboarding" tab
4. Review all 6 steps of their responses:
   - Step 1: Business Basics
   - Step 2: Target Audience
   - Step 3: Value Proposition
   - Step 4: Brand Identity
   - Step 5: Growth & Vision
   - Step 6: Their Story

### Generating Business Plans

After reviewing onboarding:
1. Go to client details
2. Click "Business Plan" tab
3. Click "Generate AI Business Plan"
4. The system will:
   - Analyze all onboarding responses
   - Create a comprehensive business plan
   - Format it as markdown
   - Save it to the database
   - Notify the client

**What's Included**:
- Executive Summary
- Vision and Goals
- Market Analysis
- Target Audience Profile
- Value Proposition
- Competitive Advantage
- Brand Identity and Personality
- Growth Strategy
- Implementation Roadmap (8-month plan)
- Next Steps

### Viewing Business Plans

1. Go to client details
2. Click "Business Plan" tab
3. See all versions of their plan
4. Click "View" to see the full markdown content
5. Click "Download PDF" (if available)
6. Click "Edit" to make manual adjustments

### Updating Business Plans

Business plans can be versioned:
1. Edit existing plan and save as new version
2. Old versions are preserved
3. Clients see the latest version by default
4. You can mark a version as "APPROVED"

## Deliverables Management

The 8-month program has deliverables for each month.

### Creating Deliverables

1. Go to client details
2. Click "Deliverables" tab
3. Click "Add Deliverable"
4. Fill in:
   - Month: M1 through M8
   - Title: Description of the deliverable
   - Status:
     - `PENDING`: Not started yet
     - `IN_PROGRESS`: Currently working on it
     - `DELIVERED`: Complete and sent to client
     - `APPROVED`: Client has approved it

5. Click "Create Deliverable"

### Standard Monthly Deliverables

Here's what each month typically includes:

**M1: Foundation Excellence**
- Brand strategy document
- Competitor analysis
- Initial content calendar

**M2: Brand Readiness**
- Brand identity package
- Product positioning guide
- Value proposition framework

**M3: Market Entry**
- Marketing strategy document
- Content creation plan
- Channel selection guide

**M4: Sales Engine**
- Sales funnel design
- Landing page templates
- Email sequence templates

**M5: Pre-Launch**
- Launch checklist
- Audience building strategies
- Pre-launch campaign plan

**M6: Soft Launch**
- Beta testing framework
- Feedback collection system
- Iteration guidelines

**M7: Scaling Systems**
- Automation workflows
- Team building guide
- Scaling playbook

**M8: Full Launch**
- Launch execution plan
- Performance tracking dashboard
- Long-term growth strategies

### Uploading Deliverable Files

1. Go to deliverable details
2. Click "Upload PDF"
3. Select the file (must be PDF)
4. File is stored and available for client download

### Updating Deliverable Status

As you work on deliverables:
1. Set to "IN_PROGRESS" when you start
2. Set to "DELIVERED" when complete
3. Set to "APPROVED" when client approves

Clients get notified when status changes to "DELIVERED".

### Tracking Progress

The dashboard shows:
- Deliverables due this month
- Overdue deliverables
- Completed deliverables
- Client progress percentage

## Messaging System

### Viewing Messages

1. Click "Messages" in navigation
2. See all conversation threads across all clients
3. Threads with unread messages show a blue dot
4. Click any thread to view the conversation

### Filtering Messages

Use filters to find specific messages:
- **Client**: Filter by client name
- **Status**: Read or Unread
- **Date Range**: Custom date range

### Sending Messages

**To a specific client**:
1. Go to their client details page
2. Click "Messages" tab
3. Click "New Message"
4. Enter subject and message
5. Optionally attach a file
6. Click "Send"

**From messages page**:
1. Click "New Message"
2. Select the client
3. Continue as above

### Replying to Messages

1. Open a conversation thread
2. Read the client's message
3. Type your reply at the bottom
4. Click "Send"

All messages are stored permanently for record-keeping.

## Activity Monitoring

### Activity Feed

The main dashboard shows recent activity including:
- Client portal registrations
- Onboarding completions
- Invite sent/activated
- Onboarding questionnaire completed
- Business plan generated
- Deliverable status changes
- Document downloads
- Messages sent/received
- Client logins

### Client-Specific Activity

On each client's detail page:
1. Click "Activity" tab
2. See all actions for that client
3. Filter by date or activity type
4. Export activity log if needed

### Activity Types

The system tracks:
- `CLIENT_CREATED`: When you add a client
- `PORTAL_INVITED`: When you send an invite
- `PORTAL_ACTIVATED`: When client completes registration
- `ONBOARDING_COMPLETED`: When questionnaire is submitted
- `BUSINESS_PLAN_GENERATED`: When AI creates the plan
- `DELIVERABLE_CREATED`: When you add a deliverable
- `DELIVERABLE_DELIVERED`: When deliverable is marked complete
- `DOCUMENT_DOWNLOAD`: When client downloads a file
- `MESSAGE_SENT`: When messages are exchanged

## Reports and Analytics

### Client Statistics

View overall statistics:
- Total clients by status
- Active vs inactive breakdown
- Onboarding completion rate
- Average time to onboard
- Portal activation rate

### Deliverable Statistics

Track deliverable performance:
- On-time delivery rate
- Average time per deliverable
- Deliverables by month
- Status distribution

### Engagement Metrics

Monitor client engagement:
- Portal login frequency
- Document download activity
- Message response time
- Last activity date

## System Settings

### User Management

Add or remove admin users:
1. Go to "Settings" > "Users"
2. Click "Add User"
3. Enter email and assign role:
   - **Admin**: Full system access
   - **Manager**: Can manage clients but not system settings
   - **Viewer**: Read-only access

4. Send them their login credentials

### Notification Settings

Configure system notifications:
1. Go to "Settings" > "Notifications"
2. Toggle notifications for:
   - New client registrations
   - Onboarding completions
   - New messages
   - Deliverable due dates

### Customization

Personalize the system:
1. Go to "Settings" > "General"
2. Update:
   - Company name
   - Logo
   - Brand colors
   - Email templates
   - Default onboarding questions

## Best Practices

### Client Management

1. **Respond to onboarding promptly** - Generate business plans within 48 hours
2. **Keep deliverables on schedule** - Clients rely on monthly delivery
3. **Communicate proactively** - Don't wait for clients to ask
4. **Update client status regularly** - Keep the system accurate
5. **Review activity weekly** - Stay on top of client needs

### Security

1. **Use strong passwords** - 12+ characters with mixed types
2. **Log out on shared computers** - Never leave your session open
3. **Don't share login credentials** - Each admin gets their own account
4. **Review user access regularly** - Remove inactive users
5. **Keep software updated** - Install updates promptly

### Efficiency Tips

1. **Use keyboard shortcuts** - Learn common shortcuts
2. **Batch similar tasks** - Do all invites at once, etc.
3. **Set up email templates** - For common responses
4. **Use filters and search** - Find information quickly
5. **Leverage AI generation** - Let the system create first drafts

## Troubleshooting

### Client Can't Access Portal

**Check**:
1. Has invite been sent?
2. Has invite expired?
3. Is portal user marked as active?
4. Is client status active?

**Fix**:
- Resend invite if needed
- Activate portal user
- Update client status

### Business Plan Won't Generate

**Check**:
1. Has client completed onboarding?
2. Are all required fields filled?
3. Does business plan already exist?

**Fix**:
- Ensure onboarding is complete
- Delete existing plan if regenerating
- Check server logs for errors

### Deliverables Not Showing

**Check**:
1. Is deliverable created?
2. Is it linked to correct client?
3. Is status set correctly?

**Fix**:
- Verify client assignment
- Check deliverable status
- Recreate if necessary

### Messages Not Sending

**Check**:
1. Is client portal active?
2. Is internet connection stable?
3. Are there any error messages?

**Fix**:
- Verify portal status
- Try refreshing the page
- Check browser console for errors

## Getting Help

### Support Resources

1. **This documentation** - Start here
2. **System logs** - Check for error messages
3. **Support team** - Contact for technical issues

### Emergency Contacts

For critical system issues:
- Contact your technical administrator
- Email: support@wavelaunch.com (example)
- Priority support for production issues

---

**Remember**: You're the face of Wavelaunch to your clients. Professional, timely communication and high-quality deliverables are key to client success and retention!
