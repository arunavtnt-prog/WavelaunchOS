'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Eye, RefreshCw, Download, ExternalLink, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatDateTime } from '@/lib/utils';

interface SnapshotItem {
  id: string;
  application: any;
  workflowState: any;
}

export default function SnapshotsPage() {
  const [items, setItems] = useState<SnapshotItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    markdown: string;
    title: string;
  }>({ open: false, markdown: '', title: '' });
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [initializingId, setInitializingId] = useState<string | null>(null);

  const fetchSnapshots = async () => {
    setIsLoading(true);
    try {
      // Fetch all applications with workflow states
      const response = await fetch('/api/workflow/all');
      const result = await response.json();

      if (result.success) {
        setItems(result.data || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load snapshots',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load snapshots',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (applicationId: string) => {
    setGeneratingId(applicationId);
    try {
      const response = await fetch('/api/workflow/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          applicationId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Snapshot generated',
          description: 'The snapshot has been generated successfully.',
        });
        await fetchSnapshots();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to generate snapshot',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate snapshot',
        variant: 'destructive',
      });
    } finally {
      setGeneratingId(null);
    }
  };

  const handlePreview = async (applicationId: string, applicantName: string) => {
    try {
      const response = await fetch(`/api/workflow/snapshots?applicationId=${applicationId}`);
      const result = await response.json();

      if (result.success && result.data.markdown) {
        setPreviewDialog({
          open: true,
          markdown: result.data.markdown,
          title: `${applicantName}'s Snapshot`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load snapshot',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load snapshot',
        variant: 'destructive',
      });
    }
  };

  const handleConvertPdf = async (applicationId: string) => {
    try {
      // First get the markdown
      const response = await fetch(`/api/workflow/snapshots?applicationId=${applicationId}`);
      const result = await response.json();

      if (result.success && result.data.markdown) {
        // Then convert to PDF
        const pdfResponse = await fetch('/api/workflow/snapshots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'convert-pdf',
            applicationId,
            markdown: result.data.markdown,
          }),
        });

        const pdfResult = await pdfResponse.json();

        if (pdfResult.success) {
          toast({
            title: 'PDF generated',
            description: 'The snapshot has been converted to PDF.',
          });
          await fetchSnapshots();
        } else {
          toast({
            title: 'Error',
            description: 'Failed to generate PDF',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };

  const handleInitializeBlueprint = async (applicationId: string, applicantName: string) => {
    if (!confirm(`Initialize Blueprint generation for ${applicantName}? This will start the comprehensive business plan process.`)) {
      return;
    }

    setInitializingId(applicationId);
    try {
      const response = await fetch('/api/workflow/blueprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize',
          applicationId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Blueprint initialized',
          description: 'Blueprint generation has been started. Go to the Blueprints page to track progress.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to initialize blueprint',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize blueprint',
        variant: 'destructive',
      });
    } finally {
      setInitializingId(null);
    }
  };

  useEffect(() => {
    fetchSnapshots();

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchSnapshots();
    }, 120000); // Poll every 2 minutes

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      SUBMITTED: { variant: 'secondary', label: 'Submitted' },
      SNAPSHOT_QUEUED: { variant: 'default', label: 'Queued' },
      SNAPSHOT_GENERATING: { variant: 'warning', label: 'Generating' },
      SNAPSHOT_COMPLETE: { variant: 'success', label: 'Complete' },
      SNAPSHOT_FAILED: { variant: 'destructive', label: 'Failed' },
      DRAFT_EMAIL_READY: { variant: 'info', label: 'Email Ready' },
      EMAIL_REVIEW_PENDING: { variant: 'info', label: 'Email Review' },
      EMAIL_SENT: { variant: 'success', label: 'Email Sent' },
      AWAITING_RESPONSE: { variant: 'secondary', label: 'Awaiting' },
      CONVERTED: { variant: 'success', label: 'Converted' },
      REJECTED: { variant: 'destructive', label: 'Rejected' },
    };

    const config = statusConfig[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Snapshots</h1>
          <p className="text-muted-foreground">
            Manage AI-generated business plan snapshots
          </p>
        </div>
        <Button onClick={fetchSnapshots} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Show actively generating items */}
      {items.filter(item => item.workflowState?.status === 'SNAPSHOT_GENERATING').length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <RefreshCw className="h-8 w-8 text-yellow-600 animate-spin" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {items.filter(item => item.workflowState?.status === 'SNAPSHOT_GENERATING').length} Snapshot{items.filter(item => item.workflowState?.status === 'SNAPSHOT_GENERATING').length > 1 ? 's' : ''} Generating
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {items.filter(item => item.workflowState?.status === 'SNAPSHOT_GENERATING').map(item => item.application.fullName).join(', ')}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="h-2 w-32 bg-yellow-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Snapshots</CardTitle>
          <CardDescription>
            View and manage AI-generated business plans for approved applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No applications in the workflow yet</p>
              <p className="text-sm">Approve applications from the queue to get started</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.application.fullName}
                      </TableCell>
                      <TableCell>{item.application.industryNiche}</TableCell>
                      <TableCell>
                        {item.workflowState?.status === 'SNAPSHOT_GENERATING' ? (
                          <Badge variant="warning" className="animate-pulse">
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Generating
                          </Badge>
                        ) : (
                          getStatusBadge(item.workflowState?.status)
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.workflowState?.generationCompletedAt
                          ? formatDateTime(item.workflowState.generationCompletedAt)
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Show Generate button for queued items without snapshot */}
                          {(item.workflowState?.status === 'SNAPSHOT_QUEUED' ||
                            item.workflowState?.status === 'SNAPSHOT_FAILED') &&
                            !item.workflowState?.snapshotMarkdown && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleGenerate(item.id)}
                              disabled={generatingId === item.id}
                            >
                              {generatingId === item.id ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Generating
                                </>
                              ) : (
                                <>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Generate
                                </>
                              )}
                            </Button>
                          )}

                          {/* Show loading spinner for generating state */}
                          {item.workflowState?.status === 'SNAPSHOT_GENERATING' && (
                            <Button size="sm" variant="ghost" disabled>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </Button>
                          )}

                          {/* Show preview button for completed snapshots */}
                          {item.workflowState?.snapshotMarkdown && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handlePreview(item.id, item.application.fullName)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Show Initialize Blueprint button for completed snapshots */}
                          {item.workflowState?.snapshotMarkdown && (!item.application.blueprints || item.application.blueprints.length === 0) && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                handleInitializeBlueprint(item.id, item.application.fullName)
                              }
                              disabled={initializingId === item.id}
                            >
                              {initializingId === item.id ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Initializing...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Initialize Blueprint
                                </>
                              )}
                            </Button>
                          )}

                          {/* Show Blueprint link if already initialized */}
                          {item.application.blueprints && item.application.blueprints.length > 0 && (
                            <Button size="sm" variant="outline" asChild>
                              <a href="/blueprints">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Blueprint
                              </a>
                            </Button>
                          )}

                          {/* Show PDF link if available */}
                          {item.workflowState?.snapshotPdfPath && (
                            <Button size="sm" variant="ghost" asChild>
                              <a
                                href={item.workflowState.snapshotPdfPath}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}

                          {/* Show convert to PDF button for snapshots without PDF */}
                          {item.workflowState?.snapshotMarkdown &&
                            !item.workflowState.snapshotPdfPath && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleConvertPdf(item.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}

                          {/* Show regenerate button for failed snapshots */}
                          {item.workflowState?.status === 'SNAPSHOT_FAILED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerate(item.id)}
                              disabled={generatingId === item.id}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={previewDialog.open}
        onOpenChange={(open) =>
          setPreviewDialog({ ...previewDialog, open })
        }
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewDialog.title}</DialogTitle>
            <DialogDescription>Preview of the generated snapshot</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {previewDialog.markdown}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
