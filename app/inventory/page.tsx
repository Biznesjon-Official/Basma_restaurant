'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit,
  AlertTriangle,
  Package,
  TrendingUp,
  Loader2,
  MoreVertical,
} from 'lucide-react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { inventoryAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/mock-data'

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    unit: 'kg',
    quantity: '',
    minQuantity: '',
    price: '',
    supplier: '',
  })

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      setLoading(true)
      const response = await inventoryAPI.getAll({ limit: 100 })
      setInventory(response.data)
    } catch (error: any) {
      console.error('Ombor yuklashda xatolik:', error)
      alert(error.message || 'Ombor yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        name: formData.name,
        unit: formData.unit,
        quantity: parseFloat(formData.quantity),
        minQuantity: parseFloat(formData.minQuantity),
        price: parseFloat(formData.price),
        supplier: formData.supplier,
      }

      if (editingItem) {
        await inventoryAPI.update(editingItem._id, data)
        alert('Mahsulot yangilandi!')
      } else {
        await inventoryAPI.create(data)
        alert('Mahsulot qo\'shildi!')
      }

      setIsDialogOpen(false)
      setEditingItem(null)
      setFormData({
        name: '',
        unit: 'kg',
        quantity: '',
        minQuantity: '',
        price: '',
        supplier: '',
      })
      loadInventory()
    } catch (error: any) {
      alert(error.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      unit: item.unit,
      quantity: item.quantity.toString(),
      minQuantity: item.minQuantity.toString(),
      price: item.price.toString(),
      supplier: item.supplier || '',
    })
    setIsDialogOpen(true)
  }

  const filteredItems = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lowStockCount = inventory.filter((item) => item.quantity <= item.minQuantity).length
  const totalValue = inventory.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = inventory.length

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Ombor</h1>
                <p className="text-muted-foreground">Mahsulotlar va inventar boshqaruvi</p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-1 size-4" />
                Yangi mahsulot
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-blue-500/10">
                    <Package className="size-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{totalItems}</div>
                    <div className="text-sm text-muted-foreground">Jami mahsulotlar</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-500/10">
                    <TrendingUp className="size-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                    <div className="text-sm text-muted-foreground">Umumiy qiymat</div>
                  </div>
                </CardContent>
              </Card>
              <Card
                className={
                  lowStockCount > 0
                    ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20'
                    : ''
                }
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-amber-500/10">
                    <AlertTriangle className="size-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lowStockCount}</div>
                    <div className="text-sm text-muted-foreground">Kam qoldiq</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Mahsulotlar ro&apos;yxati</CardTitle>
                    <CardDescription>Ombordagi barcha mahsulotlar</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Mahsulot qidirish..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mahsulot nomi</TableHead>
                        <TableHead>Mavjud</TableHead>
                        <TableHead>Min. qoldiq</TableHead>
                        <TableHead>Holat</TableHead>
                        <TableHead>Narx</TableHead>
                        <TableHead>Yetkazuvchi</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => {
                        const stockPercent = (item.quantity / (item.minQuantity * 3)) * 100
                        const isLowStock = item.quantity <= item.minQuantity
                        return (
                          <TableRow key={item._id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                              <span className={isLowStock ? 'font-semibold text-amber-600' : ''}>
                                {item.quantity} {item.unit}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.minQuantity} {item.unit}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={Math.min(stockPercent, 100)}
                                  className={`h-2 w-20 ${isLowStock ? '[&>div]:bg-amber-500' : ''}`}
                                />
                                {isLowStock && (
                                  <Badge
                                    variant="outline"
                                    className="border-amber-200 bg-amber-500/10 text-amber-600"
                                  >
                                    Kam
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.price)}/{item.unit}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.supplier || '-'}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(item)}>
                                    <Edit className="mr-2 size-4" />
                                    Tahrirlash
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
            </DialogTitle>
            <DialogDescription>Mahsulot ma&apos;lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Mahsulot nomi</Label>
                <Input
                  id="name"
                  placeholder="Guruch (Laser)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Miqdor</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="150"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Birlik</Label>
                  <Input
                    id="unit"
                    placeholder="kg"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="minQuantity">Min. qoldiq</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    step="0.01"
                    placeholder="50"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Narx</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="22000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier">Yetkazib beruvchi</Label>
                <Input
                  id="supplier"
                  placeholder="Agro Markaz"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingItem(null)
                }}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Yuklanmoqda...' : editingItem ? 'Saqlash' : 'Qo\'shish'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
