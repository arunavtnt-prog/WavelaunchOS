'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  FileText,
  RefreshCw,
  Eye,
  ChevronRight,
  Play,
  CheckCircle2,
  Edit2,
  X,
  Save,
  MoreVertical,
  Search,
  ChevronDown,
  Circle,
  Loader2,
  Download,
  Copy,
  Trash2,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BlueprintItem {
  id: string;
  application: any;
  status: string;
  progress: number;
  currentBatch: number;
  startedAt?: string;
  completedAt?: string;
  updatedAt?: string;
  lastStageAt?: string;
  totalTokensUsed: number;
  researchStages: Array<{
    id: string;
    stage: string;
    status: string;
    batch: number;
    markdown?: string;
    startedAt?: string;
    completedAt?: string;
    updatedAt?: string;
  }>;
}

// Batch configuration
const BATCH_CONFIG = [
  { number: 1, name: 'Market & Competitive Analysis', stages: ['MARKET_SIZING', 'COMPETITIVE_INTELLIGENCE', 'INDUSTRY_TRENDS'] },
  { number: 2, name: 'Audience & Brand Strategy', stages: ['AUDIENCE_DEEP_DIVE', 'BRAND_POSITIONING'] },
  { number: 3, name: 'Product & Financials', stages: ['PRODUCT_ARCHITECTURE', 'FINANCIAL_PROJECTIONS'] },
  { number: 4, name: 'Go-to-Market & Operations', stages: ['GO_TO_MARKET', 'OPERATIONAL_FRAMEWORK', 'IMPLEMENTATION_ROADMAP'] },
  { number: 5, name: 'Executive Summary', stages: ['EXECUTIVE_SUMMARY', 'COMPILATION'] },
];

const STAGE_LABELS: Record<string, string> = {
  MARKET_SIZING: 'Market Sizing',
  COMPETITIVE_INTELLIGENCE: 'Competitive Intelligence',
  INDUSTRY_TRENDS: 'Industry Trends',
  AUDIENCE_DEEP_DIVE: 'Audience Analysis',
  BRAND_POSITIONING: 'Brand Positioning',
  PRODUCT_ARCHITECTURE: 'Product Architecture',
  FINANCIAL_PROJECTIONS: 'Financial Projections',
  GO_TO_MARKET: 'Go-to-Market Strategy',
  OPERATIONAL_FRAMEWORK: 'Operational Framework',
  IMPLEMENTATION_ROADMAP: 'Implementation Roadmap',
  EXECUTIVE_SUMMARY: 'Executive Summary',
  COMPILATION: 'Final Compilation',
};

const STATUS_CONFIG = {
  COMPLETE: { label: 'Complete', variant: 'default' as const, color: 'text-green-600', bgColor: 'bg-green-500', icon: CheckCircle2 },
  IN_PROGRESS: { label: 'In Progress', variant: 'secondary' as const, color: 'text-blue-600', bgColor: 'bg-blue-500', icon: Loader2 },
  PENDING: { label: 'Pending', variant: 'outline' as const, color: 'text-gray-400', bgColor: 'bg-gray-400', icon: Circle },
  FAILED: { label: 'Failed', variant: 'destructive' as const, color: 'text-red-600', bgColor: 'bg-red-500', icon: X },
};

export default function BlueprintsPage() {
  const [items, setItems] = useState<BlueprintItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<BlueprintItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    markdown: string;
    title: string;
  }>({ open: false, markdown: '', title: '' });
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    blueprintId: string;
    batchNumber: number;
    stages: Array<{
      id: string;
      stage: string;
      markdown: string;
    }>;
  }>({ open: false, blueprintId: '', batchNumber: 0, stages: [] });
  const [editingStage, setEditingStage] = useState<{
    stageId: string;
    markdown: string;
  } | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  const [emailGeneratingId, setEmailGeneratingId] = useState<string | null>(null);
  const [emailDrafts, setEmailDrafts] = useState<Record<string, boolean>>({});

  const fetchBlueprints = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/workflow/blueprints');
      const result = await response.json();

      if (result.success) {
        const data = result.data || [];
        setItems(data);
        setFilteredItems(data);
        setLastFetchedAt(new Date().toISOString());

        // Check for email drafts for complete blueprints
        data.forEach((blueprint: BlueprintItem) => {
          if (blueprint.status === 'COMPLETE' || blueprint.status === 'APPROVED') {
            checkEmailDraftExists(blueprint.id);
          }
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load blueprints',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load blueprints',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const filtered = items.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.application.fullName.toLowerCase().includes(query) ||
        item.application.industryNiche.toLowerCase().includes(query)
      );
    });
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const handleProcessBatch = async (blueprintId: string) => {
    setProcessingId(blueprintId);
    try {
      const response = await fetch('/api/workflow/blueprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process-batch',
          blueprintId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Batch processed',
          description: `Progress: ${result.data.progress}%`,
        });
        await fetchBlueprints();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to process batch',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process batch',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handlePreview = async (blueprintId: string, applicantName: string) => {
    try {
      const response = await fetch(`/api/workflow/blueprints?blueprintId=${blueprintId}`);
      const result = await response.json();

      if (result.success && result.data.markdown) {
        setPreviewDialog({
          open: true,
          markdown: result.data.markdown,
          title: `${applicantName}'s Blueprint`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load blueprint',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load blueprint',
        variant: 'destructive',
      });
    }
  };

  const handleReviewBatch = (blueprintId: string, batchNumber: number) => {
    const blueprint = items.find((item) => item.id === blueprintId);
    if (!blueprint) return;

    const batchStages = blueprint.researchStages
      .filter((s) => s.batch === batchNumber && s.status === 'COMPLETE' && s.markdown)
      .map((s) => ({
        id: s.id,
        stage: s.stage,
        markdown: s.markdown || '',
      }));

    if (batchStages.length === 0) {
      toast({
        title: 'No stages to review',
        description: 'Process this batch first',
        variant: 'destructive',
      });
      return;
    }

    setReviewDialog({
      open: true,
      blueprintId,
      batchNumber,
      stages: batchStages,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingStage) return;

    setSavingId(editingStage.stageId);
    try {
      const response = await fetch(`/api/workflow/blueprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-stage',
          stageId: editingStage.stageId,
          markdown: editingStage.markdown,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Saved',
          description: 'Stage updated successfully',
        });
        await fetchBlueprints();
        const updatedBlueprint = items.find((item) => item.id === reviewDialog.blueprintId);
        if (updatedBlueprint) {
          const updatedStages = reviewDialog.stages.map((s) => {
            if (s.id === editingStage.stageId) {
              const updatedStageData = updatedBlueprint.researchStages.find((rs) => rs.id === s.id);
              return {
                ...s,
                markdown: updatedStageData?.markdown || s.markdown,
              };
            }
            return s;
          });
          setReviewDialog({ ...reviewDialog, stages: updatedStages });
        }
        setEditingStage(null);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleRegenerateStage = async (stageId: string, stageName: string, blueprintId: string) => {
    if (!blueprintId) {
      toast({
        title: 'Error',
        description: 'Blueprint ID not found',
        variant: 'destructive',
      });
      return;
    }

    setProcessingId(stageId);
    try {
      const response = await fetch('/api/workflow/blueprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate-stage',
          blueprintId,
          stage: stageName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Regenerating stage',
          description: `Regenerating ${STAGE_LABELS[stageName] || stageName}...`,
        });
        await fetchBlueprints();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to regenerate stage',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to regenerate stage',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveBatch = () => {
    setReviewDialog({ ...reviewDialog, open: false });
    toast({
      title: 'Batch approved',
      description: 'You can now process the next batch',
    });
  };

  const handleDownloadPdf = async (blueprintId: string, applicantName: string) => {
    try {
      const response = await fetch('/api/workflow/blueprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'download-pdf',
          blueprintId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const result = await response.json();

      if (result.success && result.pdfUrl) {
        // Open PDF in new tab for download
        window.open(result.pdfUrl, '_blank');
        toast({
          title: 'PDF generating',
          description: 'Your download will start shortly',
        });
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to download PDF',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateApprovalEmail = async (blueprintId: string) => {
    setEmailGeneratingId(blueprintId);
    try {
      const response = await fetch(`/api/workflow/blueprints/${blueprintId}/approval-email`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Email draft generated',
          description: result.message || 'Approval email has been created and is ready for review',
        });
        // Update email drafts state
        setEmailDrafts(prev => ({ ...prev, [blueprintId]: true }));
      } else {
        throw new Error(result.error || 'Failed to generate approval email');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate approval email',
        variant: 'destructive',
      });
    } finally {
      setEmailGeneratingId(null);
    }
  };

  const checkEmailDraftExists = async (blueprintId: string) => {
    try {
      const response = await fetch(`/api/workflow/blueprints/${blueprintId}/approval-email`);
      const result = await response.json();
      if (result.success && result.data.hasDraft) {
        setEmailDrafts(prev => ({ ...prev, [blueprintId]: true }));
      }
    } catch (error) {
      console.error('Failed to check email draft:', error);
    }
  };

  const toggleBatch = (blueprintId: string, batchNumber: number) => {
    const key = `${blueprintId}-${batchNumber}`;
    const newExpanded = new Set(expandedBatches);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedBatches(newExpanded);
  };

  useEffect(() => {
    fetchBlueprints();

    const interval = setInterval(() => {
      fetchBlueprints();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    // Auto-expand current batch on first load (avoid overriding user toggles on refresh)
    setExpandedBatches((prev) => {
      if (prev.size > 0) return prev;
      const next = new Set(prev);
      items.forEach((item) => {
        if (item.currentBatch <= 5) {
          next.add(`${item.id}-${item.currentBatch}`);
        }
      });
      return next;
    });
  }, [items]);

  const getLiveActivity = (blueprint: BlueprintItem) => {
    const running = blueprint.researchStages.filter((s) => s.status === 'IN_PROGRESS');
    const lastActivityAt = [
      blueprint.lastStageAt,
      blueprint.updatedAt,
      ...blueprint.researchStages.map((s) => s.updatedAt),
      ...blueprint.researchStages.map((s) => s.completedAt),
      ...blueprint.researchStages.map((s) => s.startedAt),
    ]
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime())
      .filter((t) => Number.isFinite(t))
      .sort((a, b) => b - a)[0];

    return {
      runningStages: running.map((s) => STAGE_LABELS[s.stage] || s.stage),
      lastActivityAt: Number.isFinite(lastActivityAt) ? new Date(lastActivityAt).toISOString() : null,
    };
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {status === 'IN_PROGRESS' && <config.icon className="h-3 w-3 animate-spin" />}
        {status !== 'IN_PROGRESS' && <config.icon className="h-3 w-3" />}
        {config.label}
      </Badge>
    );
  };

  const getBatchProgress = (blueprint: BlueprintItem, batchNumber: number) => {
    const batchConfig = BATCH_CONFIG.find((b) => b.number === batchNumber);
    if (!batchConfig) return { completed: 0, total: 0, percentage: 0 };

    const stages = blueprint.researchStages.filter((s) => s.batch === batchNumber);
    const completed = stages.filter((s) => s.status === 'COMPLETE').length;
    const total = batchConfig.stages.length;
    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  };

  const getStageForBatch = (blueprint: BlueprintItem, batchNumber: number, stageName: string) => {
    return blueprint.researchStages.find((s) => s.batch === batchNumber && s.stage === stageName);
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blueprints</h1>
          <p className="text-muted-foreground">
            Comprehensive 15-25 page business plans with real market research
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastFetchedAt && (
            <span className="text-xs text-muted-foreground">
              Auto-refresh: 30s • Last refresh: {formatDateTime(lastFetchedAt)}
            </span>
          )}
          <Button onClick={fetchBlueprints} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredItems.length} {filteredItems.length === 1 ? 'blueprint' : 'blueprints'}
        </Badge>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {items.length === 0 ? 'No blueprints yet' : 'No matching blueprints'}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {items.length === 0
                ? 'New submissions show up in the Queue. Approve one to generate Snapshot → Blueprint → PDF (then a draft email). If your Queue is empty, sync Vision Form submissions from Settings.'
                : 'Try adjusting your search or filters'}
            </p>
            {items.length === 0 && (
              <div className="flex items-center gap-2 mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/queue">Go to Queue</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/settings">Open Settings</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredItems.map((blueprint) => {
            const StatusIcon = STATUS_CONFIG[blueprint.status as keyof typeof STATUS_CONFIG]?.icon || Circle;
            const statusConfig = STATUS_CONFIG[blueprint.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
            const activity = getLiveActivity(blueprint);

            return (
              <Card key={blueprint.id} className="overflow-hidden">
                {/* Blueprint Header - Sticky Style */}
                <div className="border-b bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <StatusIcon className={cn('h-5 w-5', statusConfig.color, blueprint.status === 'IN_PROGRESS' && 'animate-spin')} />
                      <div>
                        <h2 className="text-xl font-semibold">{blueprint.application.fullName}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {blueprint.application.industryNiche}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          {getStatusBadge(blueprint.status)}
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {blueprint.researchStages.filter((s) => s.status === 'COMPLETE').length}/12 stages
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {activity.runningStages.length > 0 ? (
                            <span>
                              Running: {activity.runningStages.join(', ')}
                            </span>
                          ) : blueprint.status === 'IN_PROGRESS' ? (
                            <span>
                              No stage is actively running (waiting for worker / next batch). If this stays idle, click{' '}
                              <span className="font-medium">Generate Batch</span> or start the workflow worker.
                            </span>
                          ) : null}
                          {activity.lastActivityAt ? (
                            <span className="ml-2">• Last activity: {formatDateTime(activity.lastActivityAt)}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(blueprint.status === 'COMPLETE' || blueprint.status === 'REVIEW_REQUIRED') && !!blueprint.markdown && (
                            <>
                              <DropdownMenuItem onClick={() => handlePreview(blueprint.id, blueprint.application.fullName)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Full Blueprint
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadPdf(blueprint.id, blueprint.application.fullName)}>
                                <Download className="h-4 w-4 mr-2" />
                                Export as PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy to New
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Blueprint
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {(blueprint.status === 'PENDING' || blueprint.status === 'IN_PROGRESS') &&
                        blueprint.currentBatch <= 5 && (
                          <Button
                            size="sm"
                            onClick={() => handleProcessBatch(blueprint.id)}
                            disabled={processingId === blueprint.id}
                          >
                            {processingId === blueprint.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            {processingId === blueprint.id ? 'Processing...' : 'Generate Batch'}
                          </Button>
                        )}

                      {(blueprint.status === 'COMPLETE' || blueprint.status === 'REVIEW_REQUIRED') &&
                        !!blueprint.markdown && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleDownloadPdf(blueprint.id, blueprint.application.fullName)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export PDF
                            </Button>
                            {!emailDrafts[blueprint.id] ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGenerateApprovalEmail(blueprint.id)}
                                disabled={emailGeneratingId === blueprint.id}
                              >
                                {emailGeneratingId === blueprint.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Mail className="h-4 w-4 mr-2" />
                                )}
                                {emailGeneratingId === blueprint.id ? 'Generating...' : 'Generate Email'}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                asChild
                              >
                                <Link href="/emails">
                                  <Mail className="h-4 w-4 mr-2" />
                                  Review Email
                                </Link>
                              </Button>
                            )}
                          </>
                        )}
                    </div>
                  </div>

                  {/* Blueprint Progress Bar */}
                  <div className="mt-4">
                    <Progress value={blueprint.progress} className="h-2" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Overall Progress</span>
                      <span className="text-xs font-medium">{blueprint.progress}%</span>
                    </div>
                  </div>
                </div>

                {/* Batches Section */}
                <div className="divide-y">
                  {BATCH_CONFIG.map((batch) => {
                    const batchProgress = getBatchProgress(blueprint, batch.number);
                    const isExpanded = expandedBatches.has(`${blueprint.id}-${batch.number}`);
                    const isCurrentBatch = blueprint.currentBatch === batch.number;
                    const hasCompleteStages = batchProgress.completed > 0;

                    return (
                      <Collapsible
                        key={batch.number}
                        open={isExpanded}
                        onOpenChange={() => toggleBatch(blueprint.id, batch.number)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div
                            className={cn(
                              'flex items-center justify-between p-4 hover:bg-accent/50 transition-colors',
                              isCurrentBatch && 'bg-blue-50/50 dark:bg-blue-950/20'
                            )}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <ChevronRight
                                className={cn(
                                  'h-4 w-4 text-muted-foreground transition-transform',
                                  isExpanded && 'rotate-90'
                                )}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    Batch {batch.number}: {batch.name}
                                  </span>
                                  {hasCompleteStages && (
                                    <Badge variant={batchProgress.completed === batchProgress.total ? 'default' : 'secondary'}>
                                      {batchProgress.completed}/{batchProgress.total}
                                    </Badge>
                                  )}
                                  {isCurrentBatch && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                                      Current
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                  <Progress value={batchProgress.percentage} className="w-32 h-1.5" />
                                  <span className="text-xs text-muted-foreground">
                                    {batchProgress.completed === batchProgress.total
                                      ? 'Complete'
                                      : `${batchProgress.completed} of ${batchProgress.total} stages`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {hasCompleteStages && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReviewBatch(blueprint.id, batch.number);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {hasCompleteStages && (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleReviewBatch(blueprint.id, batch.number);
                                    }}>
                                      <Edit2 className="h-4 w-4 mr-2" />
                                      Review & Edit
                                    </DropdownMenuItem>
                                  )}
                                  {hasCompleteStages && batchProgress.completed === batchProgress.total && (
                                    <DropdownMenuItem>
                                      <Download className="h-4 w-4 mr-2" />
                                      Export Batch
                                    </DropdownMenuItem>
                                  )}
                                  {batchProgress.completed < batchProgress.total && (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleProcessBatch(blueprint.id);
                                    }}>
                                      <Play className="h-4 w-4 mr-2" />
                                      Generate Remaining
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="border-t bg-muted/20 p-4">
                            <div className="space-y-1">
                              {batch.stages.map((stageName) => {
                                const stage = getStageForBatch(blueprint, batch.number, stageName);
                                const stageStatus = stage?.status || 'PENDING';
                                const stageConfig = STATUS_CONFIG[stageStatus as keyof typeof STATUS_CONFIG];
                                const StageIcon = stageConfig?.icon || Circle;

                                return (
                                  <div
                                    key={stageName}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <StageIcon
                                        className={cn(
                                          'h-4 w-4',
                                          stageConfig?.color,
                                          stageStatus === 'IN_PROGRESS' && 'animate-spin'
                                        )}
                                      />
                                      <div>
                                        <p className="text-sm font-medium">{STAGE_LABELS[stageName] || stageName}</p>
                                        {stage?.completedAt && (
                                          <p className="text-xs text-muted-foreground">
                                            Completed {formatDateTime(stage.completedAt)}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {stageStatus === 'COMPLETE' && stage ? (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setReviewDialog({
                                                open: true,
                                                blueprintId: blueprint.id,
                                                batchNumber: batch.number,
                                                stages: [{ id: stage.id, stage: stageName, markdown: stage.markdown || '' }],
                                              });
                                            }}
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRegenerateStage(stage.id, stageName, blueprint.id)}
                                            disabled={processingId === stage.id}
                                          >
                                            {processingId === stage.id ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <RefreshCw className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </>
                                      ) : stageStatus === 'IN_PROGRESS' ? (
                                        <Button variant="ghost" size="sm" disabled>
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        </Button>
                                      ) : stageStatus === 'FAILED' ? (
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleRegenerateStage(stage.id, stageName, blueprint.id)}
                                          disabled={processingId === stage.id}
                                        >
                                          {processingId === stage.id ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              ) : (
                                                <RefreshCw className="h-4 w-4 mr-1" />
                                              )}
                                          Retry
                                        </Button>
                                      ) : stageStatus === 'PENDING' ? (
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => handleRegenerateStage(stage.id, stageName, blueprint.id)}
                                          disabled={processingId === stage.id}
                                        >
                                          {processingId === stage.id ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              ) : (
                                                <Play className="h-4 w-4 mr-1" />
                                              )}
                                          Generate
                                        </Button>
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onOpenChange={(open) => setPreviewDialog({ ...previewDialog, open })}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewDialog.title}</DialogTitle>
            <DialogDescription>Comprehensive business plan preview</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto prose prose-sm max-w-none">
            <div
              className="whitespace-pre-wrap font-sans text-sm"
              dangerouslySetInnerHTML={{ __html: previewDialog.markdown.replace(/\n/g, '<br/>') }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Batch Dialog */}
      <Dialog
        open={reviewDialog.open}
        onOpenChange={(open) => setReviewDialog({ ...reviewDialog, open })}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Review {BATCH_CONFIG.find((b) => b.number === reviewDialog.batchNumber)?.name || `Batch ${reviewDialog.batchNumber}`}</DialogTitle>
            <DialogDescription>
              Review and edit each stage before proceeding to the next batch. Next batches use this content as context.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto space-y-4 px-1">
            {reviewDialog.stages.map((stage) => {
              const isEditing = editingStage?.stageId === stage.id;
              return (
                <Card key={stage.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{STAGE_LABELS[stage.stage] || stage.stage}</CardTitle>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingStage(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={savingId === stage.id}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              {savingId === stage.id ? 'Saving...' : 'Save'}
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditingStage({ stageId: stage.id, markdown: stage.markdown })
                            }
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={editingStage.markdown}
                        onChange={(e) =>
                          setEditingStage({ ...editingStage, markdown: e.target.value })
                        }
                        className="min-h-[300px] font-mono text-sm"
                        placeholder="Stage content..."
                      />
                    ) : (
                      <div className="max-h-[300px] overflow-auto prose prose-sm max-w-none">
                        <div
                          className="whitespace-pre-wrap font-sans text-sm"
                          dangerouslySetInnerHTML={{
                            __html: stage.markdown.replace(/\n/g, '<br/>'),
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="border-t pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReviewDialog({ ...reviewDialog, open: false })}>
              Close
            </Button>
            <Button onClick={handleApproveBatch}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
