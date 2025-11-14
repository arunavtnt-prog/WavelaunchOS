import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Inbox } from 'lucide-react'

export default function SubmissionsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Inbox className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>D2D Submissions</CardTitle>
              <CardDescription>
                Direct-to-designer submissions will appear here
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This section will display all D2D submission requests from creators.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
