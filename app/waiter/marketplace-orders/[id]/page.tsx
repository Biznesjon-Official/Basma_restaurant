'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Phone, MapPin, Package, Truck, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function MarketplaceOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [params.id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      
      console.log('🔍 Loading order:', params.id)
      
      // Try marketplace-orders first
      let response = await fetch(`${apiUrl}/marketplace-orders/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      console.log('📦 Marketplace response:', response.status)
      
      // If not found, try orders collection
      if (!response.ok && response.status === 404) {
        console.log('🔄 Trying orders collection...')
        response = await fetch(`${apiUrl}/orders/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        console.log('📦 Orders response:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          const orderData = result.data || result
          
          console.log('📦 Order data:', orderData)
          
          // Mark as from orders collection and normalize data
          const normalizedOrder = {
            ...orderData,
            isFromOrdersCollection: true,
            marketplaceOrderId: orderData.marketplaceOrderId || orderData._id,
            marketplaceName: orderData.marketplaceName || 'Tashqi Sayt',
            customerName: orderData.customerName || 'Web Mijoz',
            customerPhone: orderData.customerPhone || '+998000000000',
            customerAddress: orderData.customerAddress || '',
            deliveryType: orderData.deliveryType || 'delivery',
            deliveryFee: orderData.deliveryFee || 0,
            paymentType: orderData.paymentType || 'cash',
            paymentStatus: orderData.paymentStatus || 'pending',
            items: (orderData.items || []).map((item: any) => ({
              ...item,
              menuItemName: item.menuItemName || item.name || 'N/A',
              price: item.price || 0,
              quantity: item.quantity || 1
            }))
          }
          
          console.log('✅ Normalized order:', normalizedOrder)
          setOrder(normalizedOrder)
          return
        }
      }
      
      if (!response.ok) throw new Error('Buyurtma topilmadi')
      
      const data = await response.json()
      setOrder(data)
    } catch (error: any) {
      console.error('❌ Load order error:', error)
      toast.error(error.message)
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    try {
      setAccepting(true)
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      
      // Check if order is from orders collection
      const endpoint = (order as any)?.isFromOrdersCollection 
        ? `${apiUrl}/orders/${params.id}/status`
        : `${apiUrl}/marketplace-orders/${params.id}/accept`
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify((order as any)?.isFromOrdersCollection ? { status: 'accepted' } : {}),
      })
      
      if (!response.ok) throw new Error('Xatolik yuz berdi')
      
      toast.success('Buyurtma qabul qilindi!')
      loadOrder()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setAccepting(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Buyurtmani bekor qilmoqchimisiz?')) return
    
    try {
      setCancelling(true)
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      
      // Check if order is from orders collection
      const endpoint = (order as any)?.isFromOrdersCollection 
        ? `${apiUrl}/orders/${params.id}/status`
        : `${apiUrl}/marketplace-orders/${params.id}/cancel`
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify((order as any)?.isFromOrdersCollection 
          ? { status: 'cancelled' } 
          : { cancelReason: 'Ofitsiant tomonidan bekor qilindi' }
        ),
      })
      
      if (!response.ok) throw new Error('Xatolik yuz berdi')
      
      toast.success('Buyurtma bekor qilindi')
      router.back()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Marketplace Buyurtma</h1>
            <p className="text-sm text-muted-foreground">
              {order.marketplaceName} • {order.marketplaceOrderId}
            </p>
          </div>
          <Badge variant={order.status === 'new' ? 'default' : 'outline'}>
            {order.status === 'new' ? '🆕 Yangi' : order.status}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 space-y-4">
        {/* Mijoz ma'lumotlari */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="size-5" />
              Mijoz ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Ism</div>
              <div className="font-medium">{order.customerName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Telefon</div>
              <div className="font-medium">
                <a href={`tel:${order.customerPhone}`} className="text-primary hover:underline">
                  {order.customerPhone}
                </a>
              </div>
            </div>
            {order.customerAddress && (
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-4" />
                  Manzil
                </div>
                <div className="font-medium">{order.customerAddress}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                {order.deliveryType === 'delivery' ? <Truck className="size-4" /> : <Package className="size-4" />}
                Yetkazish turi
              </div>
              <div className="font-medium">
                {order.deliveryType === 'delivery' ? '🚚 Yetkazish' : '📦 Olib ketish'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buyurtma tarkibi */}
        <Card>
          <CardHeader>
            <CardTitle>Buyurtma tarkibi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-start justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <div className="font-medium">{item.menuItemName}</div>
                    {item.specialInstructions && (
                      <div className="text-sm text-muted-foreground mt-1">
                        💬 {item.specialInstructions}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-medium">{item.quantity} x {formatCurrency(item.price)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(item.quantity * item.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Jami */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taomlar:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Yetkazish:</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Jami:</span>
                <span className="text-primary">
                  {formatCurrency(order.totalAmount + (order.deliveryFee || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* To'lov ma'lumotlari */}
        <Card>
          <CardHeader>
            <CardTitle>To'lov</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">To'lov turi:</span>
                <span className="font-medium">
                  {order.paymentType === 'cash' && '💵 Naqd'}
                  {order.paymentType === 'card' && '💳 Karta'}
                  {order.paymentType === 'online' && '🌐 Online'}
                  {order.paymentType === 'prepaid' && '✅ Oldindan to\'langan'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                  {order.paymentStatus === 'paid' ? 'To\'langan' : 'Kutilmoqda'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Qo'shimcha ma'lumot */}
        {order.specialInstructions && (
          <Card>
            <CardHeader>
              <CardTitle>Qo'shimcha izoh</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{order.specialInstructions}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {order.status === 'new' && (
          <div className="flex gap-3 sticky bottom-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={cancelling}
            >
              <XCircle className="size-4 mr-2" />
              {cancelling ? 'Bekor qilinmoqda...' : 'Bekor qilish'}
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={accepting}
            >
              <CheckCircle className="size-4 mr-2" />
              {accepting ? 'Qabul qilinmoqda...' : 'Qabul qilish'}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
