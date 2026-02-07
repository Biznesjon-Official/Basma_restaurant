'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ShoppingCart, Plus, Minus, Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/mock-data'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface MenuItem {
  _id: string
  name: string
  nameUz: string
  price: number
  category: string
  image?: string
  description?: string
  available: boolean
}

interface Table {
  _id: string
  number: number
  capacity: number
  status: string
}

interface CartItem extends MenuItem {
  quantity: number
}

export default function TableOrderPage() {
  const params = useParams()
  const router = useRouter()
  const qrCode = params.qrCode as string

  const [table, setTable] = useState<Table | null>(null)
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  useEffect(() => {
    loadTableAndMenu()
  }, [qrCode])

  const loadTableAndMenu = async () => {
    try {
      setLoading(true)

      // Load table info
      const tableRes = await fetch(`${API_URL}/tables/qr/${qrCode}`)
      const tableData = await tableRes.json()

      if (!tableData.success) {
        alert('Stol topilmadi')
        return
      }

      setTable(tableData.data)

      // Load menu
      const menuRes = await fetch(`${API_URL}/menu/public?available=true`)
      const menuData = await menuRes.json()

      if (menuData.success) {
        setMenu(menuData.data.items || menuData.data)
      }
    } catch (error) {
      console.error('Xatolik:', error)
      alert('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id)
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === itemId)
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        )
      }
      return prev.filter((i) => i._id !== itemId)
    })
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert('Savat bo\'sh')
      return
    }

    if (!customerName.trim()) {
      alert('Ismingizni kiriting')
      return
    }

    try {
      setSubmitting(true)

      const orderData = {
        tableId: table?._id,
        tableNumber: table?.number,
        items: cart.map((item) => ({
          menuItem: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        orderType: 'dine-in',
        status: 'pending',
      }

      const response = await fetch(`${API_URL}/orders/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (data.success) {
        setShowCart(false)
        setShowSuccess(true)
        setCart([])
        setCustomerName('')
        setCustomerPhone('')
      } else {
        alert(data.error || 'Buyurtma berishda xatolik')
      }
    } catch (error) {
      console.error('Buyurtma berish xatolik:', error)
      alert('Buyurtma berishda xatolik')
    } finally {
      setSubmitting(false)
    }
  }

  const categories = Array.from(new Set(menu.map((item) => item.category)))

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!table) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg">Stol topilmadi</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold">Stol #{table.number}</h1>
            <p className="text-sm text-muted-foreground">{table.capacity} kishilik</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="relative"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="mr-1 size-4" />
            Savat
            {cart.length > 0 && (
              <Badge className="ml-2 size-5 rounded-full p-0 text-xs">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Menu */}
      <div className="container mx-auto p-4">
        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {menu
                .filter((item) => item.category === category)
                .map((item) => (
                  <Card key={item._id} className="overflow-hidden">
                    {item.image && (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={item.image}
                          alt={item.nameUz || item.name}
                          className="size-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-medium">{item.nameUz || item.name}</h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold">
                          {formatCurrency(item.price)}
                        </span>
                        <Button size="sm" onClick={() => addToCart(item)}>
                          <Plus className="mr-1 size-3" />
                          Qo'shish
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Savat</DialogTitle>
            <DialogDescription>
              Buyurtmangizni tekshiring va tasdiqlang
            </DialogDescription>
          </DialogHeader>

          {cart.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Savat bo'sh
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.nameUz || item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => removeFromCart(item._id)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => addToCart(item)}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <div className="font-bold">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}

              <div className="space-y-3 border-t pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Ismingiz *</Label>
                  <Input
                    id="name"
                    placeholder="Ismingizni kiriting"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefon raqam (ixtiyoriy)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-4 text-lg font-bold">
                <span>Jami:</span>
                <span>{formatCurrency(getTotalPrice())}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCart(false)}>
              Yopish
            </Button>
            {cart.length > 0 && (
              <Button onClick={handleSubmitOrder} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Yuborilmoqda...
                  </>
                ) : (
                  'Buyurtma berish'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="size-8 text-green-600" />
            </div>
            <DialogTitle className="text-center">Buyurtma qabul qilindi!</DialogTitle>
            <DialogDescription className="text-center">
              Buyurtmangiz oshxonaga yuborildi. Tez orada tayyorlanadi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccess(false)} className="w-full">
              Yaxshi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
