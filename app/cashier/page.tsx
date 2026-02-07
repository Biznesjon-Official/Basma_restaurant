'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, CheckCircle, Clock, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ordersAPI, cashierAPI } from '@/lib/api'
import { toast } from 'sonner'

export default function CashierPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingOrder, setProcessingOrder] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (parsedUser.role !== 'cashier' && parsedUser.role !== 'admin') {
        router.push('/')
        return
      }

      loadOrders()
    } else {
      router.push('/login')
      return
    }
  }, [router])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await cashierAPI.getOrdersForPayment({ limit: 100 })
      setOrders(response.data)
    } catch (error: any) {
      console.error('Buyurtmalarni yuklashda xatolik:', error)
      toast.error('Buyurtmalarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (orderId: string, paymentType: string) => {
    try {
      setProcessingOrder(orderId)
      await cashierAPI.processPayment(orderId, paymentType as 'cash' | 'card' | 'online')
      toast.success('To\'lov muvaffaqiyatli qabul qilindi!')
      loadOrders()
    } catch (error: any) {
      toast.error(error.message || 'Xatolik yuz berdi')
    } finally {
      setProcessingOrder(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: any = {
      served: { label: 'Yetkazildi', color: 'bg-blue-500' },
      paid: { label: 'To\'landi', color: 'bg-green-500' },
    }
    const { label, color } = config[status] || { label: status, color: 'bg-gray-500' }
    return <Badge className={color}>{label}</Badge>
  }

  const todayOrders = orders.filter(
    (order) =>
      new Date(order.createdAt).toDateString() === new Date().toDateString()
  )
  const todayRevenue = todayOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0)
  const pendingPayments = orders.filter((o) => o.status === 'served').length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Kassir Paneli</h1>
        <p className="text-muted-foreground">
          Kassir: {user?.fullName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugungi Tushum</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayRevenue.toLocaleString()} so'm
            </div>
            <p className="text-xs text-muted-foreground">
              {todayOrders.filter((o) => o.paymentStatus === 'paid').length} ta to'lov
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kutilayotgan To'lovlar</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">To'lov kutilmoqda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugungi Buyurtmalar</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.length}</div>
            <p className="text-xs text-muted-foreground">Jami buyurtmalar</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>To'lov Kutilayotgan Buyurtmalar</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">To'lov kutilayotgan buyurtmalar yo'q</h3>
              <p className="text-muted-foreground">
                Barcha buyurtmalar to'langan
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stol</TableHead>
                  <TableHead>Mahsulotlar</TableHead>
                  <TableHead>Ofitsiant</TableHead>
                  <TableHead>Summa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      {order.tableNumber 
                        ? `Stol #${order.tableNumber}` 
                        : order.customerName || order.marketplaceName || 'Buyurtma'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items?.slice(0, 2).map((item: any, idx: number) => {
                          const itemName = item.menuItem?.name || item.menuItemName || item.name || 'N/A'
                          return (
                            <div key={idx}>
                              {item.quantity}x {itemName}
                            </div>
                          )
                        })}
                        {order.items?.length > 2 && (
                          <div className="text-muted-foreground">
                            +{order.items.length - 2} ta mahsulot
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{order.waiter?.fullName || order.customerName || 'N/A'}</TableCell>
                    <TableCell className="font-semibold">
                      {(order.totalAmount || order.total || 0).toLocaleString()} so'm
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      {order.status === 'served' && (
                        <div className="flex justify-end gap-2">
                          <Select
                            onValueChange={(value) => handlePayment(order._id, value)}
                            disabled={processingOrder === order._id}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="To'lov turi" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Naqd</SelectItem>
                              <SelectItem value="card">Karta</SelectItem>
                              <SelectItem value="online">Online</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {order.paymentStatus === 'paid' && (
                        <Badge variant="outline" className="bg-green-50">
                          {order.paymentMethod === 'cash' && 'Naqd'}
                          {order.paymentMethod === 'card' && 'Karta'}
                          {order.paymentMethod === 'online' && 'Online'}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
