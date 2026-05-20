import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Settings, RefreshCw } from 'lucide-react';
import { db } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import {
  fetchVisionFormApplications,
  getVisionFormSourceUrl,
  setVisionFormSourceUrl,
  upsertVisionFormSubmission,
} from '@/lib/integrations/visionForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getWorkflowStats() {
  const stats = await db.workflowState.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  return stats;
}

async function getSettingValue(key: string): Promise<string | null> {
  const row = await db.settings.findUnique({ where: { key } });
  return row?.value ?? null;
}

async function getRecentAuditLogs(limit = 50) {
  return db.workflowAuditLog.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      workflow: {
        include: {
          application: true,
        },
      },
    },
  });
}

export default async function SettingsPage() {
  const stats = await getWorkflowStats();
  const recentLogs = await getRecentAuditLogs();
  const visionFormSourceUrl = await getVisionFormSourceUrl();
  const [lastSyncAt, lastSyncSummary, lastSyncError] = await Promise.all([
    getSettingValue('vision_form_last_sync_at'),
    getSettingValue('vision_form_last_sync_summary'),
    getSettingValue('vision_form_last_sync_error'),
  ]);
  const [workerLastTickAt, workerLastTickMeta, workerLastError] = await Promise.all([
    getSettingValue('workflow_worker_last_tick_at'),
    getSettingValue('workflow_worker_last_tick_meta'),
    getSettingValue('workflow_worker_last_error'),
  ]);

  const statusLabels: Record<string, string> = {
    SUBMITTED: 'Submitted',
    SNAPSHOT_QUEUED: 'Snapshot Queued',
    SNAPSHOT_GENERATING: 'Snapshot Generating',
    SNAPSHOT_COMPLETE: 'Snapshot Complete',
    SNAPSHOT_FAILED: 'Snapshot Failed',
    DRAFT_EMAIL_READY: 'Draft Email Ready',
    EMAIL_REVIEW_PENDING: 'Email Review Pending',
    FOLLOW_UP_QUEUED: 'Follow-up Queued',
    FOLLOW_UP_READY: 'Follow-up Ready',
    EMAIL_SENT: 'Email Sent',
    AWAITING_RESPONSE: 'Awaiting Response',
    CONVERTED: 'Converted',
    REJECTED: 'Rejected',
    ARCHIVED: 'Archived',
  };

  const total = stats.reduce((sum, item) => sum + item._count.status, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          System status and workflow configuration
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Status Distribution</CardTitle>
            <CardDescription>
              Current state of all workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.map((item) => (
                <div key={item.status} className="flex items-center justify-between text-sm">
                  <span>{statusLabels[item.status] || item.status}</span>
                  <Badge variant="secondary">{item._count.status}</Badge>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex items-center justify-between font-medium">
                <span>Total</span>
                <Badge>{total}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Connected services and their status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Database</span>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Claude AI</span>
              <Badge variant="success">Configured</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Blueprint Engine</span>
              <Badge variant="success">
                {process.env.BLUEPRINT_ENGINE_URL || 'http://localhost:3010'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>CRM API</span>
              <Badge variant="success">
                {process.env.CRM_API_URL || 'http://localhost:3000'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Workflow Worker</span>
              <Badge variant={workerLastTickAt ? 'secondary' : 'outline'}>
                {workerLastTickAt ? `Last tick: ${new Date(workerLastTickAt).toLocaleTimeString()}` : 'No heartbeat'}
              </Badge>
            </div>
            {workerLastError ? (
              <div className="text-xs text-red-600">
                Worker error: {workerLastError}
              </div>
            ) : null}
            {workerLastTickMeta ? (
              <div className="text-xs text-muted-foreground">
                Last action:{' '}
                {(() => {
                  try {
                    const meta = JSON.parse(workerLastTickMeta);
                    return meta?.phase ? JSON.stringify(meta) : workerLastTickMeta;
                  } catch {
                    return workerLastTickMeta;
                  }
                })()}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest workflow audit log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Status Change</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>
                      {log.workflow?.application?.fullName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{log.oldStatus || '—'}</Badge>
                        <span>→</span>
                        <Badge variant="secondary">{log.newStatus}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.performedBy || 'SYSTEM'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.createdAt.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Actions</CardTitle>
          <CardDescription>
            Administrative operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={async (formData: FormData) => {
            'use server';

            const url = String(formData.get('visionFormSourceUrl') || '');
            try {
              await setVisionFormSourceUrl(url);
            } catch {
              // keep page stable; user can retry with a valid URL
            }

            revalidatePath('/settings');
          }}>
            <div className="space-y-2">
              <div className="text-sm font-medium">Vision Form source</div>
              <div className="text-xs text-muted-foreground">
                Used for pulling submissions into this dashboard (Queue). Paste the base domain (e.g. https://login.wavelaunch.org), not a page path.
              </div>
              <div className="flex items-center gap-2">
                <input
                  name="visionFormSourceUrl"
                  defaultValue={visionFormSourceUrl || ''}
                  placeholder="https://login.wavelaunch.org"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                />
                <Button type="submit" variant="outline" size="sm">
                  Save
                </Button>
              </div>
            </div>
          </form>

          <form action={async () => {
            'use server';

            try {
              const nowIso = new Date().toISOString();
              await db.settings.upsert({
                where: { key: 'vision_form_last_sync_at' },
                update: { value: nowIso },
                create: { key: 'vision_form_last_sync_at', value: nowIso },
              });
              await db.settings.upsert({
                where: { key: 'vision_form_last_sync_error' },
                update: { value: '' },
                create: { key: 'vision_form_last_sync_error', value: '' },
              });

              const apps = await fetchVisionFormApplications();
              const summary = { fetched: apps.length, upserted: 0, failed: 0 };
              for (const app of apps) {
                try {
                  await upsertVisionFormSubmission(app);
                  summary.upserted += 1;
                } catch {
                  // best-effort; keep syncing others
                  summary.failed += 1;
                }
              }

              await db.settings.upsert({
                where: { key: 'vision_form_last_sync_summary' },
                update: { value: JSON.stringify(summary) },
                create: { key: 'vision_form_last_sync_summary', value: JSON.stringify(summary) },
              });
            } catch (e) {
              const message = e instanceof Error ? e.message : 'Sync failed. Check source URL and tokens.';
              await db.settings.upsert({
                where: { key: 'vision_form_last_sync_error' },
                update: { value: message },
                create: { key: 'vision_form_last_sync_error', value: message },
              });
            }

            revalidatePath('/queue');
            revalidatePath('/settings');
          }}>
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Sync Vision Form submissions</div>
                <div className="text-xs text-muted-foreground">
                  Pulls recent applications from the intake form into this dashboard.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={visionFormSourceUrl ? 'secondary' : 'outline'}>
                  {visionFormSourceUrl || 'Not configured'}
                </Badge>
                <Button type="submit" variant="outline" disabled={!visionFormSourceUrl}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync
                </Button>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              <div>Last sync: {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : '—'}</div>
              <div>
                Result:{' '}
                {lastSyncSummary
                  ? (() => {
                      try {
                        const s = JSON.parse(lastSyncSummary);
                        return `${s.upserted}/${s.fetched} upserted${s.failed ? `, ${s.failed} failed` : ''}`;
                      } catch {
                        return lastSyncSummary;
                      }
                    })()
                  : '—'}
              </div>
              {lastSyncError ? <div className="text-red-600">Error: {lastSyncError}</div> : null}
            </div>
          </form>

          <form action={async () => {
            'use server';
            // Trigger workflow processing for queued items
            const { WorkflowOrchestrator } = await import('@/lib/services/WorkflowOrchestrator');
            const orchestrator = new WorkflowOrchestrator({
              anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
              snapshotEngineUrl:
                process.env.SNAPSHOT_ENGINE_URL ||
                process.env.BLUEPRINT_ENGINE_URL ||
                'http://localhost:3010',
            });

            const results = await orchestrator.processQueuedWorkflows();

            revalidatePath('/settings');
            revalidatePath('/');
          }}>
            <Button type="submit" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Process Queued Workflows
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
