'use client'

import { useEffect, useState } from 'react'
import { Clock, ChefHat, CheckCircle, Utensils } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ordersAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/mock-data'
import { onOrderStatusUpdate } from '@/lib/socket'

const statusConfig = {
  pending: { label: 'Kutilmoqda', icon: Clock, color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  preparing: { label: 'Tayyorlanmoqda', icon: ChefHat, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  ready: { label: 'Tayyor', icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  served: { label: 'Berildi', icon: Utensils, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  paid: { label: 'To\'landi', icon: CheckCircle, color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
}

export function ActiveOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
    
    // Listen for real-time updates
    const unsubscribe = onOrderStatusUpdate(() => {
      loadOrders()
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAll()
      const activeOrders = response.data.filter((order: any) => 
        ['pending', 'preparing', 'ready'].includes(order.status)
      )
      setOrders(activeOrders)
    } catch (error: any) {
      // Silent error for 403 and 429
      if (error.status !== 403 && error.status !== 429) {
        console.error('Active orders error:', error)
      }
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const orderDate = new Date(date)
    const diffMs = now.getTime() - orderDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Hozir'
    if (diffMins < 60) return `${diffMins} daqiqa oldin`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours} soat oldin`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Faol buyurtmalar</CardTitle>
            <CardDescription>Real vaqtdagi buyurtmalar holati</CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {orders.length} ta
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="size-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">Hozircha faol buyurtma yo&apos;q</p>
              </div>
            ) : (
              orders.slice(0, 5).map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig]
                const StatusIcon = status.icon
                return (
                  <div
                    key={order._id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-muted font-bold">
                        #{order.table?.number || order.tableNumber || '?'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">#{order.orderNumber || order._id.slice(-6)}</span>
                          <Badge variant="outline" className={status.color}>
                            <StatusIcon className="mr-1 size-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{order.items?.length || 0} ta taom</span>
                          {order.waiter?.fullName && (
                            <>
                              <span>-</span>
                              <span>{order.waiter.fullName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(order.totalAmount || order.total || 0)}</div>
                      <div className="text-sm text-muted-foreground">{formatTimeAgo(order.createdAt)}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
