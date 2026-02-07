'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Minus, ShoppingCart, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { waiterAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/mock-data'
import { toast } from 'sonner'

function NewOrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableId = searchParams.get('tableId')

  const [user, setUser] = useState<any>(null)
  const [menu, setMenu] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [specialInstructions, setSpecialInstructions] = useState('')
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

    if (!tableId) {
      router.push('/waiter/tables')
      return
    }

    loadMenu()
  }, [])

  const loadMenu = async () => {
    try {
      setLoading(true)
      const response = await waiterAPI.getMenu()
      setMenu(response.data)
    } catch (error: any) {
      console.error('Menyuni yuklashda xatolik:', error)
      toast.error('Menyuni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const categories = [...new Set(menu.map((item) => item.category))]

  const addToCart = (item: any) => {
    const existing = cart.find((c) => c.menuItem === item._id)
    if (existing) {
      setCart(
        cart.map((c) =>
          c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c
        )
      )
    } else {
      setCart([...cart, { menuItem: item._id, quantity: 1, price: item.price, name: item.name }])
    }
  }

  const removeFromCart = (itemId: string) => {
    const existing = cart.find((c) => c.menuItem === itemId)
    if (existing && existing.quantity > 1) {
      setCart(
        cart.map((c) =>
          c.menuItem === itemId ? { ...c, quantity: c.quantity - 1 } : c
        )
      )
    } else {
      setCart(cart.filter((c) => c.menuItem !== itemId))
    }
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error('Kamida bitta taom tanlang')
      return
    }

    try {
      setSubmitting(true)
      await waiterAPI.createOrder({
        tableId,
        items: cart.map((c) => ({
          menuItem: c.menuItem,
          quantity: c.quantity,
        })),
        specialInstructions,
      })

      toast.success('Buyurtma yaratildi!')
      router.push('/waiter')
    } catch (error: any) {
      console.error('Buyurtma yaratishda xatolik:', error)
      toast.error(error.message || 'Buyurtma yaratishda xatolik')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Yangi buyurtma</h1>
            <p className="text-sm text-muted-foreground">Taomlarni tanlang</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Yuklanmoqda...</div>
          </div>
        ) : (
          <Tabs defaultValue={categories[0]} className="space-y-4">
            <TabsList className="w-full justify-start overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {menu
                    .filter((item) => item.category === category)
                    .map((item) => {
                      const inCart = cart.find((c) => c.menuItem === item._id)
                      return (
                        <Card key={item._id} className="overflow-hidden">
                          {item.image && (
                            <div className="relative h-40 w-full overflow-hidden bg-muted">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          {!item.image && (
                            <div className="flex h-40 w-full items-center justify-center bg-muted">
                              <ImageIcon className="size-12 text-muted-foreground" />
                            </div>
                          )}
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base">{item.name}</CardTitle>
                                <div className="text-lg font-bold text-primary mt-1">
                                  {formatCurrency(item.price)}
                                </div>
                              </div>
                              {item.available ? (
                                <Badge variant="outline">Mavjud</Badge>
                              ) : (
                                <Badge variant="destructive">Tugagan</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            {inCart ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeFromCart(item._id)}
                                >
                                  <Minus className="size-4" />
                                </Button>
                                <span className="flex-1 text-center font-bold">
                                  {inCart.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addToCart(item)}
                                >
                                  <Plus className="size-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                className="w-full"
                                size="sm"
                                onClick={() => addToCart(item)}
                                disabled={!item.available}
                              >
                                <Plus className="mr-2 size-4" />
                                Qo'shish
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-card p-4 shadow-lg">
          <div className="container mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Jami</div>
                <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
              </div>
              <Button size="lg" onClick={handleSubmit} disabled={submitting}>
                <ShoppingCart className="mr-2 size-5" />
                {submitting ? 'Yuklanmoqda...' : 'Buyurtma berish'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <NewOrderContent />
    </Suspense>
  )
}
