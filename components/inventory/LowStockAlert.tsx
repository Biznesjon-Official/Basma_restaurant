'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { connectSocket, disconnectSocket } from '@/lib/socket'

export function LowStockAlert() {
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const socket = connectSocket()

    // Listen for low stock alerts
    socket.on('inventory:low-stock', (data: any) => {
      console.log('⚠️  Kam qolgan mahsulotlar:', data)
      setLowStockItems(data.items || [])
      setIsVisible(true)
    })

    // Load initial low stock items
    loadLowStockItems()

    return () => {
      socket.off('inventory:low-stock')
      disconnectSocket()
    }
  }, [])

  const loadLowStockItems = async () => {
    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      
      const response = await fetch(`${apiUrl}/inventory?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const data = await response.json()
      const lowStock = (data.data || []).filter(
        (item: any) => item.quantity <= item.minQuantity
      )
      
      if (lowStock.length > 0) {
        setLowStockItems(lowStock)
        setIsVisible(true)
      }
    } catch (error) {
      console.error('Kam qolgan mahsulotlarni yuklashda xatolik:', error)
    }
  }

  if (!isVisible || lowStockItems.length === 0) return null

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertTriangle className="size-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">
                Kam qolgan mahsulotlar
              </h3>
              <div className="mt-2 space-y-1">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item._id} className="text-sm text-amber-800">
                    • {item.name}: <Badge variant="outline" className="ml-1">
                      {item.quantity}{item.unit}
                    </Badge> (min: {item.minQuantity}{item.unit})
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <div className="text-sm text-amber-700">
                    +{lowStockItems.length - 5} ta yana...
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
