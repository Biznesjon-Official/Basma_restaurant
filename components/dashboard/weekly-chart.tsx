'use client'

import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { analyticsAPI } from '@/lib/api'

export function WeeklyChart() {
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
      const weeklyRevenue = response.data?.weeklyRevenue || []
      
      // Format dates to day names
      const daysOfWeek = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']
      const formattedData = weeklyRevenue.map((item: any) => {
        const date = new Date(item.date)
        const dayIndex = date.getDay()
        return {
          day: daysOfWeek[dayIndex],
          revenue: item.revenue,
          date: item.date
        }
      })
      
      setData(formattedData)
    } catch (error: any) {
      // Silent error for 403 and 429 (expected for non-admin users or rate limiting)
      if (error.status !== 403 && error.status !== 429) {
        console.error('Weekly chart error:', error)
      }
      // Set empty data on error
      setData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Haftalik daromad</CardTitle>
        <CardDescription>So&apos;nggi 7 kun ichidagi daromad</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} so'm`, 'Daromad']}
                  cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="var(--color-chart-1)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
