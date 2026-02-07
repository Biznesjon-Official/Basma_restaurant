'use client'

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Clock, Receipt } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { dashboardStats, formatCurrency } from '@/lib/mock-data'
import { useMemo } from 'react'

interface StatsCardsProps {
  data?: any
}

export function StatsCards({ data }: StatsCardsProps) {
  // Use real data if available, otherwise use mock data
  const todayRevenue = data?.todayRevenue || dashboardStats.todayRevenue
  const yesterdayRevenue = data?.yesterdayRevenue || dashboardStats.yesterdayRevenue
  const todayOrders = data?.todayOrders || dashboardStats.todayOrders
  const yesterdayOrders = data?.yesterdayOrders || dashboardStats.yesterdayOrders
  const activeOrders = data?.activeOrders || dashboardStats.activeOrders
  const averageOrderValue = data?.averageOrderValue || dashboardStats.averageOrderValue

  const stats = useMemo(() => [
    {
      title: 'Bugungi daromad',
      value: formatCurrency(todayRevenue),
      change: ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1),
      changeType: todayRevenue >= yesterdayRevenue ? 'positive' : 'negative',
      icon: DollarSign,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Bugungi buyurtmalar',
      value: todayOrders.toString(),
      change: ((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(1),
      changeType: todayOrders >= yesterdayOrders ? 'positive' : 'negative',
      icon: ShoppingCart,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Faol buyurtmalar',
      value: activeOrders.toString(),
      subtitle: 'hozirda tayyorlanmoqda',
      icon: Clock,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
    },
    {
      title: 'O\'rtacha chek',
      value: formatCurrency(averageOrderValue),
      subtitle: 'har bir buyurtma',
      icon: Receipt,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
    },
  ], [todayRevenue, yesterdayRevenue, todayOrders, yesterdayOrders, activeOrders, averageOrderValue])

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                {stat.change && (
                  <div className="flex items-center gap-1 text-sm">
                    {stat.changeType === 'positive' ? (
                      <TrendingUp className="size-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="size-4 text-red-500" />
                    )}
                    <span className={stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-500'}>
                      {stat.changeType === 'positive' ? '+' : ''}{stat.change}%
                    </span>
                    <span className="text-muted-foreground">vs kecha</span>
                  </div>
                )}
                {stat.subtitle && (
                  <span className="text-sm text-muted-foreground">{stat.subtitle}</span>
                )}
              </div>
              <div className={`flex size-12 items-center justify-center rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`size-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
