import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>Help Center</CardTitle>
              <CardDescription>
                Documentation and support resources
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Find answers to common questions, tutorials, and system documentation here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
