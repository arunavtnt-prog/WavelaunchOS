import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle>Raise Ticket</CardTitle>
                <CardDescription>
                  Report issues or request support
                </CardDescription>
              </div>
            </div>
            <Button>New Ticket</Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Submit technical issues, feature requests, or general support inquiries here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
