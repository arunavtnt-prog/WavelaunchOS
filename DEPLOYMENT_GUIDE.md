# Wavelaunch Application Form - Vercel Deployment Guide

This guide will walk you through deploying your application form to Vercel. Follow each step carefully.

---

## Your Configuration Values (Keep This Handy)

```
Project Name: d26-application
Your URL will be: https://d26-application.vercel.app
Application Form URL: https://d26-application.vercel.app/apply
```

---

## STEP 1: Open Vercel

1. Open your browser
2. Go to **https://vercel.com**
3. Click **"Log In"** (top right)
4. Log in with your GitHub account

---

## STEP 2: Create New Project

1. Once logged in, you'll see your Vercel dashboard
2. Click the **"Add New..."** button (top right)
3. Select **"Project"** from the dropdown

---

## STEP 3: Import Your Repository

1. You'll see a list of your GitHub repositories
2. Find **"WavelaunchOS"** in the list
3. Click the **"Import"** button next to it

---

## STEP 4: Configure Project Settings

This is the important part. You'll see a configuration screen.

### 4.1 Project Name
- In the **"Project Name"** field, type: `d26-application`

### 4.2 Framework Preset
- Should automatically detect **"Next.js"** - leave it as is

### 4.3 Root Directory (IMPORTANT!)
- Click **"Edit"** next to Root Directory
- Type: `wavelaunch-crm`
- Click **"Continue"**

### 4.4 Build and Output Settings
- Leave these as default (Vercel auto-detects them)

---

## STEP 5: Add Environment Variables

This is the most important step. Scroll down to **"Environment Variables"** section.

You need to add each variable one by one. For each one:
1. Type the **Name** in the left box
2. Type the **Value** in the right box
3. Click **"Add"**

### Add these 10 variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_bX6jZhuN8d9C0ep-fragrant-union-a4rsjrr4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `NEXTAUTH_SECRET` | `2i7kanb9GBbBoqpniw4FAiwQiz4i7ybS2JKI+m3o69A=` |
| `NEXTAUTH_URL` | `https://d26-application.vercel.app` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `arunavtnt@gmail.com` |
| `SMTP_PASS` | `hydupmikecirsix` |
| `SMTP_FROM` | `noreply@wavelaunch.studio` |
| `ADMIN_EMAIL` | `arunavtnt@gmail.com` |
| `NEXT_PUBLIC_APP_URL` | `https://d26-application.vercel.app` |
| `NODE_ENV` | `production` |

**Double-check each one before moving on!**

---

## STEP 6: Deploy

1. After adding all environment variables, click the **"Deploy"** button
2. Wait for the deployment to complete (this takes 2-5 minutes)
3. You'll see a "Congratulations!" screen when it's done

---

## STEP 7: Push Database Schema to Neon

The website is deployed, but we need to create the database tables.

### 7.1 Open Terminal on your Mac
- Press `Cmd + Space`
- Type `Terminal`
- Press Enter

### 7.2 Navigate to your project
Copy and paste this command, then press Enter:
```bash
cd /Users/arunav/.claude-worktrees/WavelaunchOS/ecstatic-hugle/wavelaunch-crm
```

### 7.3 Push the database schema
Copy and paste this entire command (it's one long line), then press Enter:
```bash
DATABASE_URL="postgresql://neondb_owner:npg_bX6jZhuN8d9C0ep-fragrant-union-a4rsjrr4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma db push
```

### 7.4 Wait for completion
You should see output ending with something like:
```
Your database is now in sync with your Prisma schema.
```

---

## STEP 8: Test Your Application Form

1. Open your browser
2. Go to: **https://d26-application.vercel.app/apply**
3. You should see the Wavelaunch application form landing page!

---

## STEP 9: Test a Submission

1. Click **"Start Application"**
2. Fill out a test application (you can use fake data)
3. Submit it
4. Check your email (`arunavtnt@gmail.com`) - you should receive a notification!

---

## Troubleshooting

### "Page not found" error
- Make sure you set Root Directory to `wavelaunch-crm` in Step 4.3
- Go to Vercel Dashboard → Your Project → Settings → General → Root Directory
- Change it to `wavelaunch-crm` and redeploy

### Build failed
- Check that all environment variables are added correctly
- Make sure there are no typos in the values

### Emails not sending
- Verify your Gmail app password is correct
- Make sure you're using an App Password, not your regular Gmail password

### Database errors
- Make sure you completed Step 7 (pushing the schema)
- Check that DATABASE_URL is correct with no extra spaces

---

## Your Final URLs

| Page | URL |
|------|-----|
| Landing Page | https://d26-application.vercel.app/apply |
| Application Form | https://d26-application.vercel.app/apply/form |
| Success Page | https://d26-application.vercel.app/apply/success |

---

## Need to Update Environment Variables Later?

1. Go to https://vercel.com
2. Click on your project (d26-application)
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in the left sidebar
5. Edit or add variables
6. Click **"Deployments"** tab
7. Click the **"..."** menu on the latest deployment
8. Click **"Redeploy"**

---

## Congratulations!

Your Wavelaunch application form is now live! Share this link with creators:

**https://d26-application.vercel.app/apply**

When someone submits an application:
1. You'll get an email notification
2. The applicant gets a confirmation email
3. The application is saved in your database
