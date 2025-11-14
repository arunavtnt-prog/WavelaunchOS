import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default function DeliverablesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>Deliverables Hub</CardTitle>
              <CardDescription>
                Centralized view of all client deliverables across the 8-month program
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This section will aggregate all monthly deliverables (M1-M8) across clients for easy tracking and management.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
