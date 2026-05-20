import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
import { CheckCircle2, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { db } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function getConversions() {
  const awaitingResponse = await db.workflowState.findMany({
    where: {
      status: 'AWAITING_RESPONSE',
    },
    include: {
      application: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const converted = await db.workflowState.findMany({
    where: {
      status: 'CONVERTED',
    },
    include: {
      application: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 20,
  });

  return { awaitingResponse, converted };
}

export default async function ConversionsPage() {
  const { awaitingResponse, converted } = await getConversions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conversions</h1>
        <p className="text-muted-foreground">
          Track application conversions and manage follow-ups
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Response</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{awaitingResponse.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Emails sent, waiting for reply
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{converted.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully converted to clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {awaitingResponse.length + converted.length > 0
                ? Math.round(
                    (converted.length / (awaitingResponse.length + converted.length)) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Of contacted prospects
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Awaiting Response</CardTitle>
          <CardDescription>
            Prospects who have been emailed but haven't responded yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {awaitingResponse.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No prospects awaiting response</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prospect</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Email Sent</TableHead>
                    <TableHead>Follow-ups</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {awaitingResponse.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.application.fullName}
                      </TableCell>
                      <TableCell>{item.application.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.emailSentAt ? formatDateTime(item.emailSentAt) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.followUpCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <MarkAsConvertedButton
                          workflowId={item.id}
                          applicantName={item.application.fullName}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conversions</CardTitle>
          <CardDescription>
            Successfully converted prospects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {converted.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversions yet</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Converted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {converted.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.application.fullName}
                      </TableCell>
                      <TableCell>{item.application.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {item.application.industryNiche}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(item.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MarkAsConvertedButton({
  workflowId,
  applicantName,
}: {
  workflowId: string;
  applicantName: string;
}) {
  return (
    <Dialog>
      <Button size="sm" variant="outline">
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Mark Converted
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Converted</DialogTitle>
          <DialogDescription>
            Record that {applicantName} has accepted the partnership and will be onboarded as a client.
          </DialogDescription>
        </DialogHeader>
        <form action={async (formData: FormData) => {
          'use server';
          const notes = formData.get('notes') as string;

          await db.workflowState.update({
            where: { id: workflowId },
            data: {
              status: 'CONVERTED',
              statusHistory: {
                push: {
                  from: 'AWAITING_RESPONSE',
                  to: 'CONVERTED',
                  at: new Date().toISOString(),
                  notes,
                },
              },
            },
          });

          await db.workflowAuditLog.create({
            data: {
              workflowId,
              action: 'MARK_CONVERTED',
              newStatus: 'CONVERTED',
              oldStatus: 'AWAITING_RESPONSE',
              metadata: { notes },
            },
          });

          revalidatePath('/conversions');
          revalidatePath('/');
        }}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Conversion Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any notes about the conversion (e.g., discussed terms, next steps, etc.)..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" variant="default">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Conversion
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
