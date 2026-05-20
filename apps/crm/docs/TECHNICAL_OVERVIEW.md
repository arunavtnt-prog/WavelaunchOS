# Technical Overview

This document explains how the Wavelaunch CRM system works from a technical perspective, written in simple language.

## System Architecture

### What is it built with?

The system uses modern web technologies:

**Frontend (What users see)**:
- **Next.js 15**: A React framework for building web applications
- **TypeScript**: JavaScript with type safety (catches errors before they happen)
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn/UI**: Beautiful, accessible UI components

**Backend (Server-side)**:
- **Next.js API Routes**: Server functions built into Next.js
- **Prisma**: Database toolkit for type-safe database access
- **NextAuth.js**: Authentication library for admin login
- **Custom JWT**: JSON Web Tokens for portal authentication

**Database**:
- **SQLite**: Lightweight database (default for development)
- **Supports**: PostgreSQL, MySQL, etc. for production

**AI Integration**:
- **Anthropic Claude**: AI model for generating business plans

## How It Works

### 1. Admin Dashboard Flow

```
Admin logs in → NextAuth validates credentials → Session created →
Admin manages clients → Data saved to database → Client notified
```

**Key Components**:
- `src/app/(dashboard)/`: Admin dashboard pages
- `src/app/api/admin/`: Admin API endpoints
- `src/lib/auth.ts`: Admin authentication logic
- `prisma/schema.prisma`: Database structure

### 2. Client Portal Flow

```
Client receives invite → Clicks link → Creates password →
Portal account activated → Completes onboarding → Business plan generated →
Access documents and messages
```

**Key Components**:
- `src/app/(portal)/`: Client portal pages
- `src/app/api/portal/`: Portal API endpoints
- `src/lib/auth/portal-auth.ts`: Portal authentication
- `src/middleware.ts`: Route protection

### 3. Data Flow

```
User Action → Frontend Component → API Route → Database Operation →
Response → Frontend Update → User sees result
```

## Project Structure

```
wavelaunch-crm/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router pages
│   │   ├── (dashboard)/          # Admin dashboard (grouped route)
│   │   │   ├── dashboard/        # Main admin dashboard
│   │   │   ├── clients/          # Client management
│   │   │   └── login/            # Admin login
│   │   ├── (portal)/             # Client portal (grouped route)
│   │   │   ├── portal/           # Portal pages
│   │   │   │   ├── dashboard/    # Client dashboard
│   │   │   │   ├── onboarding/   # 6-step wizard
│   │   │   │   ├── documents/    # Document library
│   │   │   │   └── messages/     # Messaging
│   │   │   └── invite/           # Invite acceptance
│   │   └── api/                  # API endpoints
│   │       ├── admin/            # Admin APIs
│   │       └── portal/           # Portal APIs
│   ├── components/               # React components
│   │   ├── ui/                   # Base UI components
│   │   ├── admin/                # Admin-specific components
│   │   └── portal/               # Portal-specific components
│   ├── lib/                      # Utility libraries
│   │   ├── auth/                 # Authentication utilities
│   │   ├── db.ts                 # Database connection
│   │   └── rate-limiter.ts       # Rate limiting
│   └── middleware.ts             # Route protection
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Database version history
│   └── seed.ts                   # Test data generator
├── public/                       # Static files
│   └── uploads/                  # Uploaded files
├── docs/                         # Documentation
└── package.json                  # Dependencies and scripts
```

## Key Technical Concepts

### 1. Authentication (Who you are)

**Admin Authentication**:
- Uses NextAuth.js with credentials provider
- Passwords hashed with bcrypt (12 rounds)
- Session stored in encrypted JWT
- Middleware protects admin routes

**Portal Authentication**:
- Custom JWT implementation
- Tokens stored in HTTP-only cookies
- Database verification on each request
- Middleware protects portal routes

### 2. Authorization (What you can do)

**Role-Based Access**:
- Admin: Full system access
- Client: Can only see their own data

**Data Isolation**:
- Every query checks ownership
- `getVerifiedPortalSession()` validates permissions
- Middleware blocks unauthorized access

### 3. Security Features

**Password Security**:
- Minimum 8 characters
- Must include: uppercase, lowercase, number, special char
- Hashed with bcrypt before storage
- Never stored in plain text

**Token Security**:
- Invite tokens hashed with SHA-256
- JWT secrets must be 32+ characters
- Tokens expire after set time
- One-time use for invite links

**Rate Limiting**:
- 5 login attempts per 15 minutes
- 3 password reset requests per hour
- 20 invite generations per hour
- Prevents brute force attacks

**Session Security**:
- Database validation on each request
- Checks user is active
- Verifies client ownership
- Automatic session expiry

### 4. Database Schema

**Main Tables**:

```
User (Admin)
- id, email, password (hashed), name, role

Client
- id, creatorName, email, status
- All onboarding fields (niche, vision, audience, etc.)

ClientPortalUser
- id, email, password (hashed), clientId
- isActive, completedOnboarding, inviteToken (hashed)

BusinessPlan
- id, clientId, version, status
- contentMarkdown, generatedBy, generatedAt

Deliverable
- id, clientId, month, title, status
- contentMarkdown, pdfUrl

PortalMessage
- id, threadId, clientId, clientUserId
- subject, body, isFromAdmin, isRead

PortalNotification
- id, clientUserId, type, title, message
- isRead, actionUrl

Activity
- id, clientId, userId, type, description
```

**Relationships**:
- Client has one ClientPortalUser
- Client has many BusinessPlans
- Client has many Deliverables
- Client has many Activities
- ClientPortalUser has many PortalMessages
- ClientPortalUser has many PortalNotifications

### 5. API Design

**RESTful Principles**:
- GET: Retrieve data
- POST: Create new data
- PATCH/PUT: Update data
- DELETE: Remove data

**Response Format**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error Format**:
```json
{
  "success": false,
  "error": "Error message here"
}
```

**Status Codes**:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests (rate limited)
- 500: Server Error

### 6. State Management

**Server State** (data from database):
- Fetched via API calls
- Cached where appropriate
- Revalidated on mutations

**Client State** (UI state):
- React hooks (useState, useEffect)
- Form state managed by React Hook Form
- No global state management (kept simple)

### 7. File Handling

**Upload Process**:
1. Client selects file
2. Frontend validates size and type
3. File sent to `/api/portal/upload`
4. Server validates again
5. File saved to `public/uploads/`
6. URL returned to client
7. URL stored in database

**Download Process**:
1. Client clicks download
2. Frontend requests `/api/portal/documents/.../download`
3. Server verifies ownership
4. Returns file URL or redirect
5. Browser downloads file

## Development Workflow

### Local Development

1. **Start the dev server**:
   ```bash
   npm run dev
   ```
   - Hot reload enabled
   - TypeScript type checking
   - Automatic error overlay

2. **Database changes**:
   ```bash
   npm run db:generate  # Update Prisma client
   npm run db:push      # Apply to database
   ```

3. **View database**:
   ```bash
   npm run db:studio    # Opens Prisma Studio in browser
   ```

### Testing

**Test Types**:
- Unit tests: Test individual functions
- Integration tests: Test API endpoints
- E2E tests: Test full user flows (Playwright)

**Running Tests**:
```bash
npm run test         # Run all tests
npm run test:ui      # Interactive test runner
```

### Building for Production

1. **Build the app**:
   ```bash
   npm run build
   ```
   - Optimizes code
   - Generates static assets
   - Type checks everything

2. **Start production server**:
   ```bash
   npm start
   ```
   - Runs optimized build
   - Ready for production traffic

## Environment Variables

Required variables:

```env
# Database connection string
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# Base URL for the application
NEXT_PUBLIC_APP_URL="https://wavelaunch.com"

# NextAuth configuration
NEXTAUTH_URL="https://wavelaunch.com"
NEXTAUTH_SECRET="your-super-secret-key-32-chars-minimum"

# Optional: AI features
ANTHROPIC_API_KEY="sk-ant-..."
```

**Security Notes**:
- Never commit `.env` to git
- Use different values for dev/prod
- Rotate secrets regularly
- Use environment variable management in production

## Performance Optimizations

**Frontend**:
- Static page generation where possible
- Image optimization with Next.js Image
- Code splitting by route
- Lazy loading of components

**Backend**:
- Database query optimization
- Efficient Prisma queries
- API response caching
- Rate limiting to prevent abuse

**Database**:
- Indexed fields for fast lookups
- Efficient relationship queries
- Connection pooling

## Deployment Options

### Vercel (Recommended)

Pros:
- One-click deployment
- Automatic HTTPS
- Built-in CDN
- Scales automatically
- Free tier available

Steps:
1. Push code to GitHub
2. Import to Vercel
3. Set environment variables
4. Deploy

### Railway

Pros:
- Easy database setup
- Affordable pricing
- Good for small teams

### DigitalOcean/AWS/etc.

Pros:
- Full control
- Can be cheaper at scale

Cons:
- More setup required
- Need to manage infrastructure

## Monitoring and Logging

**Application Logs**:
- Console logs in development
- Structured logging in production
- Error tracking (can integrate Sentry)

**Database Monitoring**:
- Query performance
- Connection pool status
- Slow query identification

**Security Monitoring**:
- Failed login attempts
- Rate limit violations
- Unusual activity patterns

## Common Technical Tasks

### Adding a New API Endpoint

1. Create file in `src/app/api/`
2. Export GET, POST, etc. functions
3. Add authentication check
4. Validate input with Zod
5. Perform database operations
6. Return response

### Adding a New Page

1. Create file in `src/app/(dashboard)/` or `src/app/(portal)/`
2. Create component
3. Fetch data (if needed)
4. Add to navigation (if needed)
5. Protect with middleware (automatic)

### Adding a Database Field

1. Update `prisma/schema.prisma`
2. Run `npm run db:generate`
3. Run `npm run db:push` or `npm run db:migrate`
4. Update TypeScript types (automatic)
5. Update UI components as needed

## Security Best Practices

**Code Level**:
- Input validation on all endpoints
- Output sanitization
- SQL injection prevention (Prisma handles this)
- XSS prevention (React handles this)
- CSRF protection (middleware handles this)

**Infrastructure Level**:
- HTTPS only in production
- Security headers configured
- Rate limiting enabled
- Database access restricted
- Environment variables secured

**Operational Level**:
- Regular security updates
- Access log monitoring
- Incident response plan
- Backup strategy
- Disaster recovery plan

## Troubleshooting

### Build Failures

Common causes:
- TypeScript errors
- Missing environment variables
- Dependency conflicts

Solution: Check build logs for specific errors

### Database Issues

Common causes:
- Connection string incorrect
- Database not running
- Migration conflicts

Solution: Verify connection, run migrations

### Performance Issues

Common causes:
- Too many database queries
- Large file uploads
- Slow third-party APIs

Solution: Profile and optimize hot paths

---

This system is built with modern best practices and security in mind. The architecture is scalable and maintainable for long-term use.
