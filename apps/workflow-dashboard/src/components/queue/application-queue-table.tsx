'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatDateTime } from '@/lib/utils';
import { Check, X, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export interface QueueItem {
  id: string;
  application: any;
  workflowState: any;
}

interface ApplicationQueueTableProps {
  items: QueueItem[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}

export function ApplicationQueueTable({ items, onApprove, onReject }: ApplicationQueueTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentRejectId, setCurrentRejectId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(items.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await onApprove(id);
      toast({
        title: 'Application approved',
        description: 'The application has been queued for blueprint generation.',
      });
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve application.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (id: string) => {
    setCurrentRejectId(id);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!currentRejectId) return;

    setIsProcessing(true);
    try {
      await onReject(currentRejectId, rejectReason);
      toast({
        title: 'Application rejected',
        description: 'The application has been rejected.',
      });
      setRejectDialogOpen(false);
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentRejectId);
        return newSet;
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject application.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setCurrentRejectId(null);
    }
  };

  const handleBulkApprove = async () => {
    setIsProcessing(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id) => onApprove(id)));
      toast({
        title: 'Applications approved',
        description: `${selectedIds.size} applications have been queued for blueprint generation.`,
      });
      setSelectedIds(new Set());
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve some applications.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      SUBMITTED: { variant: 'default', label: 'Submitted' },
      BLUEPRINT_QUEUED: { variant: 'info', label: 'Queued' },
      BLUEPRINT_GENERATING: { variant: 'warning', label: 'Generating' },
      REJECTED: { variant: 'destructive', label: 'Rejected' },
    };

    const config = statusConfig[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No applications in queue</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Applications submitted via the public form will appear here for your review.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.size === items.length && items.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={(checked) => handleSelectOne(item.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.application.fullName}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{item.application.email}</div>
                    {item.application.instagramHandle && (
                      <div className="text-muted-foreground text-xs">@{item.application.instagramHandle}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.application.country}</TableCell>
                <TableCell>{item.application.industryNiche}</TableCell>
                <TableCell>
                  {getStatusBadge(item.workflowState?.status || 'SUBMITTED')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(item.application.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleApprove(item.id)}
                      disabled={isProcessing}
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRejectClick(item.id)}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button size="sm" onClick={handleBulkApprove} disabled={isProcessing}>
            Approve All
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>
            Clear Selection
          </Button>
        </div>
      )}

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. This will be logged for future reference.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for rejection</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={isProcessing}>
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
