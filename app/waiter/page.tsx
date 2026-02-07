'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Clock, CheckCircle, DollarSign, Utensils } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { waiterAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/mock-data'
import { connectSocket, onOrderStatusUpdate, disconnectSocket } from '@/lib/socket'
import { toast } from 'sonner'

export default function WaiterDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tables, setTables] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is waiter or admin
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (parsedUser.role !== 'waiter' && parsedUser.role !== 'admin') {
        toast.error('Bu sahifa faqat waiter va admin uchun')
        router.push('/login')
        return
      }
    } else {
      router.push('/login')
      return
    }

    loadData()

    // Connect socket for real-time updates
    const socket = connectSocket()
    console.log('🔌 Waiter Dashboard: Socket connecting...')

    // Listen for order status updates
    const unsubscribe = onOrderStatusUpdate((order) => {
      console.log('📥 Waiter Dashboard: Buyurtma yangilandi', order)
      
      // Show notification if order is ready
      if (order.status === 'ready') {
        toast.success(`🎉 Stol ${order.table?.number} tayyor!`, {
          duration: 5000,
          description: 'Mijozga taom olib boring',
        })
      }
      
      loadData()
    })

    return () => {
      unsubscribe()
      disconnectSocket()
    }
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [tablesRes, ordersRes] = await Promise.all([
        waiterAPI.getMyTables(),
        waiterAPI.getMyOrders(),
      ])
      setTables(tablesRes.data)
      setOrders(ordersRes.data)
    } catch (error: any) {
      console.error('Ma\'lumotlarni yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const myTables = tables.filter((t) => t.currentWaiter?._id === user?._id || t.currentWaiter === user?._id)
  const availableTables = tables.filter((t) => t.status === 'available')
  const activeOrders = orders.filter((o) => o.paymentStatus !== 'paid')
  const todayRevenue = orders
    .filter((o) => o.paymentStatus === 'paid' && new Date(o.paidAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">BASMA Osh Markazi</h1>
            <p className="text-sm text-muted-foreground">
              Ofitsiant: {user?.fullName} 🔄 Real-time
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Chiqish
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Utensils className="size-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{myTables.length}</div>
                <div className="text-sm text-muted-foreground">Mening stollarim</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="size-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeOrders.length}</div>
                <div className="text-sm text-muted-foreground">Faol buyurtmalar</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle className="size-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{availableTables.length}</div>
                <div className="text-sm text-muted-foreground">Bo'sh stollar</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-lg bg-purple-500/10">
                <DollarSign className="size-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(todayRevenue)}</div>
                <div className="text-sm text-muted-foreground">Bugungi daromad</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tezkor harakatlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => router.push('/waiter/tables')}>
                <Plus className="mr-2 size-4" />
                Yangi buyurtma
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/waiter/orders')}>
                Faol buyurtmalar
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/waiter/marketplace-orders')}>
                Marketplace Buyurtmalar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mening stollarim</CardTitle>
            </CardHeader>
            <CardContent>
              {myTables.length === 0 ? (
                <p className="text-sm text-muted-foreground">Hozircha biriktirilgan stollar yo'q</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {myTables.map((table) => (
                    <Button
                      key={table._id}
                      variant="outline"
                      className="h-16"
                      onClick={() => router.push(`/waiter/tables/${table._id}`)}
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold">#{table.number}</div>
                        <div className="text-xs text-muted-foreground">
                          {table.status === 'occupied' ? 'Band' : 'Bo\'sh'}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>So'nggi buyurtmalar</CardTitle>
          </CardHeader>
          <CardContent>
            {activeOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Faol buyurtmalar yo'q</p>
            ) : (
              <div className="space-y-4">
                {activeOrders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => router.push(`/waiter/orders/${order._id}`)}
                  >
                    <div>
                      <div className="font-medium">Stol #{order.tableNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.items.length} ta taom
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(order.totalAmount)}</div>
                      <Badge variant="outline" className="mt-1">
                        {order.status === 'pending' && 'Kutilmoqda'}
                        {order.status === 'preparing' && 'Tayyorlanmoqda'}
                        {order.status === 'ready' && 'Tayyor'}
                        {order.status === 'served' && 'Berildi'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
