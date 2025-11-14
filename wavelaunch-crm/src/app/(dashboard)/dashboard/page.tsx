'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, DollarSign, HardDrive } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Mock data for the chart
const chartData = [
  { date: 'Apr 6', value: 180 },
  { date: 'Apr 13', value: 220 },
  { date: 'Apr 18', value: 170 },
  { date: 'Apr 20', value: 290 },
  { date: 'Apr 25', value: 250 },
  { date: 'Apr 28', value: 320 },
  { date: 'May 2', value: 280 },
  { date: 'May 8', value: 380 },
  { date: 'May 14', value: 340 },
  { date: 'May 21', value: 420 },
  { date: 'May 27', value: 380 },
  { date: 'Jun 2', value: 450 },
  { date: 'Jun 7', value: 410 },
  { date: 'Jun 11', value: 480 },
  { date: 'Jun 22', value: 520 },
  { date: 'Jun 30', value: 490 },
]

// Mock deliverables data
const deliverables = [
  {
    id: 1,
    header: 'M1 — Discovery & Strategy Brief',
    section: 'Month 1',
    status: 'Approved',
    target: 'May 1',
    limit: 'PDF',
    reviewer: 'Arunav',
  },
  {
    id: 2,
    header: 'M2 — Brand Positioning Deck',
    section: 'Month 2',
    status: 'Approved',
    target: 'May 8',
    limit: 'PDF',
    reviewer: 'Assign reviewer',
  },
  {
    id: 3,
    header: 'M3 — Visual Identity Kit',
    section: 'Month 3',
    status: 'Pending Review',
    target: 'May 1',
    limit: 'Awaiti',
    reviewer: 'Assign reviewer',
  },
  {
    id: 4,
    header: 'M4 — Website Experience Map',
    section: 'Month 4',
    status: 'Draft',
    target: 'May 1',
    limit: 'Awaiti',
    reviewer: 'Assign reviewer',
  },
  {
    id: 5,
    header: 'M5 — Packaging Prototype Brief',
    section: 'Month 5',
    status: 'Draft',
    target: 'May 1',
    limit: 'Awaiti',
    reviewer: 'Assign reviewer',
  },
  {
    id: 6,
    header: 'M6 — GTM Launch Calendar',
    section: 'Month 6',
    status: 'Draft',
    target: 'May 8',
    limit: 'Awaiti',
    reviewer: 'Assign reviewer',
  },
  {
    id: 7,
    header: 'M7 — Revenue Forecast Model',
    section: 'Month 7',
    status: 'Draft',
    target: 'Apr 20',
    limit: 'Awaiti',
    reviewer: 'Assign reviewer',
  },
  {
    id: 8,
    header: 'M8 — Launch Retrospective',
    section: 'Month 8',
    status: 'Draft',
    target: 'Apr 15',
    limit: 'Awaiti',
    reviewer: 'Assign reviewer',
  },
]

const aiNextSteps = [
  {
    priority: 'HIGH',
    title: 'Prep creative brief for Instantly.ai follow-up',
    description: 'Draft messaging variant for Arunav\'s Instantly.ai sequence and queue for Claude review.',
  },
  {
    priority: 'MEDIUM',
    title: 'Shepherd M3 visuals through approval',
    description: 'Collect client feedback on brand identity kit and capture in Deliverables Hub.',
  },
  {
    priority: 'LOW',
    title: 'Schedule backup verification',
    description: 'Run manual backup verification from Settings before weekly sync.',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reply Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23.5%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+2.1%</span> vs last period
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Instantly.ai replies across all campaigns (last 30 days).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warm Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+18.6%</span> vs last period
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Prospects moved to warm-lead stage awaiting outreach.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$47,300</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+12.4%</span> vs last period
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Projected deal value from active creator partnerships.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Utilization</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.4 GB</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-600">-3.2%</span> capacity remaining
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Total storage used of 50 GB budget (auto-cleanup active).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Total Visitors</CardTitle>
              <CardDescription>Total for the last 3 months</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-xs">
                Last 3 months
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                Last 30 days
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                Last 7 days
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Deliverables Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monthly Deliverables</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Customize Columns
              </Button>
              <Button variant="outline" size="sm">
                + Add Section
              </Button>
              <Link href="/clients">
                <Button variant="link" size="sm" className="text-primary">
                  View all
                </Button>
              </Link>
            </div>
          </div>
          <CardDescription>
            Overview of all client engagement across the 8-month program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle text-sm font-medium">
                    Header
                  </th>
                  <th className="h-10 px-4 text-left align-middle text-sm font-medium">
                    Section Type
                  </th>
                  <th className="h-10 px-4 text-left align-middle text-sm font-medium">
                    Status
                  </th>
                  <th className="h-10 px-4 text-left align-middle text-sm font-medium">
                    Target
                  </th>
                  <th className="h-10 px-4 text-left align-middle text-sm font-medium">
                    Limit
                  </th>
                  <th className="h-10 px-4 text-left align-middle text-sm font-medium">
                    Reviewer
                  </th>
                </tr>
              </thead>
              <tbody>
                {deliverables.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-4 align-middle text-sm">{item.header}</td>
                    <td className="p-4 align-middle text-sm text-muted-foreground">
                      {item.section}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge
                        variant={
                          item.status === 'Approved'
                            ? 'default'
                            : item.status === 'Pending Review'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-xs"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-sm text-muted-foreground">
                      {item.target}
                    </td>
                    <td className="p-4 align-middle text-sm text-muted-foreground">
                      {item.limit}
                    </td>
                    <td className="p-4 align-middle text-sm">
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        {item.reviewer}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>0 of 8 row(s) selected.</div>
            <div className="flex items-center gap-6">
              <div>Rows per page: 10</div>
              <div className="flex items-center gap-2">
                <span>Page 1 of 1</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    ‹
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    ›
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    »
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>AI Next Steps</CardTitle>
          <CardDescription>
            Suggested follow-ups based on client progress and system signals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiNextSteps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
            >
              <Badge
                variant={
                  step.priority === 'HIGH'
                    ? 'destructive'
                    : step.priority === 'MEDIUM'
                    ? 'default'
                    : 'secondary'
                }
                className="mt-0.5"
              >
                {step.priority}
              </Badge>
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{step.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
