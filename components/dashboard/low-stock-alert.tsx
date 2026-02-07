'use client'

import { AlertTriangle, Package } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { dashboardStats } from '@/lib/mock-data'

export function LowStockAlert() {
  const lowStockItems = dashboardStats.lowStockItems

  if (lowStockItems.length === 0) {
    return null
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-amber-600" />
          <CardTitle className="text-amber-800 dark:text-amber-200">Kam qoldiq ogohlantirishlari</CardTitle>
        </div>
        <CardDescription className="text-amber-700/80 dark:text-amber-300/70">
          Quyidagi mahsulotlar minimal qoldiqdan kam
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-card p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <Package className="size-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Minimal: {item.minQuantity} {item.unit}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-amber-600">
                  {item.quantity} {item.unit}
                </div>
                <Button variant="link" className="h-auto p-0 text-xs text-primary">
                  Buyurtma berish
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
