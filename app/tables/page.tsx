'use client'

import { useState, useEffect } from 'react'
import { Plus, Users, Clock, CheckCircle, Sparkles, Loader2, QrCode, Download, RefreshCw } from 'lucide-react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { tablesAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const statusConfig = {
  available: {
    label: "Bo'sh",
    icon: CheckCircle,
    color: 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  },
  occupied: {
    label: 'Band',
    icon: Users,
    color: 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-500/10 text-blue-600 border-blue-200',
  },
  reserved: {
    label: 'Bron qilingan',
    icon: Clock,
    color: 'border-purple-300 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/50',
    iconColor: 'text-purple-600',
    badge: 'bg-purple-500/10 text-purple-600 border-purple-200',
  },
  cleaning: {
    label: 'Tozalanmoqda',
    icon: Sparkles,
    color: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-200',
  },
}

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
    status: 'available',
  })

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      setLoading(true)
      const response = await tablesAPI.getAll()
      setTables(response.data)
    } catch (error: any) {
      console.error('Stollarni yuklashda xatolik:', error)
      alert(error.message || 'Stollarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await tablesAPI.create({
        number: parseInt(formData.number),
        capacity: parseInt(formData.capacity),
        status: formData.status,
      })
      alert('Stol qo\'shildi!')
      setIsAddDialogOpen(false)
      setFormData({ number: '', capacity: '', status: 'available' })
      loadTables()
    } catch (error: any) {
      alert(error.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (tableId: string, newStatus: string) => {
    try {
      await tablesAPI.update(tableId, { status: newStatus })
      loadTables()
    } catch (error: any) {
      alert(error.message || 'Xatolik yuz berdi')
    }
  }

  const handleRegenerateQrCode = async (tableId: string) => {
    if (!confirm('QR kodni yangilashni xohlaysizmi? Eski QR kod ishlamay qoladi.')) {
      return
    }

    try {
      await tablesAPI.regenerateQrCode(tableId)
      alert('QR kod yangilandi!')
      loadTables()
    } catch (error: any) {
      alert(error.message || 'Xatolik yuz berdi')
    }
  }

  const handleDownloadQrCode = (tableId: string, tableNumber: number, format: 'png' | 'svg') => {
    const url = format === 'png' 
      ? tablesAPI.getQrCodeImage(tableId)
      : tablesAPI.getQrCodeSvg(tableId)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `stol-${tableNumber}-qr.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const loadQrCode = async (tableId: string) => {
    try {
      const response = await tablesAPI.getQrCodeData(tableId)
      if (response.success) {
        setQrCodeDataUrl(response.data.dataUrl)
      }
    } catch (error: any) {
      console.error('QR kod yuklashda xatolik:', error)
    }
  }

  const statusCounts = {
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    cleaning: tables.filter((t) => t.status === 'cleaning').length,
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
                <h1 className="text-2xl font-bold tracking-tight">Stollar</h1>
                <p className="text-muted-foreground">Zaldagi stollar va ularning holati</p>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-1 size-4" />
                Yangi stol
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(statusConfig).map(([key, config]) => {
                const StatusIcon = config.icon
                return (
                  <Card key={key}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div
                        className={cn(
                          'flex size-12 items-center justify-center rounded-lg',
                          config.badge.split(' ')[0]
                        )}
                      >
                        <StatusIcon className={cn('size-6', config.iconColor)} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {statusCounts[key as keyof typeof statusCounts]}
                        </div>
                        <div className="text-sm text-muted-foreground">{config.label}</div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Stollar xaritasi</CardTitle>
                <CardDescription>Stolni tanlang va batafsil ma&apos;lumot oling</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
                    {tables.map((table) => {
                      const status = statusConfig[table.status as keyof typeof statusConfig]
                      const StatusIcon = status.icon

                      return (
                        <Dialog key={table._id}>
                          <DialogTrigger asChild>
                            <button
                              className={cn(
                                'relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all hover:scale-105 hover:shadow-lg',
                                status.color
                              )}
                              onClick={() => {
                                setSelectedTable(table)
                                loadQrCode(table._id)
                              }}
                            >
                              <StatusIcon className={cn('mb-1 size-6', status.iconColor)} />
                              <span className="text-2xl font-bold">{table.number}</span>
                              <span className="text-xs text-muted-foreground">
                                {table.capacity} kishi
                              </span>
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Stol #{table.number}</DialogTitle>
                              <DialogDescription>
                                {table.capacity} kishilik - {status.label}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                <span className="text-muted-foreground">Holat</span>
                                <Badge variant="outline" className={status.badge}>
                                  <StatusIcon className="mr-1 size-3" />
                                  {status.label}
                                </Badge>
                              </div>

                              {/* QR Code Section */}
                              <div className="space-y-3 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <QrCode className="size-5 text-muted-foreground" />
                                    <span className="font-medium">QR Kod</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRegenerateQrCode(table._id)}
                                  >
                                    <RefreshCw className="mr-1 size-3" />
                                    Yangilash
                                  </Button>
                                </div>
                                
                                <div className="flex justify-center rounded-lg bg-white p-4">
                                  {qrCodeDataUrl ? (
                                    <img
                                      src={qrCodeDataUrl}
                                      alt={`Stol ${table.number} QR kod`}
                                      className="size-48"
                                    />
                                  ) : (
                                    <div className="flex size-48 items-center justify-center">
                                      <Loader2 className="size-8 animate-spin text-muted-foreground" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleDownloadQrCode(table._id, table.number, 'png')}
                                  >
                                    <Download className="mr-1 size-3" />
                                    PNG
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleDownloadQrCode(table._id, table.number, 'svg')}
                                  >
                                    <Download className="mr-1 size-3" />
                                    SVG
                                  </Button>
                                </div>

                                <p className="text-xs text-muted-foreground text-center">
                                  Mijozlar bu QR kodni skanlab buyurtma berishlari mumkin
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label>Holatni o&apos;zgartirish</Label>
                                <Select
                                  value={table.status}
                                  onValueChange={(value) => handleUpdateStatus(table._id, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="available">Bo&apos;sh</SelectItem>
                                    <SelectItem value="occupied">Band</SelectItem>
                                    <SelectItem value="reserved">Bron qilingan</SelectItem>
                                    <SelectItem value="cleaning">Tozalanmoqda</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi stol qo&apos;shish</DialogTitle>
            <DialogDescription>Stol ma&apos;lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTable}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="number">Stol raqami</Label>
                <Input
                  id="number"
                  type="number"
                  placeholder="13"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Sig&apos;imi (kishi)</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="4"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Holat</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Bo&apos;sh</SelectItem>
                    <SelectItem value="occupied">Band</SelectItem>
                    <SelectItem value="reserved">Bron qilingan</SelectItem>
                    <SelectItem value="cleaning">Tozalanmoqda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Yuklanmoqda...' : 'Qo\'shish'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
