'use client'

import { useEffect, useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { WeeklyChart } from '@/components/dashboard/weekly-chart'
import { PopularItems } from '@/components/dashboard/popular-items'
import { ActiveOrders } from '@/components/dashboard/active-orders'
import { LowStockAlert } from '@/components/dashboard/low-stock-alert'
import { TablesOverview } from '@/components/dashboard/tables-overview'
import { analyticsAPI } from '@/lib/api'
import { connectSocket, onOrderStatusUpdate, onLowStock, disconnectSocket } from '@/lib/socket'
import { toast } from 'sonner'

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in - only for admin dashboard
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      console.log('🔒 No token found, redirecting to login')
      window.location.href = '/admin/login'
      return
    }

    loadDashboard()

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboard, 30000)

    // Connect socket for real-time updates
    const socket = connectSocket()
    console.log('🔌 Admin Dashboard: Socket connecting...')

    // Listen for order updates
    const unsubscribeOrders = onOrderStatusUpdate(() => {
      console.log('📥 Admin: Buyurtma yangilandi')
      loadDashboard()
    })

    // Listen for low stock alerts
    const unsubscribeLowStock = onLowStock((item) => {
      console.log('📥 Admin: Kam qolgan mahsulot', item)
      toast.warning(`⚠️ Kam qoldi: ${item.name}`, {
        duration: 10000,
        description: `Qoldiq: ${item.quantity} ${item.unit}`,
      })
    })

    return () => {
      clearInterval(interval)
      unsubscribeOrders()
      unsubscribeLowStock()
      disconnectSocket()
    }
  }, [])

  const loadDashboard = async () => {
    try {
      // Check user role from localStorage
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        setLoading(false)
        return
      }
      
      const user = JSON.parse(userStr)
      
      // Only admin and cashier can access analytics
      if (user.role === 'admin' || user.role === 'cashier') {
        const response = await analyticsAPI.getDashboard()
        setDashboardData(response.data)
      }
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                BASMA Osh Markazi - bugungi ko&apos;rsatkichlar
                {!loading && <span className="ml-2 text-xs">🔄 Real-time</span>}
              </p>
            </div>

            <StatsCards data={dashboardData} />

            <LowStockAlert />

            <div className="grid gap-6 lg:grid-cols-2">
              <RevenueChart />
              <WeeklyChart />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ActiveOrders />
              </div>
              <PopularItems data={dashboardData} />
            </div>

            <TablesOverview />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
