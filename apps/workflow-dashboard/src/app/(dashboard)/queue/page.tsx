'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ApplicationQueueTable } from '@/components/queue/application-queue-table';
import { Search, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface QueueItem {
  id: string;
  application: any;
  workflowState: any;
}

export default function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const url = searchQuery
        ? `/api/workflow/queue?search=${encodeURIComponent(searchQuery)}`
        : '/api/workflow/queue';

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setItems(result.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load queue',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load queue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const response = await fetch(`/api/workflow/queue/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error('Failed to approve');
    }

    // Refresh the queue
    await fetchQueue();
  };

  const handleReject = async (id: string, reason?: string) => {
    const response = await fetch(`/api/workflow/queue/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', reason }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error('Failed to reject');
    }

    // Refresh the queue
    await fetchQueue();
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchQueue();
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Queue</h1>
          <p className="text-muted-foreground">
            Review and approve applications for workflow processing
          </p>
        </div>
        <Button onClick={fetchQueue} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>
            {items.length} application{items.length !== 1 ? 's' : ''} awaiting review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or social handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ApplicationQueueTable items={items} onApprove={handleApprove} onReject={handleReject} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
