'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { tablesAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

const statusConfig = {
  available: { label: 'Bo\'sh', color: 'bg-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' },
  occupied: { label: 'Band', color: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' },
  reserved: { label: 'Bron', color: 'bg-purple-500', bgLight: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' },
  cleaning: { label: 'Tozalanmoqda', color: 'bg-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' },
}

export function TablesOverview() {
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTables()
    const interval = setInterval(loadTables, 60000) // Refresh every 60 seconds (reduced from 30)
    return () => clearInterval(interval)
  }, [])

  const loadTables = async () => {
    try {
      const response = await tablesAPI.getAll()
      setTables(response.data || [])
    } catch (error: any) {
      // Silent error for 403 and 429 (expected for non-admin users or rate limiting)
      if (error.status !== 403 && error.status !== 429) {
        console.error('Tables overview error:', error)
      }
      // Set empty data on error
      setTables([])
    } finally {
      setLoading(false)
    }
  }

  const statusCounts = {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stollar holati</CardTitle>
        <CardDescription>Restoran bo&apos;yicha stollar</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-4">
              {Object.entries(statusConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={cn('size-3 rounded-full', config.color)} />
                  <span className="text-sm text-muted-foreground">
                    {config.label}: <strong>{statusCounts[key as keyof typeof statusCounts]}</strong>
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {tables.map((table) => {
                const status = statusConfig[table.status as keyof typeof statusConfig]
                return (
                  <div
                    key={table._id}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-lg border p-3 transition-all hover:scale-105 cursor-pointer',
                      status.bgLight
                    )}
                  >
                    <span className="text-lg font-bold">{table.number}</span>
                    <span className="text-xs text-muted-foreground">{table.capacity} kishi</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
