'use client'

import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { analyticsAPI } from '@/lib/api'

export function RevenueChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 300000) // Refresh every 5 minutes (reduced from 1 minute)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const response = await analyticsAPI.getDashboard()
      const revenueByHour = response.data?.revenueByHour || []
      
      // Fill missing hours with 0
      const hours = Array.from({ length: 24 }, (_, i) => i)
      const filledData = hours.map(hour => {
        const existing = revenueByHour.find((item: any) => item.hour === `${hour}:00`)
        return {
          hour: `${hour}:00`,
          revenue: existing?.revenue || 0
        }
      })
      
      setData(filledData)
    } catch (error: any) {
      // Silent error for 403 and 429 (expected for non-admin users or rate limiting)
      if (error.status !== 403 && error.status !== 429) {
        console.error('Revenue chart error:', error)
      }
      // If 403 or 429, just set empty data
      if (error.status === 403 || error.status === 429) {
        setData([])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kunlik daromad</CardTitle>
        <CardDescription>Soatlik daromad ko&apos;rsatkichlari</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} so'm`, 'Daromad']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
