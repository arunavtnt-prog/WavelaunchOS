# WavelaunchOS CRM - API Documentation

This document provides comprehensive documentation for all API endpoints in the WavelaunchOS CRM application.

## Table of Contents

- [Authentication](#authentication)
- [Clients](#clients)
- [Business Plans](#business-plans)
- [Deliverables](#deliverables)
- [Files](#files)
- [Notes](#notes)
- [Jobs](#jobs)
- [Backups](#backups)
- [System](#system)
- [Error Handling](#error-handling)

---

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API routes (except `/api/auth/*`) require authentication via NextAuth session.

### Login

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "admin@wavelaunch.studio",
  "password": "wavelaunch123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "admin@wavelaunch.studio",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

---

## Clients

### List Clients

```http
GET /api/clients
```

**Query Parameters:**
- `search` (string, optional): Search by name, email, or brand
- `status` (string, optional): Filter by status (ACTIVE, INACTIVE, ARCHIVED)
- `limit` (number, optional): Results per page (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "client-id",
      "creatorName": "John Doe",
      "brandName": "Doe Enterprises",
      "email": "john@example.com",
      "status": "ACTIVE",
      "niche": "Technology",
      "socialPlatform": "YouTube",
      "followersCount": 100000,
      "avgViews": 50000,
      "engagementRate": 5.2,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

### Get Client by ID

```http
GET /api/clients/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "client-id",
    "creatorName": "John Doe",
    "brandName": "Doe Enterprises",
    "email": "john@example.com",
    "phone": "+1234567890",
    "status": "ACTIVE",
    "niche": "Technology",
    "socialPlatform": "YouTube",
    "followersCount": 100000,
    "avgViews": 50000,
    "engagementRate": 5.2,
    "audienceDemographics": "18-35, tech-savvy professionals",
    "contentStyle": "Educational, entertaining",
    "pastBrandPartnerships": "TechCorp, GadgetHub",
    "budget": 50000,
    "timeline": "6-12 months",
    "goals": "Launch premium product line",
    "challenges": "Building supplier relationships",
    "notes": "Highly engaged audience",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

### Create Client

```http
POST /api/clients
Content-Type: application/json

{
  "creatorName": "John Doe",
  "email": "john@example.com",
  "niche": "Technology",
  "socialPlatform": "YouTube",
  "followersCount": 100000,
  "avgViews": 50000,
  "engagementRate": 5.2,
  "brandName": "Doe Enterprises",
  "phone": "+1234567890",
  "audienceDemographics": "18-35, tech-savvy professionals",
  "contentStyle": "Educational, entertaining",
  "pastBrandPartnerships": "TechCorp",
  "budget": 50000,
  "timeline": "6-12 months",
  "goals": "Launch premium product line",
  "challenges": "Building supplier relationships",
  "notes": "Highly engaged audience"
}
```

**Required Fields:**
- `creatorName`, `email`, `niche`, `socialPlatform`, `followersCount`, `avgViews`, `engagementRate`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-client-id",
    "creatorName": "John Doe",
    ...
  }
}
```

### Update Client

```http
PATCH /api/clients/:id
Content-Type: application/json

{
  "status": "INACTIVE",
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "client-id",
    ...
  }
}
```

### Delete Client

```http
DELETE /api/clients/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

---

## Business Plans

### List Business Plans

```http
GET /api/business-plans
```

**Query Parameters:**
- `clientId` (string, required): Filter by client ID
- `status` (string, optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "plan-id",
      "clientId": "client-id",
      "version": 1,
      "status": "APPROVED",
      "content": "# Business Plan\n\nPlan content...",
      "approvedAt": "2025-01-20T10:00:00Z",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Generate Business Plan

```http
POST /api/business-plans/generate
Content-Type: application/json

{
  "clientId": "client-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-id",
    "message": "Business plan generation queued"
  }
}
```

### Update Business Plan

```http
PATCH /api/business-plans/:id
Content-Type: application/json

{
  "content": "# Updated Business Plan\n\nUpdated content...",
  "status": "PENDING_REVIEW"
}
```

### Approve Business Plan

```http
POST /api/business-plans/:id/approve
```

### Reject Business Plan

```http
POST /api/business-plans/:id/reject
Content-Type: application/json

{
  "reason": "Needs more market research"
}
```

### Export Business Plan as PDF

```http
POST /api/business-plans/:id/pdf
Content-Type: application/json

{
  "quality": "final"  // or "draft"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-id",
    "message": "PDF generation queued"
  }
}
```

---

## Deliverables

### List Deliverables

```http
GET /api/deliverables
```

**Query Parameters:**
- `clientId` (string, required): Filter by client ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "deliverable-id",
      "clientId": "client-id",
      "monthNumber": 1,
      "title": "Month 1: Foundation & Planning",
      "status": "APPROVED",
      "content": "# Month 1 Deliverable\n\n...",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Generate Deliverable

```http
POST /api/deliverables/generate
Content-Type: application/json

{
  "clientId": "client-id",
  "monthNumber": 1
}
```

### Update Deliverable

```http
PATCH /api/deliverables/:id
Content-Type: application/json

{
  "content": "# Updated content...",
  "status": "DELIVERED"
}
```

### Export Deliverable as PDF

```http
POST /api/deliverables/:id/pdf
Content-Type: application/json

{
  "quality": "final"
}
```

---

## Files

### List Files

```http
GET /api/files
```

**Query Parameters:**
- `clientId` (string, optional): Filter by client
- `category` (string, optional): Filter by category (BUSINESS_PLAN, DELIVERABLE, UPLOAD, MISC)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "file-id",
      "filename": "business-plan-v1.pdf",
      "filepath": "/data/uploads/client-id/business-plan-v1.pdf",
      "mimetype": "application/pdf",
      "sizeBytes": 1024000,
      "category": "BUSINESS_PLAN",
      "clientId": "client-id",
      "uploadedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Upload File

```http
POST /api/files/upload
Content-Type: multipart/form-data

file: <file>
clientId: "client-id"
category: "UPLOAD"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file-id",
    "filename": "document.pdf",
    "sizeBytes": 1024000
  }
}
```

### Download File

```http
GET /api/files/:id
```

Returns the file as a download stream.

### Delete File

```http
DELETE /api/files/:id
```

---

## Notes

### List Notes

```http
GET /api/notes
```

**Query Parameters:**
- `clientId` (string, optional): Filter by client
- `tag` (string, optional): Filter by tag
- `important` (boolean, optional): Filter by importance

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "note-id",
      "title": "Client call notes",
      "content": "<p>Rich text content...</p>",
      "tags": ["meeting", "strategy"],
      "isImportant": true,
      "clientId": "client-id",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T11:00:00Z"
    }
  ]
}
```

### Create Note

```http
POST /api/notes
Content-Type: application/json

{
  "title": "Client call notes",
  "content": "<p>Rich text content...</p>",
  "tags": ["meeting", "strategy"],
  "isImportant": true,
  "clientId": "client-id"
}
```

### Update Note

```http
PATCH /api/notes/:id
Content-Type: application/json

{
  "title": "Updated title",
  "content": "<p>Updated content...</p>",
  "tags": ["meeting", "follow-up"]
}
```

### Delete Note

```http
DELETE /api/notes/:id
```

---

## Jobs

### List Jobs

```http
GET /api/jobs
```

**Query Parameters:**
- `status` (string, optional): Filter by status (QUEUED, PROCESSING, COMPLETED, FAILED)
- `type` (string, optional): Filter by type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "job-id",
      "type": "GENERATE_BUSINESS_PLAN",
      "status": "COMPLETED",
      "payload": {...},
      "result": {...},
      "attempts": 1,
      "maxAttempts": 3,
      "createdAt": "2025-01-15T10:00:00Z",
      "startedAt": "2025-01-15T10:00:05Z",
      "completedAt": "2025-01-15T10:02:00Z"
    }
  ]
}
```

### Get Job Status

```http
GET /api/jobs/:id
```

### Cancel Job

```http
POST /api/jobs/:id/cancel
```

### Retry Job

```http
POST /api/jobs/:id/retry
```

---

## Backups

### List Backups

```http
GET /api/backups
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backups": [
      {
        "filename": "backup-2025-01-15T10-00-00.db",
        "filepath": "/data/backups/backup-2025-01-15T10-00-00.db",
        "timestamp": "2025-01-15T10:00:00Z",
        "sizeBytes": 2048000,
        "isValid": true
      }
    ],
    "stats": {
      "totalBackups": 15,
      "totalSizeBytes": 30720000,
      "validBackups": 14,
      "invalidBackups": 1
    }
  }
}
```

### Create Backup

```http
POST /api/backups
Content-Type: application/json

{
  "label": "before-migration"  // optional
}
```

### Restore Backup

```http
POST /api/backups/:filename/restore
```

**Response:**
```json
{
  "success": true,
  "data": {
    "safetyBackup": "safety-backup-2025-01-15T10-05-00.db"
  }
}
```

### Download Backup

```http
GET /api/backups/:filename
```

### Delete Backup

```http
DELETE /api/backups/:filename
```

---

## System

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00Z",
  "uptime": 3600,
  "database": "connected",
  "storage": {
    "used": 5368709120,
    "total": 53687091200,
    "percentage": 10
  }
}
```

### Storage Stats

```http
GET /api/storage/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSizeBytes": 5368709120,
    "totalFiles": 150,
    "byCategory": {
      "BUSINESS_PLAN": 1073741824,
      "DELIVERABLE": 2147483648,
      "UPLOAD": 1073741824,
      "MISC": 1073741824
    },
    "byClient": {
      "client-id-1": 2147483648,
      "client-id-2": 3221225472
    }
  }
}
```

---

## Error Handling

All API endpoints follow a consistent error response format:

### Success Response

```json
{
  "success": true,
  "data": {...}
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `CAPACITY_ERROR` | 429 | Resource limit exceeded |
| `STORAGE_ERROR` | 507 | Insufficient storage |
| `INTERNAL_ERROR` | 500 | Server error |

### Example Error

```json
{
  "success": false,
  "error": "Client capacity limit reached (100/100)",
  "code": "CAPACITY_ERROR",
  "statusCode": 429
}
```

---

## Rate Limiting

Currently, no rate limiting is enforced. For production, consider implementing rate limiting per user/IP.

---

## Webhooks (Future)

Webhook support is planned for future releases to notify external systems of events like:
- Client onboarding completed
- Business plan approved
- Deliverable generated
- Backup completed

---

## SDK/Client Libraries (Future)

Official client libraries are planned for:
- TypeScript/JavaScript
- Python
- Go

---

## Support

For API questions or issues:
- Documentation: `/docs`
- GitHub Issues: <repository-url>/issues
- Email: dev@wavelaunch.studio
