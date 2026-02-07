'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, ChefHat, CheckCircle, AlertTriangle, Star, Zap, Archive, BarChart3, Maximize2 } from 'lucide-react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { chefAPI } from '@/lib/api'
import { connectSocket, onNewOrder, onOrderStatusUpdate, disconnectSocket } from '@/lib/socket'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function KitchenPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [archivedOrders, setArchivedOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Check auth
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== 'chef' && user.role !== 'admin') {
      toast.error('Bu sahifa faqat chef va admin uchun')
      router.push('/login')
      return
    }

    // Load orders
    loadOrders()

    // Connect socket
    const socket = connectSocket()
    console.log('🔌 Kitchen: Socket connecting...')

    // Subscribe to kitchen events
    socket.emit('kitchen:subscribe')

    // Listen for new orders (general)
    const unsubscribeNew = onNewOrder((order) => {
      console.log('📥 Kitchen: Yangi buyurtma keldi!', order)
      toast.success(`Yangi buyurtma: Stol ${order.table?.number || 'N/A'}`)
      loadOrders()
    })

    // Listen for kitchen-specific new orders
    socket.on('kitchen:new-order', (order) => {
      console.log('👨‍🍳 Kitchen: Oshxonaga yangi buyurtma!', order)
      toast.success('Oshxonaga yangi buyurtma yuborildi!', {
        description: order.customerName || `Stol ${order.tableNumber || 'N/A'}`,
        duration: 5000
      })
      loadOrders()
    })

    // Listen for status updates
    const unsubscribeStatus = onOrderStatusUpdate((order) => {
      console.log('📥 Kitchen: Buyurtma yangilandi', order)
      loadOrders()
    })

    return () => {
      unsubscribeNew()
      unsubscribeStatus()
      socket.off('kitchen:new-order')
      disconnectSocket()
    }
  }, [router])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await chefAPI.getKitchenOrders()
      setOrders(response.data)
      
      // Load archived orders from localStorage
      const archived = localStorage.getItem('archivedOrders')
      if (archived) {
        setArchivedOrders(JSON.parse(archived))
      }
    } catch (error: any) {
      // Silent error for 403 (expected for non-chef users)
      if (error.status !== 403) {
        console.error('Buyurtmalarni yuklashda xatolik:', error)
        toast.error('Buyurtmalarni yuklashda xatolik')
      } else {
        // 403 - redirect to login
        toast.error('Sizda bu sahifaga kirish huquqi yo\'q')
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMarkReady = async (orderId: string) => {
    try {
      await chefAPI.updateOrderStatus(orderId, 'ready')
      toast.success('Buyurtma tayyor deb belgilandi')
      
      // Archive the order
      const order = orders.find(o => o._id === orderId)
      if (order) {
        const archived = [...archivedOrders, { ...order, archivedAt: new Date() }]
        setArchivedOrders(archived)
        localStorage.setItem('archivedOrders', JSON.stringify(archived))
      }
      
      loadOrders()
    } catch (error: any) {
      toast.error(error.message || 'Xatolik yuz berdi')
    }
  }

  const restoreOrder = (order: any) => {
    const updated = archivedOrders.filter(o => o._id !== order._id)
    setArchivedOrders(updated)
    localStorage.setItem('archivedOrders', JSON.stringify(updated))
    toast.success('Buyurtma qaytarildi')
  }

  const getTimeDiff = (date: string) => {
    const orderDate = new Date(date)
    const diff = Math.floor((currentTime.getTime() - orderDate.getTime()) / 1000) // seconds
    return diff
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getNormativeTime = (items: any[]) => {
    // Get max preparation time from items
    let maxTime = 5 // default 5 minutes
    items?.forEach((item: any) => {
      if (item.menuItem?.preparationTime && item.menuItem.preparationTime > maxTime) {
        maxTime = item.menuItem.preparationTime
      }
    })
    return maxTime * 60 // convert to seconds
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'vip':
        return <Star className="size-5 text-yellow-500 fill-yellow-500" />
      case 'urgent':
        return <Zap className="size-5 text-orange-500" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'vip':
        return 'border-yellow-400 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-950/50'
      case 'urgent':
        return 'border-orange-400 bg-orange-50 dark:border-orange-600 dark:bg-orange-950/50'
      default:
        return 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50'
    }
  }

  // Sort orders by priority and time
  const sortedOrders = [...orders].sort((a, b) => {
    // Priority first
    const priorityOrder = { vip: 0, urgent: 1, normal: 2 }
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 2
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 2
    
    if (aPriority !== bPriority) return aPriority - bPriority
    
    // Then by time (FIFO)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  const preparingOrders = sortedOrders.filter((o) => o.status === 'preparing')
  const readyOrders = sortedOrders.filter((o) => o.status === 'ready')

  // Calculate statistics
  const avgPreparationTime = archivedOrders.length > 0
    ? Math.round(
        archivedOrders.reduce((sum, order) => {
          const time = Math.floor(getTimeDiff(order.createdAt) / 60) // convert to minutes
          return sum + time
        }, 0) / archivedOrders.length
      )
    : 0

  const delayedOrders = archivedOrders.filter(order => {
    const time = getTimeDiff(order.createdAt)
    const normative = getNormativeTime(order.items)
    return time > normative
  }).length

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const content = (
    <main className={`flex-1 overflow-auto bg-muted/30 ${isFullscreen ? 'p-6' : 'p-4 md:p-6'}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Oshxona (KDS)</h1>
            <p className="text-muted-foreground">
              Kitchen Display System - Real-time yangilanadi 🔄
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowStats(true)}>
              <BarChart3 className="mr-2 size-4" />
              Statistika
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowArchive(true)}>
              <Archive className="mr-2 size-4" />
              Arxiv ({archivedOrders.length})
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <Maximize2 className="size-4" />
            </Button>
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-600 border-blue-200 px-3 py-1"
            >
              <ChefHat className="mr-1 size-4" />
              {preparingOrders.length}
            </Badge>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-200 px-3 py-1"
            >
              <CheckCircle className="mr-1 size-4" />
              {readyOrders.length}
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Tayyorlanmoqda */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <ChefHat className="size-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold">Tayyorlanmoqda</h2>
                <Badge variant="secondary">{preparingOrders.length}</Badge>
              </div>
              <div className="space-y-3">
                {preparingOrders.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle className="size-10 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Tayyorlanayotgan buyurtma yo&apos;q
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  preparingOrders.map((order) => {
                    const timeDiff = getTimeDiff(order.createdAt)
                    const normativeTime = getNormativeTime(order.items)
                    const isDelayed = timeDiff > normativeTime
                    const priorityColor = isDelayed 
                      ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/50'
                      : getPriorityColor(order.priority || 'normal')
                    
                    return (
                      <Card
                        key={order._id}
                        className={`border-2 ${priorityColor}`}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-bold">
                                  {order.table?.number 
                                    ? `Stol ${order.table.number}` 
                                    : order.customerName || order.marketplaceName || 'Buyurtma'
                                  }
                                </h3>
                                {getPriorityIcon(order.priority)}
                                {isDelayed && (
                                  <AlertTriangle className="size-5 text-red-600" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {order.waiter?.fullName 
                                  ? `Ofitsiant: ${order.waiter.fullName}`
                                  : order.orderType === 'marketplace' 
                                    ? `📱 ${order.customerPhone || 'Telefon yo\'q'}`
                                    : 'Ofitsiant yo\'q'
                                }
                              </p>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-3xl font-bold tabular-nums ${
                                  isDelayed ? 'text-red-600' : 'text-blue-600'
                                }`}
                              >
                                {formatTime(timeDiff)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Normativ: {Math.floor(normativeTime / 60)} min
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleTimeString('uz-UZ', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {order.items?.map((item: any, idx: number) => {
                              const itemName = item.menuItem?.name || item.menuItemName || item.name || 'Noma\'lum mahsulot'
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 bg-background/50 rounded"
                                >
                                  <span className="text-lg font-semibold">
                                    {item.quantity}x {itemName}
                                  </span>
                                  {item.specialInstructions && (
                                    <span className="text-xs text-muted-foreground italic">
                                      {item.specialInstructions}
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          {order.specialInstructions && (
                            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded border border-amber-200">
                              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                ⚠️ {order.specialInstructions}
                              </p>
                            </div>
                          )}

                          <Button
                            className="w-full"
                            size="lg"
                            onClick={() => handleMarkReady(order._id)}
                          >
                            <CheckCircle className="mr-2 size-5" />
                            Tayyor
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </div>

            {/* Tayyor */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CheckCircle className="size-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold">Tayyor</h2>
                <Badge variant="secondary">{readyOrders.length}</Badge>
              </div>
              <div className="space-y-3">
                {readyOrders.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                      <Clock className="size-10 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Tayyor buyurtma yo&apos;q
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  readyOrders.map((order) => (
                    <Card
                      key={order._id}
                      className="border-2 border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-2xl font-bold">
                                {order.table?.number 
                                  ? `Stol ${order.table.number}` 
                                  : order.customerName || order.marketplaceName || 'Buyurtma'
                                }
                              </h3>
                              {getPriorityIcon(order.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.waiter?.fullName 
                                ? `Ofitsiant: ${order.waiter.fullName}`
                                : order.orderType === 'marketplace' 
                                  ? `📱 ${order.customerPhone || 'Telefon yo\'q'}`
                                  : 'Ofitsiant yo\'q'
                              }
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-emerald-500/10">
                            <CheckCircle className="mr-1 size-3" />
                            Tayyor
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {order.items?.map((item: any, idx: number) => {
                            const itemName = item.menuItem?.name || item.menuItemName || item.name || 'Noma\'lum mahsulot'
                            return (
                              <div key={idx} className="text-base font-medium">
                                {item.quantity}x {itemName}
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Archive Dialog */}
      <Dialog open={showArchive} onOpenChange={setShowArchive}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Arxiv Buyurtmalar</DialogTitle>
            <DialogDescription>
              Tayyor deb belgilangan buyurtmalar ({archivedOrders.length})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {archivedOrders.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Arxiv bo&apos;sh</p>
            ) : (
              archivedOrders.slice().reverse().map((order) => (
                <Card key={order._id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {order.table?.number 
                            ? `Stol ${order.table.number}` 
                            : order.customerName || order.marketplaceName || 'Buyurtma'
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.archivedAt).toLocaleString('uz-UZ')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreOrder(order)}
                      >
                        Qaytarish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Statistics Dialog */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Oshxona Statistikasi</DialogTitle>
            <DialogDescription>
              Bugungi ko&apos;rsatkichlar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">O&apos;rtacha tayyorlash vaqti</p>
                <p className="text-2xl font-bold">{avgPreparationTime} daqiqa</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Jami buyurtmalar</p>
                <p className="text-2xl font-bold">{archivedOrders.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Kechikkan buyurtmalar</p>
                <p className="text-2xl font-bold text-red-600">{delayedOrders}</p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )

  if (isFullscreen) {
    return content
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        {content}
      </SidebarInset>
    </SidebarProvider>
  )
}
