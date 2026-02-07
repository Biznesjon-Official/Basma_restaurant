'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Send, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { waiterAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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

    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      console.log('📥 Buyurtma yuklanmoqda:', orderId)
      
      // Avval orders collection dan to'g'ridan-to'g'ri olishga harakat qilamiz
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      
      const response = await fetch(`${apiUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Buyurtma topildi:', data.data)
        setOrder(data.data)
      } else {
        // Agar topilmasa, waiter buyurtmalaridan qidiramiz
        const waiterResponse = await waiterAPI.getMyOrders()
        const foundOrder = waiterResponse.data.find((o: any) => o._id === orderId)
        if (foundOrder) {
          console.log('✅ Waiter buyurtmasidan topildi:', foundOrder)
          setOrder(foundOrder)
        } else {
          console.log('❌ Buyurtma topilmadi')
          toast.error('Buyurtma topilmadi')
          router.push('/waiter/orders')
        }
      }
    } catch (error: any) {
      console.error('❌ Buyurtmani yuklashda xatolik:', error)
      toast.error('Buyurtmani yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptOrder = async () => {
    try {
      setSubmitting(true)
      console.log('✅ Buyurtma qabul qilinmoqda:', orderId)
      
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      
      const response = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'preparing' })
      })
      
      if (response.ok) {
        console.log('✅ Buyurtma qabul qilindi!')
        toast.success('Buyurtma qabul qilindi va tayyorlanmoqda!')
        loadOrder()
      } else {
        throw new Error('Buyurtmani qabul qilishda xatolik')
      }
    } catch (error: any) {
      console.error('❌ Xatolik:', error)
      toast.error(error.message || 'Xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitToKitchen = async () => {
    try {
      setSubmitting(true)
      console.log('📤 Oshxonaga yuborilmoqda:', orderId)
      
      // To'g'ridan-to'g'ri status o'zgartirish
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      
      const response = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'preparing' })
      })
      
      if (response.ok) {
        console.log('✅ Oshxonaga yuborildi!')
        toast.success('Buyurtma oshxonaga yuborildi!')
        loadOrder()
      } else {
        throw new Error('Buyurtmani yuborishda xatolik')
      }
    } catch (error: any) {
      console.error('❌ Xatolik:', error)
      toast.error(error.message || 'Xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkAsServed = async () => {
    try {
      setSubmitting(true)
      console.log('✅ Mijozga yetkazildi:', orderId)
      
      // To'g'ridan-to'g'ri status o'zgartirish
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      
      const response = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'served' })
      })
      
      if (response.ok) {
        console.log('✅ Kassirga yuborildi!')
        toast.success('Buyurtma yetkazildi! Kassirga yuborildi.')
        router.push('/waiter/orders')
      } else {
        throw new Error('Statusni o\'zgartirishda xatolik')
      }
    } catch (error: any) {
      console.error('❌ Xatolik:', error)
      toast.error(error.message || 'Xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Buyurtma topilmadi</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {order.orderType === 'marketplace' 
                ? `${order.marketplaceName || 'Tashqi'} - ${order.customerName || 'Buyurtma'}`
                : `Buyurtma #${order.tableNumber}`
              }
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleString('uz-UZ')}
            </p>
            {order.customerPhone && (
              <p className="text-sm text-muted-foreground">
                📱 {order.customerPhone}
              </p>
            )}
          </div>
          <Badge variant="outline">
            {order.status === 'pending' && 'Kutilmoqda'}
            {order.status === 'preparing' && 'Tayyorlanmoqda'}
            {order.status === 'ready' && 'Tayyor'}
            {order.status === 'served' && 'Berildi'}
            {order.status === 'completed' && 'To\'langan'}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 space-y-4">
        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Buyurtma tarkibi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item: any, index: number) => (
              <div key={index}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.menuItem?.name || item.menuItemName || item.name || 'Noma\'lum taom'}
                    </div>
                    {item.specialInstructions && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.specialInstructions}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {item.quantity} x {formatCurrency(item.price)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(item.quantity * item.price)}
                    </div>
                  </div>
                </div>
                {index < order.items.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}

            <Separator />

            <div className="flex items-center justify-between text-lg font-bold">
              <div>Jami:</div>
              <div className="text-primary">{formatCurrency(order.totalAmount || order.total || 0)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        {(order.specialInstructions || order.customerAddress) && (
          <Card>
            <CardHeader>
              <CardTitle>Qo'shimcha ma'lumot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.specialInstructions && (
                <div>
                  <div className="text-sm font-medium">Maxsus izoh:</div>
                  <p className="text-muted-foreground">{order.specialInstructions}</p>
                </div>
              )}
              {order.customerAddress && (
                <div>
                  <div className="text-sm font-medium">Manzil:</div>
                  <p className="text-muted-foreground">📍 {order.customerAddress}</p>
                </div>
              )}
              {order.deliveryType && (
                <div>
                  <div className="text-sm font-medium">Yetkazish turi:</div>
                  <p className="text-muted-foreground">
                    {order.deliveryType === 'delivery' ? '🚚 Yetkazish' : '📦 Olib ketish'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Harakatlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Yangi buyurtmani qabul qilish */}
            {(order.status === 'pending' || order.status === 'confirmed') && order.orderType === 'marketplace' && (
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleAcceptOrder}
                disabled={submitting}
              >
                ✅ Qabul qilish va tayyorlashni boshlash
              </Button>
            )}

            {order.status === 'pending' && order.orderType !== 'marketplace' && (
              <Button
                className="w-full"
                onClick={handleSubmitToKitchen}
                disabled={submitting}
              >
                <Send className="mr-2 size-4" />
                Oshxonaga yuborish
              </Button>
            )}

            {order.status === 'preparing' && (
              <div className="text-center py-4 text-muted-foreground">
                ⏳ Buyurtma tayyorlanmoqda...
              </div>
            )}

            {order.status === 'ready' && (
              <Button
                className="w-full"
                onClick={handleMarkAsServed}
                disabled={submitting}
              >
                <DollarSign className="mr-2 size-4" />
                Mijozga yetkazildi (Kassirga yuborish)
              </Button>
            )}

            {order.status === 'served' && (
              <div className="text-center py-4 text-muted-foreground">
                Buyurtma kassirda (to'lov kutilmoqda)
              </div>
            )}

            {order.status === 'completed' && (
              <div className="text-center py-4 text-muted-foreground">
                Buyurtma to'langan
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
