'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Star, Phone, Mail, Calendar, TrendingUp, Download } from 'lucide-react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { customersAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/mock-data'
import { exportCustomersReport } from '@/lib/export-utils'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [topCustomers, setTopCustomers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomers()
    loadTopCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const response = await customersAPI.getAll({ limit: 100 })
      setCustomers(response.data)
    } catch (error: any) {
      console.error('Mijozlarni yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTopCustomers = async () => {
    try {
      const response = await customersAPI.getTop({ limit: 5 })
      setTopCustomers(response.data)
    } catch (error: any) {
      console.error('Top mijozlarni yuklashda xatolik:', error)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
  )

  const totalCustomers = customers.length
  const vipCustomers = customers.filter((c) => c.isVIP).length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Mijozlar bazasi (CRM)</h1>
                <p className="text-muted-foreground">Doimiy mijozlar va statistika</p>
              </div>
              <Button variant="outline" onClick={() => exportCustomersReport(customers)}>
                <Download className="mr-2 size-4" />
                Export
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-blue-500/10">
                    <Phone className="size-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{totalCustomers}</div>
                    <div className="text-sm text-muted-foreground">Jami mijozlar</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-amber-500/10">
                    <Star className="size-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{vipCustomers}</div>
                    <div className="text-sm text-muted-foreground">VIP mijozlar</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-500/10">
                    <TrendingUp className="size-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <div className="text-sm text-muted-foreground">Jami xarajat</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Barcha mijozlar</CardTitle>
                      <CardDescription>{filteredCustomers.length} ta mijoz</CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mijoz</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Buyurtmalar</TableHead>
                        <TableHead>Jami xarajat</TableHead>
                        <TableHead>Holat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {customer.name?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{customer.name || 'Noma\'lum'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{customer.totalOrders}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(customer.totalSpent)}
                          </TableCell>
                          <TableCell>
                            {customer.isVIP && (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                                <Star className="mr-1 size-3" />
                                VIP
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top 5 mijozlar</CardTitle>
                  <CardDescription>Eng ko&apos;p xarajat qilganlar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCustomers.map((customer, index) => (
                      <div key={customer._id} className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                          {index + 1}
                        </div>
                        <Avatar>
                          <AvatarFallback>{customer.name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{customer.name || 'Noma\'lum'}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.totalOrders} ta buyurtma
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">{formatCurrency(customer.totalSpent)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
