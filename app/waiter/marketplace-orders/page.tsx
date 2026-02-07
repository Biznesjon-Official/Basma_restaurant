'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingBag, Home, Bell, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/mock-data'
import { toast } from 'sonner'
import { io, Socket } from 'socket.io-client'

export default function MarketplaceOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [waiterCalls, setWaiterCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('online')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Check user role on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    
    if (!user) {
      toast.error('Iltimos, tizimga kiring')
      router.push('/login')
      return
    }
    
    setCurrentUser(user)
    
    if (user.role !== 'waiter' && user.role !== 'admin') {
      toast.error(`Bu sahifa faqat waiter va admin uchun. Sizning role: ${user.role}`, {
        duration: 5000
      })
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      return
    }
  }, [router])

  useEffect(() => {
    loadData()
    
    // Initialize Socket.IO
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
    const socketUrl = apiUrl.replace('/api', '')
    const newSocket = io(socketUrl)
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO')
      newSocket.emit('waiter:subscribe')
      newSocket.emit('marketplace:subscribe')
    })

    // Listen for marketplace orders (yangi event)
    newSocket.on('marketplace-order-created', (order) => {
      console.log('📦 New marketplace order:', order)
      toast.success('Yangi tashqi buyurtma!', {
        description: order.marketplaceName 
          ? `${order.marketplaceName} - ${order.customerName}` 
          : `${order.customerName}`,
      })
      loadData()
    })

    // Listen for order:new (umumiy)
    newSocket.on('order:new', (order) => {
      console.log('📦 New order:', order)
      if (order.orderType === 'marketplace') {
        toast.success('Yangi buyurtma!', {
          description: order.customerName,
        })
        loadData()
      }
    })

    // Listen for marketplace orders (eski event)
    newSocket.on('marketplace:order', (order) => {
      console.log('📦 Marketplace order (old):', order)
      loadData()
    })

    // Listen for order updates
    newSocket.on('order:status', (order) => {
      console.log('🔄 Order status updated:', order)
      loadData()
    })

    newSocket.on('marketplace:order-update', (order) => {
      console.log('🔄 Marketplace order updated:', order)
      loadData()
    })

    // Listen for waiter calls
    newSocket.on('waiter:call', (call) => {
      console.log('🔔 Waiter call:', call)
      toast.error(`Stol #${call.tableNumber} chaqirmoqda!`, {
        description: call.message,
        duration: 10000,
      })
      
      // Play notification sound (beep)
      playNotificationSound()
      
      loadData()
    })

    // Listen for call responses
    newSocket.on('waiter:call-responded', (call) => {
      console.log('✅ Call responded:', call)
      loadData()
    })

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      
      // Load marketplace orders from /api/orders with orderType filter
      const ordersRes = await fetch(`${apiUrl}/orders?orderType=marketplace&status=pending,confirmed,preparing,ready`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const ordersData = await ordersRes.json()
      console.log('📥 Loaded orders:', ordersData)
      
      // Extract orders from response
      const ordersList = ordersData.success ? ordersData.data : (Array.isArray(ordersData) ? ordersData : [])
      setOrders(ordersList)

      // Load waiter calls
      const callsRes = await fetch(`${apiUrl}/waiter-calls`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const callsData = await callsRes.json()
      setWaiterCalls(callsData.success ? callsData.data : [])
      
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      // Use /api/orders endpoint for status update
      const response = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' }),
      })

      if (response.ok) {
        toast.success('Buyurtma qabul qilindi')
        loadData()
      } else {
        toast.error('Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Accept order error:', error)
      toast.error('Xatolik yuz berdi')
    }
  }

  const handleSendToKitchen = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      
      console.log('🚀 Oshxonaga yuborish:', { 
        orderId, 
        hasToken: !!token,
        userRole: user?.role,
        userName: user?.fullName
      })
      
      // Check user role
      if (user && user.role !== 'waiter' && user.role !== 'admin') {
        toast.error(`Faqat waiter yoki admin oshxonaga yuborishi mumkin. Sizning role: ${user.role}`)
        console.error('❌ Noto\'g\'ri role:', user.role)
        return
      }
      
      const response = await fetch(`${apiUrl}/orders/${orderId}/send-to-kitchen`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('📥 Response status:', response.status)
      const data = await response.json()
      console.log('📥 Response data:', data)

      if (response.ok) {
        toast.success('Buyurtma oshxonaga yuborildi')
        loadData()
      } else {
        if (response.status === 403) {
          toast.error('Sizda bu amalni bajarish uchun ruxsat yo\'q. Waiter yoki Admin sifatida login qiling.')
        } else {
          toast.error(data.error || 'Xatolik yuz berdi')
        }
        console.error('❌ Server xatolik:', data)
      }
    } catch (error) {
      console.error('❌ Send to kitchen error:', error)
      toast.error('Xatolik yuz berdi')
    }
  }

  const handleSendToCashier = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      
      console.log('💰 Kassaga yuborish:', { 
        orderId, 
        hasToken: !!token,
        userRole: user?.role,
        userName: user?.fullName
      })
      
      // Check user role
      if (user && user.role !== 'waiter' && user.role !== 'admin') {
        toast.error(`Faqat waiter yoki admin kassaga yuborishi mumkin. Sizning role: ${user.role}`)
        console.error('❌ Noto\'g\'ri role:', user.role)
        return
      }
      
      const response = await fetch(`${apiUrl}/orders/${orderId}/send-to-cashier`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('📥 Response status:', response.status)
      const data = await response.json()
      console.log('📥 Response data:', data)

      if (response.ok) {
        toast.success('Buyurtma kassaga yuborildi')
        loadData()
      } else {
        if (response.status === 403) {
          toast.error('Sizda bu amalni bajarish uchun ruxsat yo\'q. Waiter yoki Admin sifatida login qiling.')
        } else if (response.status === 400) {
          toast.error(data.error || 'Faqat tayyor buyurtmalarni kassaga yuborish mumkin')
        } else {
          toast.error(data.error || 'Xatolik yuz berdi')
        }
        console.error('❌ Server xatolik:', data.error || data.message || 'Unknown error')
      }
    } catch (error: any) {
      console.error('❌ Send to cashier error:', error?.message || error)
      toast.error('Xatolik yuz berdi')
    }
  }

  const handleRespondToCall = async (callId: string) => {
    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      const response = await fetch(`${apiUrl}/waiter-calls/${callId}/respond`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success('Chaqiruvga javob berildi')
        loadData()
      } else {
        toast.error('Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Respond to call error:', error)
      toast.error('Xatolik yuz berdi')
    }
  }

  const onlineOrders = orders.filter(o => !o.table && !o.tableNumber)
  const tableOrders = orders.filter(o => o.table || o.tableNumber)
  const pendingCalls = waiterCalls.filter(c => c.status === 'pending')

  console.log('🔍 Debug info:', {
    totalOrders: orders.length,
    onlineOrders: onlineOrders.length,
    tableOrders: tableOrders.length,
    orders: orders.map(o => ({
      id: o._id,
      customer: o.customerName,
      platform: o.marketplaceName,
      table: o.table,
      tableNumber: o.tableNumber
    }))
  })

  // Notification sound function
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('Audio play failed:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Tizimdan chiqdingiz')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">Marketplace Buyurtmalar</h1>
            <p className="text-sm text-muted-foreground">
              {currentUser && (
                <span>
                  {currentUser.fullName} ({currentUser.role}) • Online va Stol buyurtmalari
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/waiter')}>
              Orqaga
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Chiqish
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="online">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Online ({onlineOrders.length})
            </TabsTrigger>
            <TabsTrigger value="table">
              <Home className="mr-2 h-4 w-4" />
              Stol ({tableOrders.length})
            </TabsTrigger>
            <TabsTrigger value="calls">
              <Bell className="mr-2 h-4 w-4" />
              Chaqiruvlar ({pendingCalls.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="online" className="space-y-4 mt-4">
            {onlineOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Online buyurtmalar yo'q
                </CardContent>
              </Card>
            ) : (
              onlineOrders.map((order) => (
                <Card key={order._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {order.customerName}
                      </CardTitle>
                      <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
                        {order.status === 'pending' && 'Yangi'}
                        {order.status === 'confirmed' && 'Qabul qilindi'}
                        {order.status === 'preparing' && 'Tayyorlanmoqda'}
                        {order.status === 'ready' && 'Tayyor'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customerPhone} • {order.marketplaceName || 'Online'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>
                            {item.menuItem?.name || item.menuItemName || item.name} x{item.quantity}
                          </span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Jami:</span>
                        <span>{formatCurrency(order.totalAmount || order.total)}</span>
                      </div>
                    </div>
                    {order.status === 'pending' && (
                      <Button 
                        className="w-full mt-4"
                        onClick={() => handleAcceptOrder(order._id)}
                      >
                        Qabul qilish
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button 
                        className="w-full mt-4"
                        onClick={() => handleSendToKitchen(order._id)}
                      >
                        Oshxonaga yuborish
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button 
                        className="w-full mt-4"
                        variant="default"
                        onClick={() => handleSendToCashier(order._id)}
                      >
                        💰 Kassaga yuborish
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="table" className="space-y-4 mt-4">
            {tableOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Stol buyurtmalari yo'q
                </CardContent>
              </Card>
            ) : (
              tableOrders.map((order) => (
                <Card key={order._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Stol #{order.tableNumber}
                      </CardTitle>
                      <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
                        {order.status === 'pending' && 'Yangi'}
                        {order.status === 'confirmed' && 'Qabul qilindi'}
                        {order.status === 'preparing' && 'Tayyorlanmoqda'}
                        {order.status === 'ready' && 'Tayyor'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName} • {order.customerPhone}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>
                            {item.menuItem?.name || item.menuItemName || item.name} x{item.quantity}
                          </span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Jami:</span>
                        <span>{formatCurrency(order.totalAmount || order.total)}</span>
                      </div>
                    </div>
                    {order.status === 'pending' && (
                      <Button 
                        className="w-full mt-4"
                        onClick={() => handleAcceptOrder(order._id)}
                      >
                        Qabul qilish
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button 
                        className="w-full mt-4"
                        onClick={() => handleSendToKitchen(order._id)}
                      >
                        Oshxonaga yuborish
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button 
                        className="w-full mt-4"
                        variant="default"
                        onClick={() => handleSendToCashier(order._id)}
                      >
                        💰 Kassaga yuborish
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="calls" className="space-y-4 mt-4">
            {pendingCalls.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Chaqiruvlar yo'q
                </CardContent>
              </Card>
            ) : (
              pendingCalls.map((call) => (
                <Card key={call._id} className="border-orange-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="h-5 w-5 text-orange-500 animate-pulse" />
                        Stol #{call.tableNumber}
                      </CardTitle>
                      <Badge variant="destructive">Chaqirildi</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(call.createdAt).toLocaleTimeString('uz-UZ')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{call.message}</p>
                    <Button 
                      className="w-full"
                      onClick={() => handleRespondToCall(call._id)}
                    >
                      Javob berish
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
