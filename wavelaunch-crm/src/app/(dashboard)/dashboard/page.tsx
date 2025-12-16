'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Target, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/clients">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0 from last month</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/clients">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0 from last month</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/business-plans">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Business Plans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0 from last month</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/deliverables">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deliverables</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0 from last month</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">System is running normally</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Dashboard loaded successfully at {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Overall system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">All systems operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/clients">
                <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                  <Users className="h-6 w-6 mb-2" />
                  <div className="font-medium">Manage Clients</div>
                  <div className="text-sm text-muted-foreground">View and manage all clients</div>
                </div>
              </Link>
              <Link href="/business-plans">
                <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                  <FileText className="h-6 w-6 mb-2" />
                  <div className="font-medium">Business Plans</div>
                  <div className="text-sm text-muted-foreground">Generate business plans</div>
                </div>
              </Link>
              <Link href="/submissions">
                <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                  <Target className="h-6 w-6 mb-2" />
                  <div className="font-medium">Submissions</div>
                  <div className="text-sm text-muted-foreground">View application submissions</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
