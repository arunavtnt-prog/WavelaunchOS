'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Eye, FileText, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface EmailEditorProps {
  initialSubject: string;
  initialBody: string;
  attachments?: Array<{ filename: string; path: string; mimeType: string }>;
  recipientEmail: string;
  recipientName: string;
  onSave?: (subject: string, body: string) => Promise<void>;
  onSend?: () => Promise<void>;
  isSending?: boolean;
  isSaving?: boolean;
}

export function EmailEditor({
  initialSubject,
  initialBody,
  attachments = [],
  recipientEmail,
  recipientName,
  onSave,
  onSend,
  isSending = false,
  isSaving = false,
}: EmailEditorProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const handleSave = async () => {
    if (onSave) {
      await onSave(subject, body);
      toast({
        title: 'Draft saved',
        description: 'Email draft has been saved.',
      });
    }
  };

  const handleSend = async () => {
    if (onSend) {
      await onSend();
      toast({
        title: 'Email sent',
        description: `Email has been sent to ${recipientEmail}.`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Draft</CardTitle>
              <CardDescription>
                To: {recipientName} ({recipientEmail})
              </CardDescription>
            </div>
            {attachments.length > 0 && (
              <Badge variant="secondary">
                <FileText className="h-3 w-3 mr-1" />
                {attachments.length} attachment{attachments.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">
                <span className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </span>
              </TabsTrigger>
              <TabsTrigger value="preview">
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Email body..."
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <div className="space-y-1">
                    {attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded bg-muted text-sm"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">{attachment.filename}</span>
                        <Button size="sm" variant="ghost" asChild>
                          <a href={attachment.path} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                {attachments.length > 0 && (
                  <div className="border-t pt-4">
                    <Label className="text-muted-foreground">Attachments:</Label>
                    <div className="mt-2 space-y-1">
                      {attachments.map((attachment, index) => (
                        <div key={index} className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{attachment.filename}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-4 pt-4 border-t">
            {onSave && (
              <Button onClick={handleSave} variant="outline" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            )}
            <div className="flex-1" />
            {onSend && (
              <Button onClick={handleSend} disabled={isSending}>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Edit({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}
