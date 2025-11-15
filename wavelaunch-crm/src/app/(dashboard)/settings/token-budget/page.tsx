'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Zap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

interface TokenBudget {
  id: string
  period: string
  tokenLimit: number
  costLimit: number
  tokensUsed: number
  costUsed: number
  alertAt50: boolean
  alertAt75: boolean
  alertAt90: boolean
  alertAt100: boolean
  autoPauseAtLimit: boolean
  isPaused: boolean
  isActive: boolean
}

interface TokenStats {
  tokenUsage: {
    totalTokens: number
    totalCost: number
    totalRequests: number
    cacheHitRate: number
    byOperation: Record<string, { tokens: number; cost: number; count: number }>
  }
  budgets: {
    daily?: { limit: number; used: number; percentage: number; isPaused: boolean }
    weekly?: { limit: number; used: number; percentage: number; isPaused: boolean }
    monthly?: { limit: number; used: number; percentage: number; isPaused: boolean }
  }
  cache: {
    totalEntries: number
    totalHits: number
    totalTokensSaved: number
    cacheHitRate: number
  }
}

export default function TokenBudgetPage() {
  const { toast } = useToast()
  const [budgets, setBudgets] = useState<TokenBudget[]>([])
  const [stats, setStats] = useState<TokenStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Form state
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY')
  const [tokenLimit, setTokenLimit] = useState('1000000')
  const [costLimit, setCostLimit] = useState('50')
  const [alertAt50, setAlertAt50] = useState(true)
  const [alertAt75, setAlertAt75] = useState(true)
  const [alertAt90, setAlertAt90] = useState(true)
  const [alertAt100, setAlertAt100] = useState(true)
  const [autoPause, setAutoPause] = useState(false)

  useEffect(() => {
    fetchBudgets()
    fetchStats()
  }, [])

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/token-budget')
      const data = await res.json()
      if (data.success) {
        setBudgets(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/token-stats?period=month')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleCreateBudget = async () => {
    try {
      const res = await fetch('/api/token-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          tokenLimit: parseInt(tokenLimit),
          costLimit: parseFloat(costLimit),
          alertAt50,
          alertAt75,
          alertAt90,
          alertAt100,
          autoPauseAtLimit: autoPause,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Budget created successfully' })
        setShowCreateForm(false)
        fetchBudgets()
        fetchStats()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create budget', variant: 'destructive' })
    }
  }

  const handleResetBudget = async (id: string) => {
    try {
      const res = await fetch(`/api/token-budget/${id}/reset`, {
        method: 'POST',
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Budget reset successfully' })
        fetchBudgets()
        fetchStats()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reset budget', variant: 'destructive' })
    }
  }

  const handleTogglePause = async (budget: TokenBudget) => {
    try {
      const res = await fetch(`/api/token-budget/${budget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPaused: !budget.isPaused,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Success',
          description: budget.isPaused ? 'Budget resumed' : 'Budget paused',
        })
        fetchBudgets()
        fetchStats()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update budget', variant: 'destructive' })
    }
  }

  const getPercentage = (used: number, limit: number) => {
    return (used / limit) * 100
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600'
    if (percentage >= 75) return 'bg-orange-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-green-600'
  }

  const activeBudgets = budgets.filter((b) => b.isActive)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Token Budget Management</h1>
        <p className="text-muted-foreground">
          Track and control AI token usage and costs
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.tokenUsage.totalTokens.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.tokenUsage.totalRequests} requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.tokenUsage.totalCost.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.cache.cacheHitRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.cache.totalTokensSaved.toLocaleString()} tokens saved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cache Entries</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cache.totalEntries}</div>
              <p className="text-xs text-muted-foreground">
                {stats.cache.totalHits} total hits
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Budgets */}
      {activeBudgets.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {activeBudgets.map((budget) => {
            const tokenPercentage = getPercentage(
              budget.tokensUsed,
              budget.tokenLimit
            )
            const costPercentage = getPercentage(budget.costUsed, budget.costLimit)
            const maxPercentage = Math.max(tokenPercentage, costPercentage)

            return (
              <Card key={budget.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{budget.period}</CardTitle>
                    {budget.isPaused && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        Paused
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    {budget.tokensUsed.toLocaleString()} /{' '}
                    {budget.tokenLimit.toLocaleString()} tokens
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Token Usage Progress */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>Tokens</span>
                      <span className="font-medium">
                        {tokenPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded overflow-hidden">
                      <div
                        className={`h-full transition-all ${getProgressColor(
                          tokenPercentage
                        )}`}
                        style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Cost Usage Progress */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>Cost</span>
                      <span className="font-medium">
                        ${budget.costUsed.toFixed(2)} / ${budget.costLimit.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded overflow-hidden">
                      <div
                        className={`h-full transition-all ${getProgressColor(
                          costPercentage
                        )}`}
                        style={{ width: `${Math.min(costPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleResetBudget(budget.id)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                    <Button
                      variant={budget.isPaused ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTogglePause(budget)}
                    >
                      {budget.isPaused ? 'Resume' : 'Pause'}
                    </Button>
                  </div>

                  {/* Alerts */}
                  {maxPercentage >= 75 && (
                    <div className="flex items-center gap-2 rounded-md bg-orange-50 p-2 text-sm text-orange-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        {maxPercentage >= 90
                          ? 'Budget almost exceeded'
                          : 'Budget warning threshold'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Budget Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Budget Configuration</CardTitle>
              <CardDescription>
                Create and manage token usage budgets
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Cancel' : 'Create New Budget'}
            </Button>
          </div>
        </CardHeader>
        {showCreateForm && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select
                  value={period}
                  onValueChange={(v) => setPeriod(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tokenLimit">Token Limit</Label>
                <Input
                  id="tokenLimit"
                  type="number"
                  value={tokenLimit}
                  onChange={(e) => setTokenLimit(e.target.value)}
                  placeholder="1000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costLimit">Cost Limit ($)</Label>
                <Input
                  id="costLimit"
                  type="number"
                  step="0.01"
                  value={costLimit}
                  onChange={(e) => setCostLimit(e.target.value)}
                  placeholder="50.00"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="font-medium">Alert Thresholds</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="alert50">Alert at 50%</Label>
                  <Switch
                    id="alert50"
                    checked={alertAt50}
                    onCheckedChange={setAlertAt50}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="alert75">Alert at 75%</Label>
                  <Switch
                    id="alert75"
                    checked={alertAt75}
                    onCheckedChange={setAlertAt75}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="alert90">Alert at 90%</Label>
                  <Switch
                    id="alert90"
                    checked={alertAt90}
                    onCheckedChange={setAlertAt90}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="alert100">Alert at 100%</Label>
                  <Switch
                    id="alert100"
                    checked={alertAt100}
                    onCheckedChange={setAlertAt100}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="autoPause">Auto-pause at limit</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically pause AI generation when budget is exceeded
                </p>
              </div>
              <Switch
                id="autoPause"
                checked={autoPause}
                onCheckedChange={setAutoPause}
              />
            </div>

            <Button onClick={handleCreateBudget} className="w-full">
              Create Budget
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Usage by Operation */}
      {stats && Object.keys(stats.tokenUsage.byOperation).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage by Operation</CardTitle>
            <CardDescription>Token usage breakdown by operation type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.tokenUsage.byOperation).map(
                ([operation, data]) => {
                  const percentage =
                    (data.tokens / stats.tokenUsage.totalTokens) * 100
                  return (
                    <div key={operation}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium">{operation}</span>
                        <div className="text-right">
                          <div>{data.tokens.toLocaleString()} tokens</div>
                          <div className="text-xs text-muted-foreground">
                            ${data.cost.toFixed(2)} ({data.count} calls)
                          </div>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-muted rounded overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
