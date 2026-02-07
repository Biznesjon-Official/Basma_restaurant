'use client'

import { useState, useEffect } from 'react'
import { Clock, ChefHat, CheckCircle, Utensils, CreditCard, Loader2, RefreshCw } from 'lucide-react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ordersAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/mock-data'

const statusConfig = {
  new: {
    label: 'Yangi',
    icon: Clock,
    color: 'bg-red-500/10 text-red-600 border-red-200',
  },
  pending: {
    label: 'Kutilmoqda',
    icon: Clock,
    color: 'bg-amber-500/10 text-amber-600 border-amber-200',
  },
  confirmed: {
    label: 'Tasdiqlandi',
    icon: CheckCircle,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
  },
  preparing: {
    label: 'Tayyorlanmoqda',
    icon: ChefHat,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
  },
  ready: {
    label: 'Tayyor',
    icon: CheckCircle,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  },
  served: {
    label: 'Berildi',
    icon: Utensils,
    color: 'bg-purple-500/10 text-purple-600 border-purple-200',
  },
  completed: {
    label: "To'landi",
    icon: CreditCard,
    color: 'bg-gray-500/10 text-gray-600 border-gray-200',
  },
}

function OrderCard({ order, onStatusChange }: { order: any; onStatusChange: () => void }) {
  const [updating, setUpdating] = useState(false)
  const status = statusConfig[order.status as keyof typeof statusConfig] || {
    label: order.status || 'Noma\'lum',
    icon: Clock,
    color: 'bg-gray-500/10 text-gray-600 border-gray-200',
  }
  const StatusIcon = status.icon

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    try {
      await ordersAPI.updateStatus(order._id, newStatus)
      onStatusChange()
    } catch (error: any) {
      alert(error.message || 'Xatolik yuz berdi')
    } finally {
      setUpdating(false)
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const orderDate = new Date(date)
    const diffMs = now.getTime() - orderDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'hozirgina'
    if (diffMins < 60) return `${diffMins} daqiqa oldin`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} soat oldin`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} kun oldin`
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
              #{order.tableNumber}
            </div>
            <div>
              <CardTitle className="text-base">Buyurtma</CardTitle>
              <p className="text-sm text-muted-foreground">
                {order.waiter?.fullName || order.customerName || 'N/A'}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={status.color}>
            <StatusIcon className="mr-1 size-3" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {order.items.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span>
                {item.quantity}x {item.menuItem?.name || 'Taom'}
              </span>
              <span className="text-muted-foreground">
                {formatCurrency((item.menuItem?.price || 0) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {formatTimeAgo(order.createdAt)}
            </span>
            <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {order.status === 'new' && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange('pending')}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-1 size-4" />
              )}
              Qabul qilish
            </Button>
          )}
          {order.status === 'pending' && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange('preparing')}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <ChefHat className="mr-1 size-4" />
              )}
              Tayyorlashga
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange('ready')}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-1 size-4" />
              )}
              Tayyor
            </Button>
          )}
          {order.status === 'ready' && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange('served')}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <Utensils className="mr-1 size-4" />
              )}
              Berildi
            </Button>
          )}
          {order.status === 'served' && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleStatusChange('completed')}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <CreditCard className="mr-1 size-4" />
              )}
              To&apos;lov
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadOrders()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getAll({ limit: 100 })
      setOrders(response.data)
    } catch (error: any) {
      console.error('Buyurtmalarni yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = (status?: string) => {
    if (!status || status === 'all') return orders
    return orders.filter((order) => order.status === status)
  }

  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length
    return orders.filter((order) => order.status === status).length
  }

  const filteredOrders = filterOrders(activeTab === 'all' ? undefined : activeTab)

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Buyurtmalar</h1>
                <p className="text-muted-foreground">Barcha buyurtmalarni kuzatish</p>
              </div>
              <Button onClick={loadOrders} variant="outline" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-1 size-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1 size-4" />
                )}
                Yangilash
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">
                  Barchasi
                  <Badge variant="secondary" className="ml-2">
                    {getStatusCount('all')}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="new">
                  Yangi
                  <Badge variant="secondary" className="ml-2">
                    {getStatusCount('new')}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Kutilmoqda
                  <Badge variant="secondary" className="ml-2">
                    {getStatusCount('pending')}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="preparing">
                  Tayyorlanmoqda
                  <Badge variant="secondary" className="ml-2">
                    {getStatusCount('preparing')}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="ready">
                  Tayyor
                  <Badge variant="secondary" className="ml-2">
                    {getStatusCount('ready')}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="served">
                  Berildi
                  <Badge variant="secondary" className="ml-2">
                    {getStatusCount('served')}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="paid">
                  To&apos;landi
                  <Badge variant="secondary" className="ml-2">
                    {getStatusCount('paid')}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <p className="text-muted-foreground">Buyurtmalar yo&apos;q</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredOrders.map((order) => (
                      <OrderCard key={order._id} order={order} onStatusChange={loadOrders} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
