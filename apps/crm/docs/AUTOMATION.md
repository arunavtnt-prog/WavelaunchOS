# Automated Workflows & Scheduled Tasks

This document describes the automated workflow system and scheduled task scheduler implemented in WavelaunchOS CRM.

## Overview

The system provides two types of automation:

1. **Event-Driven Workflows** - Triggered by user actions (client creation, deliverable completion, etc.)
2. **Scheduled Tasks** - Cron-based background jobs that run on a schedule

## Event-Driven Workflows

### Client Journey Automation

The client journey workflow system automatically manages client progression through the 8-month deliverable program.

#### Workflow Events

| Event Type | Trigger | Actions |
|------------|---------|---------|
| `CLIENT_CREATED` | New client added | - Send welcome email<br>- Create activity log |
| `CLIENT_ACTIVATED` | Client status → ACTIVE | - Auto-generate business plan<br>- Schedule Month 1 deliverable |
| `DELIVERABLE_COMPLETED` | Deliverable marked complete | - Auto-generate next month's deliverable<br>- Send notification email<br>- Trigger completion celebration for M8 |
| `BUSINESS_PLAN_COMPLETED` | Business plan generation done | - Auto-generate PDF (if enabled)<br>- Send notification email |
| `DELIVERABLE_OVERDUE` | Due date passed without completion | - Send reminder email<br>- Create activity log |
| `MONTH_TRANSITION` | Start of calendar month | - Check for next deliverable generation |
| `CLIENT_MILESTONE_REACHED` | Custom milestone achieved | - Send celebration email<br>- Create activity log |

#### Usage Example

```typescript
import { onClientCreated, onDeliverableCompleted } from '@/lib/workflows/hooks'

// In your API route or service
async function createClient(data: ClientData) {
  const client = await db.client.create({ data })

  // Trigger workflow (fire-and-forget, doesn't block)
  await onClientCreated(client.id, userId)

  return client
}

async function completeDeliverable(deliverableId: string) {
  const deliverable = await db.deliverable.update({
    where: { id: deliverableId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  })

  // Trigger next month's deliverable generation
  await onDeliverableCompleted(
    deliverable.clientId,
    userId,
    deliverable
  )

  return deliverable
}
```

#### Available Workflow Hooks

```typescript
// src/lib/workflows/hooks.ts

onClientCreated(clientId: string, userId: string)
onClientActivated(clientId: string, userId: string)
onDeliverableCompleted(clientId: string, userId: string, deliverable: any)
onBusinessPlanCompleted(clientId: string, userId: string)
onDeliverableOverdue(clientId: string, userId: string, deliverable: any)
onClientMilestoneReached(clientId: string, userId: string, milestone: string)
onMonthTransition(clientId: string, userId: string)
```

### Configuration

Enable email workflows in `.env`:

```bash
# Enable email workflow automations
ENABLE_EMAIL_WORKFLOWS="true"

# Auto-generate PDFs when documents are completed
AUTO_GENERATE_PDF="true"
```

## Scheduled Tasks

### Overview

Scheduled tasks run on cron-like patterns using BullMQ (production) or intervals (development).

### Default Scheduled Tasks

| Task | Schedule | Description | Status |
|------|----------|-------------|--------|
| `cleanup-temp-files` | Daily at 2 AM | Clean up temporary files and old uploads | ✅ Enabled |
| `database-backup` | Daily at midnight | Create automated database backup | ✅ Enabled |
| `cleanup-old-jobs` | Weekly (Sunday) | Remove completed jobs older than 30 days | ✅ Enabled |
| `send-reminder-emails` | Daily at noon | Send reminder emails for overdue deliverables | ⚠️ Disabled (email system pending) |
| `update-client-metrics` | Every 6 hours | Update client engagement metrics | ⚠️ Disabled (metrics pending) |

### Cron Patterns

Common cron patterns available in `SCHEDULES`:

```typescript
import { SCHEDULES } from '@/lib/jobs/scheduler'

SCHEDULES.EVERY_MINUTE        // * * * * *
SCHEDULES.EVERY_5_MINUTES     // */5 * * * *
SCHEDULES.EVERY_15_MINUTES    // */15 * * * *
SCHEDULES.EVERY_30_MINUTES    // */30 * * * *
SCHEDULES.EVERY_HOUR          // 0 * * * *
SCHEDULES.EVERY_6_HOURS       // 0 */6 * * *
SCHEDULES.EVERY_12_HOURS      // 0 */12 * * *
SCHEDULES.DAILY_AT_MIDNIGHT   // 0 0 * * *
SCHEDULES.DAILY_AT_2AM        // 0 2 * * *
SCHEDULES.DAILY_AT_NOON       // 0 12 * * *
SCHEDULES.WEEKLY_SUNDAY       // 0 0 * * 0
SCHEDULES.WEEKLY_MONDAY       // 0 0 * * 1
SCHEDULES.MONTHLY_FIRST       // 0 0 1 * *
```

### Adding Custom Scheduled Tasks

```typescript
import { scheduler, SCHEDULES } from '@/lib/jobs/scheduler'
import { JOB_PRIORITY } from '@/lib/jobs'

// Add a new scheduled task
await scheduler.addTask({
  name: 'my-custom-task',
  pattern: SCHEDULES.DAILY_AT_MIDNIGHT,
  jobType: 'MY_CUSTOM_JOB',
  payload: { someData: 'value' },
  enabled: true,
  priority: JOB_PRIORITY.NORMAL,
  description: 'My custom scheduled task',
})

// Remove a scheduled task
await scheduler.removeTask('my-custom-task')

// List all scheduled tasks
const tasks = await scheduler.listTasks()
```

### Configuration

Enable scheduler in `.env`:

```bash
# Enable scheduled background tasks
# Automatically enabled in production
ENABLE_SCHEDULER="true"
```

## Job Queue Integration

Both workflows and scheduled tasks use the unified job queue system.

### Job Types

```typescript
// Core job types
GENERATE_BUSINESS_PLAN    // AI-powered business plan generation
GENERATE_DELIVERABLE      // AI-powered deliverable generation (M1-M8)
GENERATE_PDF             // PDF generation for documents

// Maintenance job types
BACKUP_DATABASE          // Database backup
CLEANUP_FILES            // Temporary file cleanup
CLEANUP_OLD_JOBS         // Remove old completed jobs

// Communication job types (Sprint 3)
SEND_EMAIL               // Send individual email
SEND_REMINDER_EMAILS     // Batch reminder emails

// Metrics job types (Future)
UPDATE_CLIENT_METRICS    // Update engagement metrics
```

### Queue Monitoring

Get queue metrics via API:

```bash
GET /api/jobs/metrics

# Requires admin authentication
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total": 1234,
      "queued": 5,
      "processing": 2,
      "completed": 1200,
      "failed": 27,
      "successRate": 97.8
    },
    "queueMetrics": {
      "ai-generation": {
        "waiting": 2,
        "active": 1,
        "completed": 450,
        "failed": 12,
        "delayed": 0
      },
      "pdf-generation": {
        "waiting": 1,
        "active": 0,
        "completed": 380,
        "failed": 5,
        "delayed": 0
      }
    },
    "performance": {
      "avgProcessingTimeMs": 12450,
      "avgProcessingTimeSec": 12
    },
    "usingBullMQ": true
  }
}
```

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  API Routes  │  │  Services    │  │  UI Components│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │
│         │                 │                  │           │
│         └─────────────────┼──────────────────┘           │
│                           │                              │
└───────────────────────────┼──────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                    ┌────────▼──────┐
│ Workflow Hooks │                    │  Job Scheduler │
│  - onClientCreated()                │  - Cron patterns│
│  - onDeliverableCompleted()         │  - BullMQ repeat│
│  - onBusinessPlanCompleted()        │  - Interval fallback│
└───────┬────────┘                    └────────┬──────┘
        │                                      │
        └────────────┬─────────────────────────┘
                     │
             ┌───────▼───────┐
             │  Unified Queue │
             │  - BullMQ (prod)│
             │  - In-memory (dev)│
             └───────┬───────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────┐ ┌──▼───────┐
│AI Generation │ │PDF Gen  │ │ Maintenance│
│   Queue      │ │ Queue   │ │  Queue    │
└──────────────┘ └─────────┘ └───────────┘
```

### Workflow Processing

1. **Trigger**: Event occurs (e.g., deliverable completed)
2. **Hook**: Workflow hook function called (`onDeliverableCompleted`)
3. **Handler**: Workflow handler processes event
4. **Queue**: Jobs are enqueued with appropriate priority
5. **Worker**: BullMQ/in-memory worker picks up job
6. **Execute**: Job executes (generate deliverable, send email, etc.)
7. **Complete**: Status updated, next workflow triggered if applicable

### Error Handling

- **Workflows**: Fire-and-forget pattern - errors are logged but don't break main operations
- **Scheduled Tasks**: Automatic retry with exponential backoff (3 attempts)
- **Job Queue**: Persistent failure tracking with manual retry option

## Monitoring & Debugging

### Logs

All workflow and scheduler operations are logged with structured logging:

```bash
# View workflow logs
grep "workflow" logs/app.log

# View scheduler logs
grep "scheduler" logs/app.log

# View job queue logs
grep "BullMQ\|queue" logs/app.log
```

### Database

Check job status in database:

```sql
-- View all queued jobs
SELECT * FROM jobs WHERE status = 'QUEUED' ORDER BY createdAt;

-- View failed jobs
SELECT * FROM jobs WHERE status = 'FAILED' ORDER BY createdAt DESC;

-- View job statistics by type
SELECT type, status, COUNT(*) as count
FROM jobs
GROUP BY type, status
ORDER BY type, status;
```

### Redis (Production)

Monitor BullMQ queues in Redis:

```bash
# Connect to Redis CLI
docker exec -it wavelaunch-crm-redis-1 redis-cli

# List all queues
KEYS bull:*

# Get queue metrics
LLEN bull:ai-generation:wait
LLEN bull:ai-generation:active
LLEN bull:ai-generation:completed

# View job data
HGETALL bull:ai-generation:1234
```

Or use Redis Commander (development):
```bash
http://localhost:8081
```

## Performance Considerations

### Queue Concurrency

Different queues have different concurrency limits:

- **AI Generation**: 1 concurrent job (rate limiting, cost control)
- **PDF Generation**: 3 concurrent jobs
- **File Operations**: 3 concurrent jobs
- **Database Operations**: 3 concurrent jobs
- **Scheduled Tasks**: 3 concurrent jobs

### Job Priorities

Jobs are processed based on priority:

- `CRITICAL` (1): Emergency operations
- `HIGH` (3): User-initiated actions
- `NORMAL` (5): Automated workflows
- `LOW` (7): Cleanup tasks

### Redis vs In-Memory

| Feature | BullMQ (Redis) | In-Memory |
|---------|---------------|-----------|
| Persistence | ✅ Jobs survive restarts | ❌ Jobs lost on restart |
| Distributed | ✅ Multiple workers | ❌ Single instance only |
| Scheduling | ✅ Exact cron patterns | ⚠️ Approximate intervals |
| Monitoring | ✅ Full metrics | ⚠️ Basic stats only |
| Best For | Production | Development |

## Troubleshooting

### Workflows Not Triggering

1. Check if hook is called:
   ```typescript
   console.log('Triggering workflow:', clientId)
   await onClientCreated(clientId, userId)
   ```

2. Check workflow logs:
   ```bash
   grep "workflow" logs/app.log
   ```

3. Verify email workflows are enabled:
   ```bash
   echo $ENABLE_EMAIL_WORKFLOWS
   ```

### Scheduled Tasks Not Running

1. Check if scheduler is enabled:
   ```bash
   echo $ENABLE_SCHEDULER
   # Should be "true" or NODE_ENV should be "production"
   ```

2. Check scheduler initialization:
   ```bash
   grep "scheduler initialized" logs/app.log
   ```

3. Verify Redis connection (production):
   ```bash
   docker exec -it wavelaunch-crm-redis-1 redis-cli ping
   # Should return "PONG"
   ```

### Jobs Stuck in QUEUED Status

1. Check if workers are running:
   ```bash
   grep "Worker.*processing" logs/app.log
   ```

2. Restart the application:
   ```bash
   npm run dev # or pm2 restart wavelaunch-crm
   ```

3. Check Redis connection:
   ```bash
   docker-compose ps redis
   # Should show "healthy"
   ```

### High Job Failure Rate

1. Check error logs:
   ```sql
   SELECT type, error, COUNT(*)
   FROM jobs
   WHERE status = 'FAILED'
   GROUP BY type, error
   ORDER BY COUNT(*) DESC;
   ```

2. Review specific failed job:
   ```sql
   SELECT * FROM jobs WHERE id = '<job-id>';
   ```

3. Manually retry failed job:
   ```bash
   POST /api/jobs/<job-id>/retry
   ```

## Best Practices

1. **Use Workflow Hooks**: Always use provided hooks instead of triggering workflows directly
2. **Handle Gracefully**: Workflows should never break main operations - all errors are logged
3. **Test Schedules**: Test cron patterns before deployment using [crontab.guru](https://crontab.guru/)
4. **Monitor Queues**: Regularly check queue metrics to identify bottlenecks
5. **Use Redis in Production**: Always use Redis for production deployments
6. **Set Priorities**: Use appropriate job priorities to ensure critical tasks complete first
7. **Clean Up Jobs**: Enable `cleanup-old-jobs` task to prevent database bloat

## Future Enhancements

- [ ] Visual workflow builder UI
- [ ] Custom workflow conditions and branching
- [ ] Workflow analytics and insights
- [ ] A/B testing for automated communications
- [ ] Integration with external services (Zapier, Make)
- [ ] Real-time workflow status dashboard
- [ ] Workflow templates library

## References

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Cron Pattern Reference](https://crontab.guru/)
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - PostgreSQL and Redis setup
- [SECURITY.md](./SECURITY.md) - Security considerations
