# Wavelaunch Studio Intake Application Form

A comprehensive, multi-step application form for creators and influencers to apply for brand-building partnerships with Wavelaunch Studio.

## Features

### Core Functionality
- **Multi-step Wizard**: 9-section application form with smooth transitions
- **Autosave**: Automatic progress saving to localStorage
- **Form Validation**: Comprehensive Zod schema validation
- **Review Page**: Complete application review before submission
- **ZIP Upload**: File upload support (max 25MB)
- **Email Notifications**: Automated emails to applicants and admins
- **CRM Integration**: Direct integration with existing Wavelaunch CRM database
- **Responsive Design**: Mobile-first, works on all devices

### User Experience
- **Welcome Page**: Detailed introduction to Wavelaunch Studio
- **Progress Indicator**: Visual progress bar and step navigation
- **Smooth Animations**: Framer Motion micro-interactions
- **Success Page**: Celebration with confetti animation
- **Error Handling**: User-friendly validation and error messages

### Technical Features
- **Next.js 15**: App Router, Server Actions
- **React 19**: Latest React features
- **TypeScript**: Full type safety
- **Prisma ORM**: Type-safe database access
- **shadcn/ui**: Modern, accessible UI components
- **Tailwind CSS**: Utility-first styling

---

## Project Structure

```
Public Application Form/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── applications/
│   │   │       └── route.ts          # Application submission API
│   │   ├── apply/
│   │   │   ├── review/
│   │   │   │   └── page.tsx          # Review page
│   │   │   └── page.tsx              # Multi-step form wizard
│   │   ├── success/
│   │   │   └── page.tsx              # Success page
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Welcome page
│   ├── components/
│   │   ├── application-form/
│   │   │   ├── step-basic-info.tsx   # Step 1: Basic Information
│   │   │   ├── step-career.tsx       # Step 2: Career Background
│   │   │   ├── step-audience.tsx     # Step 3: Audience & Demographics
│   │   │   ├── step-pain-points.tsx  # Step 4: Pain Points & Needs
│   │   │   ├── step-competition.tsx  # Step 5: Competition & Market
│   │   │   ├── step-brand-identity.tsx # Step 6: Brand Identity
│   │   │   ├── step-product.tsx      # Step 7: Product Direction
│   │   │   ├── step-business-goals.tsx # Step 8: Business Goals
│   │   │   └── step-logistics.tsx    # Step 9: Logistics & Terms
│   │   └── ui/                       # shadcn/ui components
│   ├── lib/
│   │   ├── autosave.ts               # LocalStorage autosave
│   │   ├── db.ts                     # Prisma client
│   │   ├── email.ts                  # Resend email service
│   │   ├── storage.ts                # File upload handling
│   │   └── utils.ts                  # Utility functions
│   ├── schemas/
│   │   └── application.ts            # Zod validation schemas
│   └── types/
│       └── index.ts                  # TypeScript types & constants
├── prisma/
│   └── schema.prisma                 # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Access to existing Wavelaunch CRM database
- Resend API key (for email notifications)

### Step 1: Install Dependencies

```bash
cd "Public Application Form"
npm install
# or
yarn install
```

### Step 2: Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database connection (use existing CRM database)
DATABASE_URL="file:../wavelaunch-crm/data/wavelaunch.db"

# Email service (Resend)
RESEND_API_KEY="re_your_resend_api_key_here"

# Admin notification email
ADMIN_EMAIL="arunav@wavelaunch.org"

# File upload limits
MAX_FILE_SIZE_MB=25
STORAGE_PATH="../wavelaunch-crm/data/applications"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXT_PUBLIC_WAVELAUNCH_URL="https://wavelaunch.vc"
```

### Step 3: Database Setup

The application uses the existing CRM database. Run Prisma migrations:

```bash
npx prisma generate
npx prisma db push
```

This will:
- Generate Prisma Client
- Create the `Application` table in the existing database
- Maintain compatibility with existing CRM tables

### Step 4: Run Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3001`

---

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Path to SQLite database | Yes | - |
| `RESEND_API_KEY` | Resend API key for emails | Yes | - |
| `ADMIN_EMAIL` | Email for admin notifications | Yes | `arunav@wavelaunch.org` |
| `MAX_FILE_SIZE_MB` | Max ZIP file size in MB | No | `25` |
| `STORAGE_PATH` | Path for file uploads | No | `./data/applications` |
| `NEXT_PUBLIC_APP_URL` | Public application URL | Yes | - |
| `NEXT_PUBLIC_WAVELAUNCH_URL` | Wavelaunch VC website URL | No | `https://wavelaunch.vc` |

---

## CRM Integration

### Database Schema

The application creates a new `Application` table that integrates with the existing CRM:

```prisma
model Application {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // All form fields (29+ fields)
  fullName              String
  email                 String
  instagramHandle       String?
  // ... (see schema.prisma for complete list)

  status                String   @default("PENDING")
  convertedToClientId   String?  // Link to Client when approved
}
```

### Conversion Workflow

When an application is approved:

1. Admin reviews application in CRM
2. Application status updated to "APPROVED"
3. Create new `Client` record from application data
4. Link `Application.convertedToClientId` to new `Client.id`

### Activity Logging

All submissions are automatically logged in the `Activity` table:

```typescript
{
  type: 'APPLICATION_SUBMITTED',
  description: 'New application submitted by {name}',
  metadata: { applicationId, email, industryNiche }
}
```

---

## Email Notifications

### Applicant Confirmation Email

Sent immediately upon successful submission:
- Confirmation of receipt
- Application ID
- Next steps timeline
- Contact information

### Admin Notification Email

Sent to `ADMIN_EMAIL`:
- Applicant details summary
- Direct link to view full application
- Quick access to key information

### Email Service Setup

Using Resend API:

1. Sign up at [resend.com](https://resend.com)
2. Verify your sending domain
3. Copy API key to `.env`
4. Customize email templates in `src/lib/email.ts`

---

## File Upload System

### ZIP File Validation

- **Max size**: 25 MB (configurable)
- **File type**: `.zip` only
- **Contents**: Media kit, collaborations, brand photos

### Storage

Files are stored locally:
```
{STORAGE_PATH}/{applicationId}/{timestamp}-{filename}.zip
```

### Future Enhancement: Supabase Storage

To switch to Supabase storage:

1. Install Supabase client:
```bash
npm install @supabase/supabase-js
```

2. Update `src/lib/storage.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
)

export async function saveZipFile(file: File, applicationId: string) {
  const { data, error } = await supabase.storage
    .from('applications')
    .upload(`${applicationId}/${file.name}`, file)

  return { filepath: data.path, ... }
}
```

---

## Customization Guide

### Adding New Form Fields

1. **Update Schema** (`src/schemas/application.ts`):
```typescript
export const applicationSchema = z.object({
  // ... existing fields
  newField: z.string().min(5, 'Validation message'),
})
```

2. **Update Database** (`prisma/schema.prisma`):
```prisma
model Application {
  // ... existing fields
  newField    String
}
```

3. **Run Migration**:
```bash
npx prisma db push
```

4. **Add to Form Step** (`src/components/application-form/step-*.tsx`):
```tsx
<Input {...register('newField')} />
```

### Modifying Brand Personalities

Edit `src/types/index.ts`:

```typescript
export const BRAND_PERSONALITIES = [
  { value: 'new-personality', label: 'New Personality' },
  // ... existing options
]
```

### Customizing Product Categories

Edit `src/types/index.ts`:

```typescript
export const PRODUCT_CATEGORIES = [
  {
    value: 'new-category',
    label: 'New Category',
    niches: ['related', 'niches']
  },
  // ... existing categories
]
```

### Changing Email Templates

Edit `src/lib/email.ts`:

```typescript
export async function sendApplicationConfirmation(data) {
  await resend.emails.send({
    subject: 'Custom Subject',
    html: `Your custom HTML template`,
  })
}
```

---

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Add Wavelaunch Studio application form"
git push origin main
```

2. **Deploy to Vercel**:
```bash
npm i -g vercel
vercel
```

3. **Configure Environment Variables** in Vercel Dashboard

4. **Update Public URL** in `.env`:
```env
NEXT_PUBLIC_APP_URL="https://apply.wavelaunch.studio"
```

### Other Platforms

**Netlify**:
```bash
npm run build
netlify deploy --prod
```

**Railway**:
```bash
railway up
```

**Docker**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## Production Checklist

- [ ] Set all environment variables
- [ ] Configure production database
- [ ] Verify email sending domain
- [ ] Test file upload limits
- [ ] Enable HTTPS
- [ ] Add rate limiting to API routes
- [ ] Configure CSP headers
- [ ] Add analytics tracking
- [ ] Set up error monitoring (Sentry)
- [ ] Create backup strategy for database
- [ ] Test on mobile devices
- [ ] Verify GDPR compliance

---

## API Documentation

### POST `/api/applications`

Submit a new application.

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  // ... all form fields
  "termsAccepted": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "message": "Application submitted successfully"
  }
}
```

### GET `/api/applications?id={applicationId}`

Retrieve a specific application (admin only).

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "fullName": "John Doe",
    // ... all fields
  }
}
```

### GET `/api/applications`

List all applications (admin only).

**Response**:
```json
{
  "success": true,
  "data": [
    { "id": "...", "fullName": "...", ... },
    // ... more applications
  ]
}
```

---

## Troubleshooting

### Database Connection Errors

**Issue**: `Can't reach database server`

**Solution**: Verify `DATABASE_URL` points to correct database file:
```env
DATABASE_URL="file:../wavelaunch-crm/data/wavelaunch.db"
```

### Email Not Sending

**Issue**: Emails not being sent

**Solutions**:
1. Verify Resend API key is correct
2. Check sending domain is verified
3. Review Resend dashboard for errors
4. Check spam folder

### File Upload Fails

**Issue**: ZIP upload returns error

**Solutions**:
1. Verify file is under 25 MB
2. Check file is actually `.zip` format
3. Ensure storage directory has write permissions:
```bash
mkdir -p ../wavelaunch-crm/data/applications
chmod 755 ../wavelaunch-crm/data/applications
```

### Autosave Not Working

**Issue**: Form data not saving

**Solution**: Check browser's localStorage is enabled and not full

---

## Performance Optimization

### Image Optimization

Use Next.js Image component:
```tsx
import Image from 'next/image'

<Image
  src="/logo.png"
  width={200}
  height={50}
  alt="Wavelaunch Studio"
/>
```

### Code Splitting

Components are automatically code-split by Next.js. For manual splitting:

```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
})
```

### Caching

Add caching to API routes:

```typescript
export async function GET(request: NextRequest) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
```

---

## Security Considerations

### Input Validation

All inputs validated with Zod schemas before database insertion.

### SQL Injection

Prisma ORM provides parameterized queries, preventing SQL injection.

### XSS Prevention

React automatically escapes user input. For additional safety:
```tsx
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(userInput)
```

### CSRF Protection

Add CSRF tokens for production:
```bash
npm install @edge-csrf/nextjs
```

### Rate Limiting

Implement rate limiting for API routes:
```bash
npm install @upstash/ratelimit
```

---

## Support

For questions or issues:

- **Email**: support@wavelaunch.studio
- **Documentation**: This README
- **CRM Dashboard**: Access via existing Wavelaunch CRM

---

## License

Proprietary - Wavelaunch VC © 2025

---

## Changelog

### Version 1.0.0 (2025-11-15)
- Initial release
- Multi-step form with 9 sections
- Autosave functionality
- ZIP file upload
- Email notifications
- CRM integration
- Welcome and success pages
