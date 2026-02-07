'use client'

import { useState, useEffect } from 'react'
import { Activity, Filter, User, FileText, ShoppingCart, Package, Settings } from 'lucide-react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { activityLogsAPI } from '@/lib/api'

const actionConfig: any = {
  create: { label: 'Yaratildi', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  update: { label: 'Yangilandi', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  delete: { label: 'O\'chirildi', color: 'bg-red-500/10 text-red-600 border-red-200' },
  login: { label: 'Kirish', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  logout: { label: 'Chiqish', color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
  view: { label: 'Ko\'rildi', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200' },
  export: { label: 'Eksport', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  status_change: { label: 'Holat o\'zgarishi', color: 'bg-pink-500/10 text-pink-600 border-pink-200' },
}

const entityConfig: any = {
  user: { label: 'Xodim', icon: User },
  menu: { label: 'Menu', icon: FileText },
  order: { label: 'Buyurtma', icon: ShoppingCart },
  table: { label: 'Stol', icon: Package },
  inventory: { label: 'Ombor', icon: Package },
  settings: { label: 'Sozlamalar', icon: Settings },
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')

  useEffect(() => {
    loadLogs()
  }, [filterAction, filterEntity])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const params: any = { limit: 100 }
      if (filterAction !== 'all') params.action = filterAction
      if (filterEntity !== 'all') params.entity = filterEntity

      const response = await activityLogsAPI.getAll(params)
      setLogs(response.data)
    } catch (error: any) {
      console.error('Loglarni yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
                <h1 className="text-2xl font-bold tracking-tight">Tizim faoliyat loglari</h1>
                <p className="text-muted-foreground">Barcha tizim harakatlari tarixi</p>
              </div>
              <div className="flex gap-2">
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Harakat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barchasi</SelectItem>
                    {Object.entries(actionConfig).map(([key, config]: any) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterEntity} onValueChange={setFilterEntity}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Modul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barchasi</SelectItem>
                    {Object.entries(entityConfig).map(([key, config]: any) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="size-5" />
                  <CardTitle>Faoliyat tarixi</CardTitle>
                </div>
                <CardDescription>
                  {logs.length} ta yozuv - Faqat ko&apos;rish uchun (o&apos;zgartirish mumkin emas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sana va vaqt</TableHead>
                      <TableHead>Foydalanuvchi</TableHead>
                      <TableHead>Harakat</TableHead>
                      <TableHead>Modul</TableHead>
                      <TableHead>Tafsilotlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const action = actionConfig[log.action]
                      const entity = entityConfig[log.entity]
                      const EntityIcon = entity?.icon || Activity

                      return (
                        <TableRow key={log._id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="size-4 text-muted-foreground" />
                              <span className="font-medium">{log.user?.fullName || 'Noma\'lum'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={action?.color}>
                              {action?.label || log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <EntityIcon className="size-4 text-muted-foreground" />
                              <span>{entity?.label || log.entity}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
