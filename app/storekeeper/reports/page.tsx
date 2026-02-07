'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function ReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('today')
  const [report, setReport] = useState<any>(null)
  const [costAnalysis, setCostAnalysis] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (parsedUser.role !== 'storekeeper' && parsedUser.role !== 'admin') {
        router.push('/')
        return
      }

      loadReports()
    } else {
      router.push('/login')
      return
    }
  }, [period])

  const loadReports = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

      // Load inventory report
      const reportRes = await fetch(`${apiUrl}/storekeeper/inventory/report?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const reportData = await reportRes.json()
      setReport(reportData.data || null)

      // Load cost analysis
      const costRes = await fetch(`${apiUrl}/storekeeper/inventory/cost-analysis?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const costData = await costRes.json()
      setCostAnalysis(costData.data || null)
    } catch (error) {
      console.error('Hisobotlarni yuklashda xatolik:', error)
      toast.error('Hisobotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const getPeriodLabel = (p: string) => {
    switch (p) {
      case 'today': return 'Bugun'
      case 'week': return 'Bu hafta'
      case 'month': return 'Bu oy'
      default: return p
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Ombor Hisobotlari</h1>
          <p className="text-muted-foreground">
            Mahsulotlar aylanmasi va xarajat tahlili
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Bugun</SelectItem>
            <SelectItem value="week">Bu hafta</SelectItem>
            <SelectItem value="month">Bu oy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qabul qilindi</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {costAnalysis?.summary?.totalReceived || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getPeriodLabel(period)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sarflandi</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {costAnalysis?.summary?.totalWriteOff || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getPeriodLabel(period)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jami Xarajat</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(costAnalysis?.summary?.totalCost || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getPeriodLabel(period)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mahsulotlar</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {costAnalysis?.items?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Faol mahsulotlar
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cost Analysis Table */}
          <Card>
            <CardHeader>
              <CardTitle>Mahsulotlar bo'yicha tahlil</CardTitle>
            </CardHeader>
            <CardContent>
              {!costAnalysis?.items || costAnalysis.items.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {getPeriodLabel(period)} uchun ma'lumot yo'q
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mahsulot</TableHead>
                      <TableHead className="text-right">Qabul</TableHead>
                      <TableHead className="text-right">Sarflandi</TableHead>
                      <TableHead className="text-right">Xarajat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costAnalysis.items
                      .sort((a: any, b: any) => b.totalCost - a.totalCost)
                      .slice(0, 20)
                      .map((item: any) => (
                        <TableRow key={item.item._id}>
                          <TableCell className="font-medium">
                            {item.item.name}
                            <Badge variant="outline" className="ml-2">
                              {item.item.unit}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            +{item.received}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            -{item.writeOff}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.totalCost)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
