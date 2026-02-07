'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, AlertTriangle, TrendingUp, FileText, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { storekeeperAPI, inventoryAPI } from '@/lib/api'
import { toast } from 'sonner'
import { connectSocket, onLowStock, disconnectSocket } from '@/lib/socket'

export default function StorekeeperDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockCount: 0,
    todayReceived: 0,
    recipesCount: 0,
  })
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])

  useEffect(() => {
    // Check if user is storekeeper
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (parsedUser.role !== 'storekeeper' && parsedUser.role !== 'admin') {
        router.push('/')
        return
      }

      loadDashboard()
    } else {
      router.push('/login')
      return
    }

    // Connect socket for real-time low stock alerts
    const socket = connectSocket()
    console.log('🔌 Storekeeper Dashboard: Socket connecting...')

    const unsubscribeLowStock = onLowStock((item) => {
      console.log('📥 Storekeeper: Kam qolgan mahsulot', item)
      toast.warning(`⚠️ Kam qoldi: ${item.name}`, {
        duration: 10000,
        description: `Qoldiq: ${item.quantity} ${item.unit}`,
      })
      loadDashboard() // Refresh data
    })

    return () => {
      unsubscribeLowStock()
      disconnectSocket()
    }
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)

      // Load all data in parallel
      const [inventoryRes, lowStockRes, recipesRes, transactionsRes] = await Promise.all([
        inventoryAPI.getAll({ limit: 1000 }),
        storekeeperAPI.getLowStockItems(),
        storekeeperAPI.getRecipes(),
        storekeeperAPI.getTransactions({ limit: 10 }),
      ])

      // Calculate today's received items
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayReceived = transactionsRes.data.filter(
        (tx: any) => tx.type === 'receive' && new Date(tx.createdAt) >= today
      ).length

      setStats({
        totalItems: inventoryRes.data.length,
        lowStockCount: lowStockRes.data.length,
        todayReceived,
        recipesCount: recipesRes.data.length,
      })

      setLowStockItems(lowStockRes.data.slice(0, 5))
      setRecentTransactions(transactionsRes.data.slice(0, 5))
    } catch (error: any) {
      console.error('Dashboard yuklashda xatolik:', error)
      toast.error('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Ombor Boshqaruvi</h1>
        <p className="text-muted-foreground">
          Omborchi: {user?.fullName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami Mahsulotlar</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Ombordagi mahsulotlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kam Qolgan</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Minimal qoldiqdan kam</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugungi Kirim</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayReceived}</div>
            <p className="text-xs text-muted-foreground">Mahsulot qabul qilindi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Texnologik Kartalar</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recipesCount}</div>
            <p className="text-xs text-muted-foreground">Taomlar uchun</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tezkor Harakatlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" onClick={() => router.push('/storekeeper/receive')}>
              <Package className="mr-2 h-4 w-4" />
              Mahsulot Qabul Qilish
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/storekeeper/recipes')}>
              <FileText className="mr-2 h-4 w-4" />
              Texnologik Kartalar
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/storekeeper/audit')}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Inventarizatsiya
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Kam Qolgan Mahsulotlar</span>
              {stats.lowStockCount > 0 && (
                <Badge variant="destructive">{stats.lowStockCount}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Yuklanmoqda...
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Kam qolgan mahsulot yo'q
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item: any) => (
                  <div key={item._id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Min: {item.minQuantity} {item.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-600">
                        {item.quantity} {item.unit}
                      </div>
                      <div className="text-xs text-amber-600">
                        {((item.quantity / item.minQuantity) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
                {stats.lowStockCount > 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push('/inventory')}
                  >
                    Barchasini ko'rish ({stats.lowStockCount})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              So'nggi Harakatlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Yuklanmoqda...
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Harakatlar yo'q
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx: any) => (
                  <div key={tx._id} className="flex items-start gap-3 p-2 rounded-lg border">
                    <div className={`p-1.5 rounded ${
                      tx.type === 'receive' ? 'bg-green-100' :
                      tx.type === 'write-off' ? 'bg-red-100' :
                      tx.type === 'audit' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {tx.type === 'receive' && <TrendingUp className="h-3 w-3 text-green-600" />}
                      {tx.type === 'write-off' && <Package className="h-3 w-3 text-red-600" />}
                      {tx.type === 'audit' && <FileText className="h-3 w-3 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {tx.inventoryItem?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tx.type === 'receive' && 'Qabul qilindi'}
                        {tx.type === 'write-off' && 'Chiqim'}
                        {tx.type === 'audit' && 'Inventarizatsiya'}
                        {' • '}
                        {new Date(tx.createdAt).toLocaleDateString('uz-UZ')}
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      tx.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.quantity > 0 ? '+' : ''}{tx.quantity} {tx.unit}
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push('/storekeeper/reports')}
                >
                  Barcha hisobotlar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Package className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Omborchi Paneli</h3>
              <p className="text-sm text-blue-700 mt-1">
                Bu yerda siz ombor mahsulotlarini boshqarishingiz, texnologik kartalarni yaratishingiz,
                mahsulot qabul qilishingiz va inventarizatsiya o'tkazishingiz mumkin.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="bg-white">Mahsulot Qabul</Badge>
                <Badge variant="outline" className="bg-white">Texnologik Kartalar</Badge>
                <Badge variant="outline" className="bg-white">Inventarizatsiya</Badge>
                <Badge variant="outline" className="bg-white">Hisobotlar</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
