# Wavelaunch CRM Documentation

Welcome to the Wavelaunch CRM system! This documentation will help you understand, set up, and use the system.

## What is Wavelaunch CRM?

Wavelaunch CRM is a customer relationship management system designed specifically for managing client onboarding, business plan generation, and deliverable tracking for creative and marketing agencies.

### Who is it for?

- **Agency Administrators**: Manage clients, create business plans, track deliverables
- **Clients**: Access their portal to view progress, documents, and communicate with the agency

## System Components

The Wavelaunch CRM system has two main parts:

### 1. Admin Dashboard
Where agency staff manage everything:
- Client accounts and portal access
- Business plan generation
- Deliverable tracking (8-month program)
- Client activity monitoring
- AI-powered content generation

### 2. Client Portal
Where clients can:
- Complete onboarding questionnaires
- View their business plans
- Track monthly deliverables
- Message the agency team
- Download documents

## Key Features

### For Administrators
- **Client Management**: Create and manage client accounts
- **Portal Invites**: Send secure invite links to clients
- **AI Business Plans**: Generate personalized business plans from client data
- **Deliverable Tracking**: Monitor 8-month program progress
- **Activity Feed**: See what clients are doing
- **Secure Authentication**: Role-based access control

### For Clients
- **Secure Portal Access**: Invite-only registration
- **6-Step Onboarding**: Comprehensive business questionnaire
- **Business Plan Access**: View and download personalized plans
- **Progress Tracking**: See monthly milestone completion
- **Document Library**: Access all deliverables
- **Messaging**: Communicate with the agency team

## Documentation Guide

### For Non-Technical Users
- [User Guide](./USER_GUIDE.md) - How to use the client portal
- [Admin Guide](./ADMIN_GUIDE.md) - How to manage the system as an administrator

### For Technical Users
- [Setup Guide](./SETUP_GUIDE.md) - How to install and configure the system
- [Technical Overview](./TECHNICAL_OVERVIEW.md) - How the system works technically
- [Security Guide](./SECURITY.md) - Security features and best practices
- [API Reference](./API_REFERENCE.md) - API endpoint documentation

## Quick Links

- **Production URL**: Configure in environment variables
- **Admin Dashboard**: `/dashboard`
- **Client Portal**: `/portal`
- **API Documentation**: See [API Reference](./API_REFERENCE.md)

## Getting Help

If you need assistance:
1. Check the relevant guide above
2. Contact your system administrator
3. Review the troubleshooting section in the Setup Guide

## Security Notice

This system includes enterprise-grade security features:
- Encrypted passwords (bcrypt with 12 rounds)
- Hashed invite tokens (SHA-256)
- Rate limiting on authentication endpoints
- Session verification with database validation
- Secure cookie handling
- Input validation and sanitization

All security features are active by default. Do not disable them in production.

---

Last Updated: January 2025
Version: 1.0.0
