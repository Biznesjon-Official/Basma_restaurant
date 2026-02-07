'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { waiterAPI } from '@/lib/api'

export default function WaiterTablesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tables, setTables] = useState<any[]>([])
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

    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      setLoading(true)
      const response = await waiterAPI.getMyTables()
      setTables(response.data)
    } catch (error: any) {
      console.error('Stollarni yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const myTables = tables.filter(
    (t) => t.currentWaiter?._id === user?.id || t.currentWaiter === user?.id
  )
  const availableTables = tables.filter((t) => t.status === 'available')

  const handleTableClick = (table: any) => {
    // If table is available or mine, create new order
    if (table.status === 'available' || table.currentWaiter === user?.id) {
      router.push(`/waiter/new-order?tableId=${table._id}`)
    }
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
            <h1 className="text-xl font-bold">Stollarni tanlash</h1>
            <p className="text-sm text-muted-foreground">
              Yangi buyurtma uchun stol tanlang
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Yuklanmoqda...</div>
          </div>
        ) : (
          <>
            {/* My Tables */}
            {myTables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Mening stollarim</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {myTables.map((table) => (
                      <button
                        key={table._id}
                        onClick={() => handleTableClick(table)}
                        className="relative aspect-square rounded-lg border-2 border-primary bg-primary/5 p-4 hover:bg-primary/10 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="text-3xl font-bold text-primary">
                            {table.number}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {table.capacity} kishi
                          </div>
                          <Badge variant="default" className="mt-2">
                            Band
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Tables */}
            <Card>
              <CardHeader>
                <CardTitle>Bo'sh stollar</CardTitle>
              </CardHeader>
              <CardContent>
                {availableTables.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Hozircha bo'sh stollar yo'q
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {availableTables.map((table) => (
                      <button
                        key={table._id}
                        onClick={() => handleTableClick(table)}
                        className="relative aspect-square rounded-lg border-2 border-border bg-card p-4 hover:border-primary hover:bg-accent transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="text-3xl font-bold">{table.number}</div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {table.capacity} kishi
                          </div>
                          <Badge variant="outline" className="mt-2">
                            Bo'sh
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
