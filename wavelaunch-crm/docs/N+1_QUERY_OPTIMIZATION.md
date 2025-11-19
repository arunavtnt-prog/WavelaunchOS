# N+1 Query Optimization Guide

## Analysis Results

After analyzing the codebase, **good news**: Most API routes are already optimized and follow Prisma best practices!

### ✅ Well-Optimized Routes

1. **`/api/clients`** - Uses `_count` aggregation for related data
2. **`/api/deliverables`** - Uses `include` for eager loading
3. **`/api/business-plans`** - Uses `include` for client data

The codebase is already using proper Prisma patterns to avoid N+1 queries.

## Best Practices (Already Implemented)

### 1. Use `include` for Eager Loading

```typescript
// ✅ GOOD - Single query with JOIN
const deliverables = await db.deliverable.findMany({
  include: {
    client: {
      select: { id: true, creatorName: true }
    },
    generatedByUser: {
      select: { id: true, name: true }
    }
  }
})
```

```typescript
// ❌ BAD - N+1 queries
const deliverables = await db.deliverable.findMany()
for (const d of deliverables) {
  const client = await db.client.findUnique({ where: { id: d.clientId } })
}
```

### 2. Use `_count` for Counts

```typescript
// ✅ GOOD - Aggregation in single query
const clients = await db.client.findMany({
  include: {
    _count: {
      select: {
        businessPlans: true,
        deliverables: true
      }
    }
  }
})
```

### 3. Use Batch Queries with `in`

```typescript
// ✅ GOOD - Single query for multiple IDs
const clients = await db.client.findMany({
  where: {
    id: { in: clientIds }
  }
})
```

## Performance Monitoring

To ensure N+1 queries don't creep in, add Prisma query logging in development:

```typescript
// In prisma/client.ts
export const db = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error']
})
```

This will log all SQL queries in development, making N+1 patterns immediately visible.

## Potential Future Issues

Watch out for these patterns in new code:

### 1. Dashboard Aggregations

If building a dashboard that shows stats across multiple clients:

```typescript
// ⚠️ POTENTIAL N+1
const clients = await db.client.findMany()
const stats = await Promise.all(
  clients.map(async (c) => ({
    client: c,
    deliverableCount: await db.deliverable.count({ where: { clientId: c.id } }),
    noteCount: await db.note.count({ where: { clientId: c.id } })
  }))
)

// ✅ OPTIMIZED
const clients = await db.client.findMany({
  include: {
    _count: {
      select: {
        deliverables: true,
        notes: true
      }
    }
  }
})
```

### 2. Nested Loops

```typescript
// ❌ BAD - O(n*m) queries
for (const client of clients) {
  for (const month of [1,2,3,4,5,6,7,8]) {
    const d = await db.deliverable.findFirst({
      where: { clientId: client.id, month }
    })
  }
}

// ✅ GOOD - 1 query
const deliverables = await db.deliverable.findMany({
  where: {
    clientId: { in: clientIds },
    month: { in: [1,2,3,4,5,6,7,8] }
  }
})
```

### 3. Sequential Updates

```typescript
// ⚠️ SLOW - Sequential
for (const id of ids) {
  await db.client.update({
    where: { id },
    data: { status: 'ARCHIVED' }
  })
}

// ✅ FAST - Batch
await db.client.updateMany({
  where: { id: { in: ids } },
  data: { status: 'ARCHIVED' }
})
```

## Recommendations

1. **Keep current patterns** - The codebase is well-optimized
2. **Add query logging** - Enable Prisma query logging in development
3. **Review new code** - Check for N+1 patterns in code reviews
4. **Monitor slow queries** - Use the performance middleware (Sprint 5 task)

## Testing for N+1

### Manual Testing

1. Enable Prisma query logging:
   ```env
   # .env.local
   DATABASE_URL="..."
   LOG_QUERIES=true
   ```

2. Hit an endpoint:
   ```bash
   curl http://localhost:3000/api/deliverables
   ```

3. Count queries in logs - should be 1-2, not N

### Automated Testing

Consider adding query count assertions in tests:

```typescript
// Example test
test('deliverables endpoint should not have N+1', async () => {
  const queryCount = await prismaQueryCounter.start()

  await fetch('/api/deliverables')

  const count = queryCount.stop()
  expect(count).toBeLessThan(5) // Reasonable threshold
})
```

## Query Performance Checklist

Before merging new API endpoints:

- [ ] Uses `include` for related data (not separate queries)
- [ ] Uses `_count` for counts (not separate COUNT queries)
- [ ] Uses `findMany` with `in` for batch lookups
- [ ] No loops with `await db.*` inside
- [ ] No sequential updates (use `updateMany` or transactions)
- [ ] Tested with query logging enabled
- [ ] Response time < 200ms for typical request

## Conclusion

**Current Status**: ✅ No N+1 issues found

The codebase already follows Prisma best practices. With the new database indexes from Sprint 5, query performance should be excellent.

**Action Items**:
1. ✅ No immediate N+1 fixes needed
2. ⏳ Add query logging for development (optional enhancement)
3. ⏳ Add performance monitoring middleware (next task)
