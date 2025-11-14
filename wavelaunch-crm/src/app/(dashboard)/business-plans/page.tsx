import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function BusinessPlansPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>Business Plans</CardTitle>
              <CardDescription>
                All client business plans in one place
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This section will display all generated business plans with version tracking and export capabilities.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
