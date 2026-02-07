'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardStats, formatCurrency } from '@/lib/mock-data'
import { Progress } from '@/components/ui/progress'

interface PopularItemsProps {
  data?: any
}

export function PopularItems({ data }: PopularItemsProps) {
  const popularItems = data?.popularItems || dashboardStats.popularItems
  const maxCount = Math.max(...popularItems.map((item: any) => item.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mashhur taomlar</CardTitle>
        <CardDescription>Bugun eng ko&apos;p sotilgan taomlar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {popularItems.map((item: any, index: number) => (
          <div key={item.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {index + 1}
                </span>
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{item.count} ta</div>
                <div className="text-sm text-muted-foreground">{formatCurrency(item.revenue)}</div>
              </div>
            </div>
            <Progress value={(item.count / maxCount) * 100} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
