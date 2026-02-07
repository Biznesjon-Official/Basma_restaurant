'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, ChefHat, Utensils } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { waiterAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/mock-data'
import { connectSocket, onOrderStatusUpdate, disconnectSocket, onMarketplaceOrderCreated, onMarketplaceOrderAccepted, onMarketplaceOrderUpdated } from '@/lib/socket'
import { toast } from 'sonner'

export default function WaiterOrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [marketplaceOrders, setMarketplaceOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is waiter
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (parsedUser.role !== 'waiter') {
        router.push('/')
        return
      }
    } else {
      router.push('/login')
      return
    }

    loadOrders()

    // Connect socket for real-time updates
    const socket = connectSocket()
    console.log('🔌 Waiter Orders: Socket connecting...')

    // Listen for order status updates (restoran buyurtmalari)
    const unsubscribe1 = onOrderStatusUpdate((order) => {
      console.log('📥 Waiter: Buyurtma yangilandi (order:status)', {
        orderId: order._id,
        status: order.status,
        tableNumber: order.tableNumber,
        orderType: order.orderType,
        timestamp: new Date().toISOString()
      })
      
      // Show notification if order is ready
      if (order.status === 'ready') {
        console.log('🔔 Buyurtma tayyor! Bildirishnoma ko\'rsatilmoqda...')
        const displayName = order.table?.number 
          ? `Stol ${order.table.number}` 
          : order.customerName || 'Buyurtma'
        toast.success(`${displayName} tayyor! 🎉`, {
          duration: 5000,
        })
        
        // Play sound (optional)
        if (typeof Audio !== 'undefined') {
          const audio = new Audio('/notification.mp3')
          audio.play().catch(() => {})
        }
      }
      
      console.log('🔄 Buyurtmalar ro\'yxati yangilanmoqda...')
      loadOrders()
    })

    // Listen for marketplace order events
    const unsubscribe2 = onMarketplaceOrderCreated((order) => {
      console.log('📥 Waiter: Yangi marketplace buyurtma qabul qilindi!', {
        orderId: order._id,
        marketplaceName: order.marketplaceName,
        customerName: order.customerName,
        itemsCount: order.items?.length,
        totalAmount: order.totalAmount,
        timestamp: new Date().toISOString()
      })
      
      console.log('🔔 Yangi buyurtma bildirishnomasi ko\'rsatilmoqda...')
      toast.success(`Yangi ${order.marketplaceName} buyurtma! 🆕`, {
        duration: 5000,
      })
      
      console.log('🔄 Buyurtmalar ro\'yxati yangilanmoqda...')
      loadOrders()
    })

    const unsubscribe3 = onMarketplaceOrderAccepted((order) => {
      console.log('📥 Waiter: Marketplace buyurtma qabul qilindi', {
        orderId: order._id,
        status: order.status,
        timestamp: new Date().toISOString()
      })
      loadOrders()
    })

    const unsubscribe4 = onMarketplaceOrderUpdated((order) => {
      console.log('📥 Waiter: Marketplace buyurtma yangilandi', {
        orderId: order._id,
        status: order.status,
        timestamp: new Date().toISOString()
      })
      
      // Show notification if marketplace order is ready
      if (order.status === 'ready') {
        console.log('🔔 Marketplace buyurtma tayyor!')
        toast.success(`${order.customerName || order.marketplaceName} tayyor! 🎉`, {
          duration: 5000,
        })
        
        // Play sound
        if (typeof Audio !== 'undefined') {
          const audio = new Audio('/notification.mp3')
          audio.play().catch(() => {})
        }
      }
      
      loadOrders()
    })

    return () => {
      unsubscribe1()
      unsubscribe2()
      unsubscribe3()
      unsubscribe4()
      disconnectSocket()
    }
  }, [router])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      
      console.log('🔍 Waiter buyurtmalari yuklanmoqda...', {
        timestamp: new Date().toISOString()
      })
      
      // Waiter API dan buyurtmalarni olish (o'zining restoran + barcha marketplace)
      console.log('📡 API: /api/waiter/orders dan so\'rov yuborilmoqda...')
      const response = await fetch(`${apiUrl}/waiter/orders?status=pending,confirmed,preparing,ready`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      const allOrders = data.data || []
      
      console.log('✅ Waiter orders ma\'lumotlar olindi:', {
        total: allOrders.length,
        orders: allOrders.map((o: any) => ({
          id: o._id,
          type: o.orderType,
          status: o.status,
          customerName: o.customerName,
          marketplaceName: o.marketplaceName,
          tableNumber: o.tableNumber
        }))
      })
      
      // Restoran buyurtmalari (orderType: 'restaurant')
      const restaurantOrders = allOrders.filter((o: any) => o.orderType === 'restaurant')
      console.log('🍽️ Restoran buyurtmalari:', {
        count: restaurantOrders.length,
        orders: restaurantOrders.map((o: any) => ({
          id: o._id,
          table: o.tableNumber,
          status: o.status
        }))
      })
      
      // Marketplace buyurtmalari (orderType: 'marketplace')
      const marketplaceOrders = allOrders
        .filter((o: any) => o.orderType === 'marketplace')
        .map((o: any) => ({
          ...o,
          marketplaceName: o.marketplaceName || 'Tashqi Sayt',
          customerName: o.customerName || 'Mijoz',
          customerPhone: o.customerPhone || '',
          // confirmed -> new (display uchun)
          status: o.status === 'confirmed' ? 'new' : o.status,
        }))
      
      console.log('🛒 Marketplace buyurtmalari:', {
        count: marketplaceOrders.length,
        orders: marketplaceOrders.map((o: any) => ({
          id: o._id,
          marketplace: o.marketplaceName,
          customer: o.customerName,
          status: o.status
        }))
      })
      
      // Har bir marketplace buyurtmaning to'liq tafsilotlari
      if (marketplaceOrders.length > 0) {
        console.log('📋 MARKETPLACE BUYURTMALAR TAFSILOTLARI:')
        marketplaceOrders.forEach((order: any, index: number) => {
          console.log(`\n🛒 Buyurtma #${index + 1}:`)
          console.log('  📱 Xaridor raqami:', order.customerPhone || 'Yo\'q')
          console.log('  👤 Xaridor ismi:', order.customerName || 'Yo\'q')
          console.log('  🏪 Marketplace:', order.marketplaceName || 'Yo\'q')
          console.log('  💰 Jami summa:', order.totalAmount)
          console.log('  📦 Mahsulotlar:')
          order.items?.forEach((item: any, i: number) => {
            const itemName = item.menuItem?.name || item.menuItemName || 'Noma\'lum'
            console.log(`    ${i + 1}. ${itemName}`)
            console.log(`       Narxi: ${item.price} so'm`)
            console.log(`       Miqdori: ${item.quantity} ta`)
          })
        })
      }
      
      console.log('💾 State ga saqlash...')
      setOrders(restaurantOrders)
      setMarketplaceOrders(marketplaceOrders)
      
      console.log('📊 Jami:', {
        restoran: restaurantOrders.length,
        marketplace: marketplaceOrders.length,
        marketplaceNew: marketplaceOrders.filter((o: any) => o.status === 'new').length,
        marketplaceAccepted: marketplaceOrders.filter((o: any) => o.status !== 'new' && o.status !== 'delivered').length
      })
      
      console.log('🎉 Barcha buyurtmalar muvaffaqiyatli yuklandi!')
      
      console.log('🎉 Barcha buyurtmalar muvaffaqiyatli yuklandi!')
      
    } catch (error: any) {
      console.error('❌ Buyurtmalarni yuklashda xatolik:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
      toast.error('Buyurtmalarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="size-4" />
      case 'preparing':
        return <ChefHat className="size-4" />
      case 'ready':
        return <CheckCircle className="size-4" />
      case 'served':
        return <Utensils className="size-4" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Kutilmoqda'
      case 'preparing':
        return 'Tayyorlanmoqda'
      case 'ready':
        return 'Tayyor'
      case 'served':
        return 'Berildi'
      case 'paid':
        return 'To\'langan'
      default:
        return status
    }
  }

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'preparing':
        return 'default'
      case 'ready':
        return 'default'
      case 'served':
        return 'outline'
      case 'paid':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const activeOrders = orders.filter((o) => o.paymentStatus !== 'paid')
  const completedOrders = orders.filter((o) => o.paymentStatus === 'paid')
  const newMarketplaceOrders = marketplaceOrders.filter((o) => o.status === 'new')
  const acceptedMarketplaceOrders = marketplaceOrders.filter((o) => o.status !== 'new' && o.status !== 'delivered' && o.status !== 'cancelled')

  const renderOrderCard = (order: any) => (
    <Card
      key={order._id}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/waiter/orders/${order._id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {order.tableNumber ? `Stol #${order.tableNumber}` : order.customerName || 'Buyurtma'}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              {new Date(order.createdAt).toLocaleString('uz-UZ', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
          <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1">
            {getStatusIcon(order.status)}
            {getStatusText(order.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Mahsulotlar ro'yxati */}
          <div className="text-sm text-muted-foreground space-y-1">
            {order.items.slice(0, 2).map((item: any, index: number) => {
              const itemName = item.menuItem?.name || item.menuItemName || item.name || 'Mahsulot'
              return (
                <div key={index} className="flex justify-between">
                  <span>{item.quantity}x {itemName}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              )
            })}
            {order.items.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{order.items.length - 2} ta yana...
              </div>
            )}
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm font-medium">Jami:</div>
            <div className="text-lg font-bold text-primary">
              {formatCurrency(order.totalAmount || order.total || 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderMarketplaceOrderCard = (order: any) => (
    <Card
      key={order._id}
      className="cursor-pointer hover:shadow-md transition-shadow border-orange-200 bg-orange-50/50"
      onClick={() => {
        // Marketplace buyurtma detallari
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
        router.push(`/waiter/marketplace-orders/${order._id}`)
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{order.customerName || 'Mijoz'}</CardTitle>
              <Badge variant="outline" className="text-xs bg-orange-100">
                {order.marketplaceName || 'Marketplace'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {order.customerPhone || 'Telefon yo\'q'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(order.createdAt).toLocaleString('uz-UZ', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
          <Badge variant={order.status === 'new' ? 'default' : getStatusVariant(order.status)} className="flex items-center gap-1">
            {order.status === 'new' ? '🆕 Yangi' : getStatusText(order.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {order.items?.length || 0} ta taom • {order.deliveryType === 'delivery' ? '🚚 Yetkazish' : '📦 Olib ketish'}
          </div>
          {order.customerAddress && (
            <div className="text-xs text-muted-foreground truncate">
              📍 {order.customerAddress}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Jami:</div>
            <div className="text-lg font-bold text-orange-600">
              {formatCurrency(order.totalAmount + (order.deliveryFee || 0))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Mening buyurtmalarim</h1>
            <p className="text-sm text-muted-foreground">
              Barcha buyurtmalar ro'yxati
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Yuklanmoqda...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Hozircha buyurtmalar yo'q</div>
            <Button className="mt-4" onClick={() => router.push('/waiter/tables')}>
              Yangi buyurtma yaratish
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="restaurant" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="restaurant">
                🍽️ Restoran ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger value="marketplace">
                🆕 Yangi ({newMarketplaceOrders.length})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                ✅ Qabul ({acceptedMarketplaceOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="restaurant" className="space-y-4">
              {activeOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Faol buyurtmalar yo'q
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeOrders.map(renderOrderCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-4">
              {newMarketplaceOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Yangi marketplace buyurtmalar yo'q
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {newMarketplaceOrders.map(renderMarketplaceOrderCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="accepted" className="space-y-4">
              {acceptedMarketplaceOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Qabul qilingan buyurtmalar yo'q
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {acceptedMarketplaceOrders.map(renderMarketplaceOrderCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
