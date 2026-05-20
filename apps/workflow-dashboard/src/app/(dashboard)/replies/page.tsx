'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { toast } from '@/components/ui/use-toast';
import { RefreshCw, Inbox, Wand2, Eye, ArrowLeft } from 'lucide-react';
import { ReplyEditor } from '@/components/replies/reply-editor';
import { formatDateTime } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type ConversationListItem = {
  id: string;
  campaignId: string | null;
  campaignName: string | null;
  mailboxEmail: string | null;
  leadEmail: string;
  leadName: string | null;
  category: string | null;
  leadType?: string;
  leadTypeManualOverride?: string | null;
  intent?: string | null;
  pipelineSuggested?: boolean;
  needsReply?: boolean;
  lastInboundAt?: string | null;
  lastMessageAt: string;
  contact?: { email: string; kind: string; name: string | null } | null;
  messages: Array<{
    id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    subject: string | null;
    bodyText: string;
    receivedAt: string;
  }>;
  drafts: Array<{
    id: string;
    subject: string;
    status: string;
    createdAt: string;
    confidence: number | null;
    category: string | null;
  }>;
};

type ConversationDetail = {
  id: string;
  campaignId: string | null;
  campaignName: string | null;
  mailboxEmail: string | null;
  leadEmail: string;
  leadName: string | null;
  category: string | null;
  leadType?: string;
  leadTypeManualOverride?: string | null;
  intent?: string | null;
  pipelineSuggested?: boolean;
  needsReply?: boolean;
  summaryText?: string | null;
  lastInboundAt?: string | null;
  lastMessageAt: string;
  contact?: { email: string; kind: string; name: string | null } | null;
  messages: Array<{
    id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    fromEmail: string | null;
    toEmail: string | null;
    subject: string | null;
    bodyText: string;
    receivedAt: string;
  }>;
  drafts: Array<{
    id: string;
    subject: string;
    body: string;
    status: string;
    createdAt: string;
    model: string | null;
    tokensUsed: number | null;
    confidence: number | null;
    category: string | null;
  }>;
};

export default function RepliesPage() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selected, setSelected] = useState<ConversationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [isBulkDrafting, setIsBulkDrafting] = useState(false);
  const [isIngestingPlaybook, setIsIngestingPlaybook] = useState(false);
  const [leadTypeFilter, setLeadTypeFilter] = useState<string>('ALL');
  const [needsReplyOnly, setNeedsReplyOnly] = useState<boolean>(true);
  const [config, setConfig] = useState({
    companyContext: '',
    styleGuide: '',
    defaultCta: '',
  });
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [campaignId, setCampaignId] = useState('');
  const [mboxPath, setMboxPath] = useState('/Users/arunav/Downloads/INBOX.mbox/mbox');
  const [importEmail, setImportEmail] = useState('graciethompson971@gmail.com');
  const [isLearningStyle, setIsLearningStyle] = useState(false);
  const [aiHealth, setAiHealth] = useState<{ ok: boolean; message: string }>({
    ok: false,
    message: 'Unknown',
  });
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});
  const [recentJobs, setRecentJobs] = useState<
    Array<{
      id: string;
      type: string;
      status: string;
      attempts: number;
      payload: string;
      result: string | null;
      error: string | null;
      createdAt: string;
      startedAt: string | null;
      completedAt: string | null;
    }>
  >([]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (needsReplyOnly && !c.needsReply) return false;
      if (leadTypeFilter !== 'ALL' && (c.leadType || 'COLD') !== leadTypeFilter) return false;
      return true;
    });
  }, [conversations, leadTypeFilter, needsReplyOnly]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/replies/conversations');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load');
      setConversations(json.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/replies/conversations/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load conversation');
      setSelected(json.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load conversation',
        variant: 'destructive',
      });
    }
  };

  const syncMock = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/replies/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'mock' }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Sync failed');
      toast({
        title: 'Seeded (mock)',
        description: `Created ${json.data.createdConversations}, appended ${json.data.appendedMessages}`,
      });
      await fetchConversations();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Sync failed',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncInstantly = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/replies/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'instantly' }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Sync failed');
      toast({
        title: 'Synced (Instantly)',
        description: `Fetched ${json.data.fetchedTotal ?? 0} (received ${json.data.fetchedReceived ?? 0}) • New msgs ${json.data.appendedMessages} • New threads ${json.data.createdConversations}`,
      });
      await fetchConversations();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Sync failed',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncCampaignAll = async () => {
    const trimmed = campaignId.trim();
    if (!trimmed) {
      toast({
        title: 'Missing campaign_id',
        description: 'Paste a campaign_id to sync.',
        variant: 'destructive',
      });
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch('/api/replies/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'instantly',
          campaignId: trimmed,
          syncAll: true,
          limit: 100,
          maxPages: 60,
          pageDelayMs: 3200,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Sync failed');
      toast({
        title: 'Synced campaign',
        description: `Fetched ${json.data.fetchedTotal ?? 0} (received ${json.data.fetchedReceived ?? 0}) • New msgs ${json.data.appendedMessages} • New threads ${json.data.createdConversations}`,
      });
      await fetchConversations();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Sync failed',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncInstantlyDebug = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/replies/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'instantly', debug: true, emailType: 'all' }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Sync failed');
      console.log('Instantly sync debug:', json.data?.debug);
      toast({
        title: 'Synced (debug)',
        description: `Fetched ${json.data.fetchedTotal ?? 0} (received ${json.data.fetchedReceived ?? 0}). Check console for samples.`,
      });
      await fetchConversations();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Sync failed',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const testAi = async () => {
    setIsTestingAi(true);
    try {
      const res = await fetch('/api/replies/ai/test');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'AI test failed');
      toast({
        title: 'AI test OK',
        description: `${json.data.provider} • ${json.data.model} • "${json.data.text}"`,
      });
    } catch (error) {
      toast({
        title: 'AI test failed',
        description: error instanceof Error ? error.message : 'AI test failed',
        variant: 'destructive',
      });
    } finally {
      setIsTestingAi(false);
    }
  };

  const bulkDraft = async () => {
    setIsBulkDrafting(true);
    try {
      const trimmed = campaignId.trim();
      const res = await fetch('/api/replies/bulk-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: trimmed || undefined,
          limit: 100,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Bulk draft failed');
      toast({
        title: 'Queued drafts',
        description: `Matched ${json.data.matched}, enqueued ${json.data.enqueued}. Run the worker to process.`,
      });
      await fetchJobs();
    } catch (error) {
      toast({
        title: 'Bulk draft failed',
        description: error instanceof Error ? error.message : 'Bulk draft failed',
        variant: 'destructive',
      });
    } finally {
      setIsBulkDrafting(false);
    }
  };

  const mapCampaignPolicy = async (policyKey: 'D26' | 'GENERAL') => {
    const trimmed = campaignId.trim();
    if (!trimmed) {
      toast({
        title: 'Missing campaign_id',
        description: 'Paste a campaign_id first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('/api/replies/campaign-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerCampaignId: trimmed,
          policyKey,
          allowCalls: policyKey !== 'D26',
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to map campaign');
      toast({ title: 'Campaign mapped', description: `${trimmed} → ${policyKey}` });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to map campaign',
        variant: 'destructive',
      });
    }
  };

  const ingestD26Playbook = async () => {
    setIsIngestingPlaybook(true);
    try {
      const res = await fetch('/api/replies/playbooks/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbookKey: 'D26', replace: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Playbook ingest failed');
      toast({
        title: 'Playbook ingested',
        description: `Created ${json.data.sectionsCreated} sections.`,
      });
    } catch (error) {
      toast({
        title: 'Playbook ingest failed',
        description: error instanceof Error ? error.message : 'Playbook ingest failed',
        variant: 'destructive',
      });
    } finally {
      setIsIngestingPlaybook(false);
    }
  };

  const importMboxForEmail = async () => {
    const path = mboxPath.trim();
    const email = importEmail.trim().toLowerCase();

    if (!path || !email) {
      toast({
        title: 'Missing input',
        description: 'Provide an mbox path and email to import.',
        variant: 'destructive',
      });
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch('/api/replies/import-mbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mboxPath: path,
          correspondentEmail: email,
          contactKind: 'CLIENT',
          leadName: 'Gracie',
          limit: 20000,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Import failed');
      toast({
        title: 'Imported from mbox',
        description: `Matched ${json.data.matchedMessages}, imported ${json.data.appendedMessages}`,
      });
      await fetchConversations();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Import failed',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const learnStyleFromMbox = async () => {
    const path = mboxPath.trim();
    if (!path) {
      toast({
        title: 'Missing mbox path',
        description: 'Provide a local mbox path.',
        variant: 'destructive',
      });
      return;
    }

    setIsLearningStyle(true);
    try {
      const res = await fetch('/api/replies/style/from-mbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mboxPath: path }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Style learning failed');

      toast({
        title: 'Style updated',
        description: `Learned from ${json.data?.samplesUsed ?? 0} samples.`,
      });
      await fetchConfig();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Style learning failed',
        variant: 'destructive',
      });
    } finally {
      setIsLearningStyle(false);
    }
  };

  const generateDraft = async (conversationId: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/replies/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', conversationId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Draft generation failed (${res.status})`);
      }

      toast({ title: 'Draft generated', description: 'Reply draft created and ready for review.' });
      await fetchConversations();
      if (selected?.id === conversationId) {
        await openConversation(conversationId);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Draft generation failed',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const setLeadTypeOverride = async (conversationId: string, leadType: string | null) => {
    try {
      const res = await fetch(`/api/replies/conversations/${conversationId}/lead-type`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: leadType ? JSON.stringify({ leadType }) : JSON.stringify({ clear: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to update lead type');
      await fetchConversations();
      if (selected?.id === conversationId) await openConversation(conversationId);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update lead type',
        variant: 'destructive',
      });
    }
  };

  const markPipeline = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/replies/conversations/${conversationId}/mark-pipeline`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to mark pipeline');
      await fetchConversations();
      if (selected?.id === conversationId) await openConversation(conversationId);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mark pipeline',
        variant: 'destructive',
      });
    }
  };

  const latestDraft = useMemo(() => {
    if (!selected?.drafts?.length) return null;
    return selected.drafts[0];
  }, [selected]);

  const saveDraft = async (subject: string, body: string) => {
    if (!latestDraft) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/replies/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', draftId: latestDraft.id, subject, body }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Save failed');
      if (selected) await openConversation(selected.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Save failed',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const approveDraft = async () => {
    if (!latestDraft) return;
    setIsApproving(true);
    try {
      const res = await fetch('/api/replies/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', draftId: latestDraft.id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Approve failed');
      if (selected) await openConversation(selected.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Approve failed',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsApproving(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConfig = async () => {
    setIsConfigLoading(true);
    try {
      const res = await fetch('/api/replies/config');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load config');
      setConfig({
        companyContext: json.data.companyContext || '',
        styleGuide: json.data.styleGuide || '',
        defaultCta: json.data.defaultCta || '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load agent config',
        variant: 'destructive',
      });
    } finally {
      setIsConfigLoading(false);
    }
  };

  const saveConfig = async () => {
    setIsConfigSaving(true);
    try {
      const res = await fetch('/api/replies/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to save config');
      toast({ title: 'Saved', description: 'Reply agent config updated.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save agent config',
        variant: 'destructive',
      });
    } finally {
      setIsConfigSaving(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchAiHealth = async () => {
    try {
      const res = await fetch('/api/replies/ai/health');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Unavailable');
      const provider = typeof json.data?.provider === 'string' ? json.data.provider : 'unknown';
      const model = typeof json.data?.model === 'string' ? json.data.model : '';
      setAiHealth({ ok: true, message: `OK (${provider}${model ? ` • ${model}` : ''})` });
    } catch (error) {
      setAiHealth({
        ok: false,
        message: error instanceof Error ? error.message : 'Unavailable',
      });
    }
  };

  useEffect(() => {
    fetchAiHealth();
    const interval = setInterval(fetchAiHealth, 10_000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/replies/jobs');
      const json = await res.json();
      if (!json.success) return;
      setJobCounts(json.data?.counts || {});
      setRecentJobs(json.data?.recent || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5_000);
    return () => clearInterval(interval);
  }, []);

  const statusBadge = (status?: string) => {
    const label = status || '—';
    const variant =
      status === 'PENDING_REVIEW'
        ? 'warning'
        : status === 'APPROVED'
          ? 'success'
          : status === 'MODIFIED'
            ? 'info'
            : 'secondary';
    return <Badge variant={variant as any}>{label.replace(/_/g, ' ')}</Badge>;
  };

  const jobStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    const variant =
      s === 'COMPLETED'
        ? 'success'
        : s === 'FAILED'
          ? 'destructive'
          : s === 'PROCESSING'
            ? 'warning'
            : 'secondary';
    return <Badge variant={variant as any}>{s}</Badge>;
  };

  const extractConversationIdFromPayload = (payload: string): string | null => {
    try {
      const parsed = JSON.parse(payload || '{}');
      const id = typeof parsed?.conversationId === 'string' ? parsed.conversationId : null;
      return id;
    } catch {
      return null;
    }
  };

  const fmt = (iso: string | null | undefined) => {
    if (!iso) return '—';
    try {
      return formatDateTime(new Date(iso));
    } catch {
      return '—';
    }
  };

  const leadTypeBadge = (leadType?: string, manualOverride?: string | null) => {
    const label = (leadType || 'COLD').toUpperCase();
    const variant =
      label === 'PIPELINE'
        ? 'success'
        : label === 'CLIENT'
          ? 'info'
          : label === 'CLOSED'
            ? 'secondary'
            : label === 'FOLLOWUP'
              ? 'warning'
              : 'outline';
    return (
      <Badge variant={variant as any} title={manualOverride ? `Manual override: ${manualOverride}` : undefined}>
        {label}
      </Badge>
    );
  };

  const intentBadge = (intent?: string | null) => {
    if (!intent) return null;
    return <Badge variant="secondary">{intent.toUpperCase()}</Badge>;
  };

  if (selected) {
    const lastInbound = [...selected.messages].reverse().find((m) => m.direction === 'INBOUND');

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelected(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Reply Thread</h1>
            <p className="text-muted-foreground">
              {selected.leadName ? `${selected.leadName} — ` : ''}
              {selected.leadEmail}
            </p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {leadTypeBadge(selected.leadType, selected.leadTypeManualOverride)}
            {intentBadge(selected.intent)}
            {selected.pipelineSuggested && selected.leadType !== 'PIPELINE' && (
              <Badge variant="outline" title="AI suggests this lead may be moving toward conversion.">
                Pipeline suggested
              </Badge>
            )}
          </div>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={selected.leadTypeManualOverride || ''}
            onChange={(e) => {
              const v = e.target.value;
              void setLeadTypeOverride(selected.id, v ? v : null);
            }}
            title="Manual lead type override"
          >
            <option value="">Auto</option>
            <option value="COLD">COLD</option>
            <option value="FOLLOWUP">FOLLOWUP</option>
            <option value="PIPELINE">PIPELINE</option>
            <option value="CLOSED">CLOSED</option>
          </select>
          {selected.leadType !== 'PIPELINE' && (
            <Button onClick={() => markPipeline(selected.id)} variant="outline">
              Mark Pipeline
            </Button>
          )}
          <Button
            onClick={() => generateDraft(selected.id)}
            disabled={isGenerating}
            variant="outline"
          >
            <Wand2 className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
            Generate draft
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
                <CardDescription>
                  {selected.campaignName || selected.campaignId || 'No campaign'} •{' '}
                  {selected.mailboxEmail || 'No mailbox'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Last message: {formatDateTime(new Date(selected.lastMessageAt))}
                </div>
                {selected.category && <Badge variant="secondary">{selected.category}</Badge>}
                {selected.summaryText && (
                  <div className="border rounded-md p-3 bg-muted/20">
                    <div className="text-xs text-muted-foreground mb-2">Thread summary</div>
                    <div className="text-sm whitespace-pre-wrap">{selected.summaryText}</div>
                  </div>
                )}
                {lastInbound && (
                  <div className="border rounded-md p-3 bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-2">
                      Latest inbound • {formatDateTime(new Date(lastInbound.receivedAt))}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{lastInbound.bodyText}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>{selected.messages.length} message(s)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selected.messages.map((m) => (
                  <div key={m.id} className="border rounded-md p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={m.direction === 'INBOUND' ? 'secondary' : 'outline'}>
                          {m.direction}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(new Date(m.receivedAt))}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {m.fromEmail || '—'} → {m.toEmail || '—'}
                      </span>
                    </div>
                    {m.subject && (
                      <div className="text-sm font-medium mb-2">{m.subject}</div>
                    )}
                    <div className="text-sm whitespace-pre-wrap">{m.bodyText}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {!latestDraft ? (
              <Card>
                <CardHeader>
                  <CardTitle>No draft yet</CardTitle>
                  <CardDescription>Generate a draft to start replying faster.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => generateDraft(selected.id)} disabled={isGenerating}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate draft
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {statusBadge(latestDraft.status)}
                  {latestDraft.model && (
                    <Badge variant="secondary">{latestDraft.model}</Badge>
                  )}
                  {typeof latestDraft.tokensUsed === 'number' && (
                    <Badge variant="outline">{latestDraft.tokensUsed} tokens</Badge>
                  )}
                  {typeof latestDraft.confidence === 'number' && (
                    <Badge variant="outline">
                      conf {Math.round(latestDraft.confidence * 100)}%
                    </Badge>
                  )}
                </div>

                <ReplyEditor
                  initialSubject={latestDraft.subject}
                  initialBody={latestDraft.body}
                  recipientEmail={selected.leadEmail}
                  recipientName={selected.leadName}
                  onSave={saveDraft}
                  onApprove={approveDraft}
                  isSaving={isSaving}
                  isApproving={isApproving}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Replies</h1>
          <p className="text-muted-foreground">
            Pull replies from Instantly and generate drafts with GLM 4.7 (draft-only).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="campaign_id (optional)"
            className="w-[360px] font-mono text-xs"
          />
          <Badge variant={aiHealth.ok ? 'success' : 'destructive'} title={aiHealth.message}>
            AI: {aiHealth.ok ? 'OK' : 'Down'}
          </Badge>
          <Badge
            variant="outline"
            title={`Draft jobs • queued ${jobCounts.QUEUED || 0} • processing ${jobCounts.PROCESSING || 0} • failed ${jobCounts.FAILED || 0}`}
          >
            Jobs {jobCounts.QUEUED || 0}/{jobCounts.PROCESSING || 0}/{jobCounts.FAILED || 0}
          </Badge>
          <Button onClick={testAi} variant="outline" size="sm" disabled={isTestingAi}>
            {isTestingAi ? 'Testing…' : 'Test AI'}
          </Button>
          <Button onClick={bulkDraft} variant="outline" size="sm" disabled={isBulkDrafting}>
            {isBulkDrafting ? 'Queueing…' : 'Bulk draft'}
          </Button>
          <Button onClick={() => mapCampaignPolicy('D26')} variant="outline" size="sm">
            Map D26
          </Button>
          <Button onClick={() => mapCampaignPolicy('GENERAL')} variant="outline" size="sm">
            Map General
          </Button>
          <Button onClick={ingestD26Playbook} variant="outline" size="sm" disabled={isIngestingPlaybook}>
            {isIngestingPlaybook ? 'Ingesting…' : 'Ingest D26'}
          </Button>
          <Button onClick={syncInstantly} variant="outline" size="sm" disabled={isSyncing}>
            <Inbox className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-pulse' : ''}`} />
            Sync Instantly
          </Button>
          <Button onClick={syncCampaignAll} variant="outline" size="sm" disabled={isSyncing}>
            Sync Campaign (All)
          </Button>
          <Button onClick={syncInstantlyDebug} variant="outline" size="sm" disabled={isSyncing}>
            Debug Sync
          </Button>
          <Button onClick={syncMock} variant="outline" size="sm" disabled={isSyncing}>
            <Inbox className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-pulse' : ''}`} />
            Seed mock
          </Button>
          <Button onClick={fetchConversations} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Draft Jobs</CardTitle>
          <CardDescription>
            Bulk draft queue (processed by `npm run replies:worker`).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline">Queued {jobCounts.QUEUED || 0}</Badge>
            <Badge variant="outline">Processing {jobCounts.PROCESSING || 0}</Badge>
            <Badge variant="outline">Failed {jobCounts.FAILED || 0}</Badge>
            <Badge variant="outline">Completed {jobCounts.COMPLETED || 0}</Badge>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={fetchJobs}>
              Refresh jobs
            </Button>
          </div>

          {recentJobs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No draft jobs yet. Click “Bulk draft”.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Conversation</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Done</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobs.map((j) => {
                    const conversationId = extractConversationIdFromPayload(j.payload);
                    return (
                      <TableRow key={j.id}>
                        <TableCell>{jobStatusBadge(j.status)}</TableCell>
                        <TableCell>
                          {conversationId ? (
                            <Button
                              variant="link"
                              className="px-0 h-auto text-xs font-mono"
                              onClick={() => openConversation(conversationId)}
                            >
                              {conversationId.slice(0, 10)}…
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{j.attempts}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{fmt(j.createdAt)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{fmt(j.startedAt)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{fmt(j.completedAt)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground line-clamp-2 max-w-[420px]">
                          {j.error || '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reply Agent Config</CardTitle>
          <CardDescription>
            This is the “another you” context GLM uses to draft replies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyContext">Company context</Label>
            <Textarea
              id="companyContext"
              value={config.companyContext}
              onChange={(e) => setConfig((prev) => ({ ...prev, companyContext: e.target.value }))}
              placeholder="What is Wavelaunch? Offer, positioning, constraints, links you can share, claims you must avoid…"
              rows={4}
              className="font-mono text-sm"
              disabled={isConfigLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="styleGuide">Writing style</Label>
            <Textarea
              id="styleGuide"
              value={config.styleGuide}
              onChange={(e) => setConfig((prev) => ({ ...prev, styleGuide: e.target.value }))}
              placeholder="Tone rules, do/don’t, signature, length, question style, how you handle objections…"
              rows={4}
              className="font-mono text-sm"
              disabled={isConfigLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultCta">Default CTA</Label>
            <Textarea
              id="defaultCta"
              value={config.defaultCta}
              onChange={(e) => setConfig((prev) => ({ ...prev, defaultCta: e.target.value }))}
              placeholder="Your preferred next step CTA (calendar link, quick questions, etc)."
              rows={3}
              className="font-mono text-sm"
              disabled={isConfigLoading}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveConfig} disabled={isConfigSaving || isConfigLoading}>
              {isConfigSaving ? 'Saving…' : 'Save config'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import (MBOX)</CardTitle>
          <CardDescription>
            Load historical conversations from a local mbox file (one contact at a time).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="mboxPath">MBOX path</Label>
              <Input
                id="mboxPath"
                value={mboxPath}
                onChange={(e) => setMboxPath(e.target.value)}
                className="font-mono text-xs"
                placeholder="/Users/arunav/Downloads/INBOX.mbox/mbox"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="importEmail">Client email</Label>
              <Input
                id="importEmail"
                value={importEmail}
                onChange={(e) => setImportEmail(e.target.value)}
                className="font-mono text-xs"
                placeholder="graciethompson971@gmail.com"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              <Button onClick={learnStyleFromMbox} variant="outline" disabled={isLearningStyle}>
                {isLearningStyle ? 'Learning…' : 'Learn my style'}
              </Button>
              <Button onClick={importMboxForEmail} disabled={isSyncing}>
                Import Gracie
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>
            Showing {filteredConversations.length} of {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </CardDescription>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="leadTypeFilter" className="text-xs text-muted-foreground">
                Lead type
              </Label>
              <select
                id="leadTypeFilter"
                className="h-8 rounded-md border bg-background px-2 text-xs"
                value={leadTypeFilter}
                onChange={(e) => setLeadTypeFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="COLD">COLD</option>
                <option value="FOLLOWUP">FOLLOWUP</option>
                <option value="PIPELINE">PIPELINE</option>
                <option value="CLIENT">CLIENT</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="needsReplyOnly" className="text-xs text-muted-foreground">
                Needs reply
              </Label>
              <input
                id="needsReplyOnly"
                type="checkbox"
                checked={needsReplyOnly}
                onChange={(e) => setNeedsReplyOnly(e.target.checked)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Click “Seed mock” or “Sync Instantly”.</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No conversations match the current filters.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Latest</TableHead>
                    <TableHead>Draft</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversations.map((c) => {
                    const last = c.messages?.[0];
                    const draft = c.drafts?.[0];
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{c.leadName || c.leadEmail}</div>
                            {c.contact?.kind === 'CLIENT' && (
                              <Badge variant="secondary">Client</Badge>
                            )}
                            {c.needsReply && (
                              <Badge variant="destructive" title="New inbound needs a draft">
                                Needs reply
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{c.leadEmail}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {leadTypeBadge(c.leadType, c.leadTypeManualOverride || null)}
                            {intentBadge(c.intent || null)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{c.campaignName || c.campaignId || '—'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDateTime(new Date(c.lastMessageAt))}
                          </div>
                          {last?.bodyText && (
                            <div className="text-sm line-clamp-2">{last.bodyText}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {draft ? (
                            <div className="space-y-1">
                              {statusBadge(draft.status)}
                              {typeof draft.confidence === 'number' && (
                                <div className="text-xs text-muted-foreground">
                                  conf {Math.round(draft.confidence * 100)}%
                                </div>
                              )}
                            </div>
                          ) : (
                            <Badge variant="secondary">No draft</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateDraft(c.id)}
                              disabled={isGenerating}
                            >
                              <Wand2 className="h-4 w-4 mr-2" />
                              Draft
                            </Button>
                            <Button size="sm" onClick={() => openConversation(c.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Open
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
