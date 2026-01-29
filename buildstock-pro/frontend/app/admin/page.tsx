'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Package, Store, Activity, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
}

function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend !== undefined && (
              <p className={`text-sm mt-1 flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(trend)}%
              </p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const metrics = [
    { title: 'Total Users', value: '2,487', icon: <Users className="h-6 w-6" />, trend: 12.5 },
    { title: 'Total Products', value: '12,543', icon: <Package className="h-6 w-6" /> },
    { title: 'Active Merchants', value: '156', icon: <Store className="h-6 w-6" /> },
    { title: 'Active Sessions', value: '342', icon: <Activity className="h-6 w-6" />, trend: 8.2 },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome to BuildStock Pro Admin</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <MetricCard key={i} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>API and database health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>API Server</span>
                <span className="text-green-600 font-medium">● Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Database</span>
                <span className="text-green-600 font-medium">● Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Response Time</span>
                <span className="font-medium">45ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sync</CardTitle>
            <CardDescription>Latest merchant synchronization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span>Screwfix</span>
                <span className="text-green-600">✓ Completed</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span>Wickes</span>
                <span className="text-green-600">✓ Completed</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>B&Q</span>
                <span className="text-yellow-600">⟳ Syncing...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
