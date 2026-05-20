'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Download, FileText, Loader2, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type ReportType = 'clients' | 'deliverables' | 'business_plans' | 'activities' | 'jobs' | 'tickets' | 'token_usage'
type ReportFormat = 'csv' | 'json' | 'pdf'

const REPORT_TYPES = [
  { value: 'clients', label: 'Clients Report', description: 'Full client details with metrics and counts' },
  { value: 'deliverables', label: 'Deliverables Report', description: 'Completion data with client info' },
  { value: 'business_plans', label: 'Business Plans Report', description: 'Plan details with version history' },
  { value: 'activities', label: 'Activities Report', description: 'Complete activity log with user info' },
  { value: 'jobs', label: 'Jobs Report', description: 'Queue status and completion times' },
  { value: 'tickets', label: 'Tickets Report', description: 'Support metrics and resolution data' },
  { value: 'token_usage', label: 'Token Usage Report', description: 'AI consumption with costs' }
]

const REPORT_FORMATS = [
  { value: 'csv', label: 'CSV', description: 'Excel/Google Sheets compatible' },
  { value: 'json', label: 'JSON', description: 'Structured data for integrations' },
  { value: 'pdf', label: 'PDF', description: 'Executive reports and presentations' }
]

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('clients')
  const [format, setFormat] = useState<ReportFormat>('csv')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('')
  const [limit, setLimit] = useState('1000')
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  const generateReport = async () => {
    setGenerating(true)
    try {
      const params: Record<string, string> = {
        type: reportType,
        format
      }

      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (status) params.status = status
      if (limit) params.limit = limit

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `report.${format}`

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Report generated',
        description: `Downloaded ${filename} successfully`
      })
    } catch (error) {
      console.error('Failed to generate report:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate report',
        variant: 'destructive'
      })
    } finally {
      setGenerating(false)
    }
  }

  const selectedReport = REPORT_TYPES.find(r => r.value === reportType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate and download comprehensive reports in multiple formats
        </p>
      </div>

      {/* Report Generator */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Select report type, format, and filters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type */}
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                  <SelectTrigger id="report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedReport && (
                  <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                )}
              </div>

              {/* Export Format */}
              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as ReportFormat)}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_FORMATS.map((fmt) => (
                      <SelectItem key={fmt.value} value={fmt.value}>
                        {fmt.label} - {fmt.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filters */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Filters (Optional)</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status Filter</Label>
                    <Input
                      id="status"
                      placeholder="e.g., ACTIVE, COMPLETED"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="limit">Row Limit</Label>
                    <Select value={limit} onValueChange={setLimit}>
                      <SelectTrigger id="limit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 rows</SelectItem>
                        <SelectItem value="500">500 rows</SelectItem>
                        <SelectItem value="1000">1,000 rows</SelectItem>
                        <SelectItem value="5000">5,000 rows</SelectItem>
                        <SelectItem value="10000">10,000 rows</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <Button
                  onClick={generateReport}
                  disabled={generating}
                  className="w-full"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generate & Download Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {REPORT_TYPES.map((type) => (
                <div key={type.value} className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {REPORT_FORMATS.map((fmt) => (
                <div key={fmt.value} className="flex items-start gap-2">
                  <Download className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{fmt.label}</p>
                    <p className="text-xs text-muted-foreground">{fmt.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Use CSV for data analysis in Excel or Google Sheets</p>
              <p>• Use JSON for API integrations and data pipelines</p>
              <p>• Use PDF for executive presentations</p>
              <p>• Apply filters to narrow down results</p>
              <p>• Higher row limits may take longer to generate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
