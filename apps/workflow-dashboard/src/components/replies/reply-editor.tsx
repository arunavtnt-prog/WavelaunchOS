'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Copy, Eye, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ReplyEditorProps {
  initialSubject: string;
  initialBody: string;
  recipientEmail: string;
  recipientName?: string | null;
  onSave?: (subject: string, body: string) => Promise<void>;
  onApprove?: () => Promise<void>;
  isSaving?: boolean;
  isApproving?: boolean;
}

export function ReplyEditor({
  initialSubject,
  initialBody,
  recipientEmail,
  recipientName,
  onSave,
  onApprove,
  isSaving = false,
  isApproving = false,
}: ReplyEditorProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const clipboardText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`Subject: ${subject || ''}`.trimEnd());
    lines.push('');
    lines.push(body || '');
    return lines.join('\n');
  }, [subject, body]);

  const handleSave = async () => {
    if (!onSave) return;
    await onSave(subject, body);
    toast({ title: 'Draft saved', description: 'Reply draft has been saved.' });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clipboardText);
      toast({ title: 'Copied', description: 'Subject + body copied to clipboard.' });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Your browser blocked clipboard access in this context. Please copy manually.',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    await onApprove();
    toast({ title: 'Approved', description: 'Draft approved (not sent).' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reply Draft</CardTitle>
        <CardDescription>
          To: {recipientName ? `${recipientName} (${recipientEmail})` : recipientEmail}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reply-subject">Subject</Label>
              <Input
                id="reply-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reply-body">Message</Label>
              <Textarea
                id="reply-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Reply..."
                rows={16}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="border rounded-lg p-6 space-y-4">
              <div>
                <Label className="text-muted-foreground">Subject:</Label>
                <p className="font-medium mt-1">{subject || 'No subject'}</p>
              </div>
              <div className="border-t pt-4">
                <Label className="text-muted-foreground">Message:</Label>
                <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {body || 'No message content'}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-4 pt-4 border-t">
          {onSave && (
            <Button onClick={handleSave} variant="outline" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
          <Button onClick={handleCopy} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <div className="flex-1" />
          {onApprove && (
            <Button onClick={handleApprove} disabled={isApproving}>
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
