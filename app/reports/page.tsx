'use client'

import { useState, useEffect } from 'react'
import { Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Calendar } from 'lucide-react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { analyticsAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/mock-data'

export default function ReportsPage() {
  const [period, setPeriod] = useState('monthly')
  const [revenueData, setRevenueData] = useState<any>(null)
  const [topSelling, setTopSelling] = useState<any[]>([])
  const [lowPerforming, setLowPerforming] = useState<any[]>([])
  const [staffPerformance, setStaffPerformance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const [revenue, top, low, staff] = await Promise.all([
        analyticsAPI.getRevenue({ period }),
        analyticsAPI.getTopSelling({ period, limit: 10 }),
        analyticsAPI.getLowPerforming({ period, limit: 10 }),
        analyticsAPI.getStaffPerformance({ period }),
      ])

      setRevenueData(revenue.data)
      setTopSelling(top.data)
      setLowPerforming(low.data)
      setStaffPerformance(staff.data)
    } catch (error: any) {
      console.error('Analytics error:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = () => {
    if (topSelling.length > 0) {
      const { exportTopSellingReport } = require('@/lib/export-utils')
      exportTopSellingReport(topSelling, period)
    } else {
      alert('Ma\'lumot yo\'q')
    }
  }

  const exportToExcel = () => {
    if (topSelling.length > 0) {
      const { exportTopSellingReport } = require('@/lib/export-utils')
      exportTopSellingReport(topSelling, period)
    } else {
      alert('Ma\'lumot yo\'q')
    }
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Hisobotlar va Analitika</h1>
                <p className="text-muted-foreground">Biznes ko&apos;rsatkichlari va statistika</p>
              </div>
              <div className="flex gap-2">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Kunlik</SelectItem>
                    <SelectItem value="weekly">Haftalik</SelectItem>
                    <SelectItem value="monthly">Oylik</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={exportToPDF}>
                  <Download className="mr-2 size-4" />
                  PDF
                </Button>
                <Button variant="outline" onClick={exportToExcel}>
                  <Download className="mr-2 size-4" />
                  Excel
                </Button>
              </div>
            </div>

            {/* Revenue Summary */}
            {revenueData && (
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-500/10">
                      <DollarSign className="size-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{formatCurrency(revenueData.totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">Jami daromad</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-blue-500/10">
                      <ShoppingCart className="size-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{revenueData.totalOrders}</div>
                      <div className="text-sm text-muted-foreground">Jami buyurtmalar</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-purple-500/10">
                      <TrendingUp className="size-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(revenueData.averageOrderValue)}
                      </div>
                      <div className="text-sm text-muted-foreground">O&apos;rtacha buyurtma</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Tabs defaultValue="top-selling" className="space-y-4">
              <TabsList>
                <TabsTrigger value="top-selling">Eng ko&apos;p sotilgan</TabsTrigger>
                <TabsTrigger value="low-performing">Kam sotilgan</TabsTrigger>
                <TabsTrigger value="staff">Xodimlar KPI</TabsTrigger>
              </TabsList>

              <TabsContent value="top-selling">
                <Card>
                  <CardHeader>
                    <CardTitle>Eng ko&apos;p sotilgan taomlar</CardTitle>
                    <CardDescription>Top 10 mashhur taomlar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topSelling.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{item.menuItem?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.totalQuantity} ta sotildi
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(item.totalRevenue)}</div>
                            <div className="text-sm text-emerald-600">
                              <TrendingUp className="inline size-3" /> Daromad
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="low-performing">
                <Card>
                  <CardHeader>
                    <CardTitle>Kam sotilgan taomlar</CardTitle>
                    <CardDescription>Diqqat talab qiluvchi taomlar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {lowPerforming.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-amber-500/10 text-sm font-bold text-amber-600">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.category} - {formatCurrency(item.price)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{item.totalQuantity} ta</div>
                            <div className="text-sm text-amber-600">
                              <TrendingDown className="inline size-3" /> Kam sotilgan
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="staff">
                <Card>
                  <CardHeader>
                    <CardTitle>Xodimlar KPI</CardTitle>
                    <CardDescription>Xodimlar samaradorligi statistikasi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {staffPerformance.map((staff, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10">
                              <Users className="size-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{staff.waiter?.fullName || 'Noma\'lum'}</div>
                              <div className="text-sm text-muted-foreground">
                                {staff.totalOrders} ta buyurtma
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(staff.totalRevenue)}</div>
                            <div className="text-sm text-muted-foreground">
                              O&apos;rtacha: {formatCurrency(staff.averageOrderValue)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
