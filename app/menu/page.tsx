'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, MoreVertical, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { menuAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/mock-data'

const categories = [
  { id: '1', name: 'Osh', icon: '🍚' },
  { id: '2', name: "Sho'rva", icon: '🍜' },
  { id: '3', name: 'Kabob', icon: '🍖' },
  { id: '4', name: 'Salat', icon: '🥗' },
  { id: '5', name: 'Ichimlik', icon: '🥤' },
  { id: '6', name: 'Shirinlik', icon: '🍰' },
]

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Osh',
    price: '',
    cost: '',
    preparationTime: '',
    available: true,
    image: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    loadMenuItems()
  }, [])

  const loadMenuItems = async () => {
    try {
      setLoading(true)
      const response = await menuAPI.getAll({ limit: 100 })
      setMenuItems(response.data)
    } catch (error: any) {
      console.error('Menu yuklashda xatolik:', error)
      alert(error.message || 'Menu yuklashda xatolik')
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
        category: formData.category,
        price: parseInt(formData.price),
        cost: parseInt(formData.cost),
        preparationTime: parseInt(formData.preparationTime),
        available: formData.available,
        image: formData.image || undefined,
      }

      if (editingItem) {
        await menuAPI.update(editingItem._id, data)
        alert('Taom yangilandi!')
      } else {
        await menuAPI.create(data)
        alert('Taom qo\'shildi!')
      }

      setIsDialogOpen(false)
      setEditingItem(null)
      setFormData({
        name: '',
        category: 'Osh',
        price: '',
        cost: '',
        preparationTime: '',
        available: true,
        image: '',
      })
      setImagePreview(null)
      loadMenuItems()
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
      category: item.category,
      price: item.price.toString(),
      cost: item.cost.toString(),
      preparationTime: item.preparationTime.toString(),
      available: item.available,
      image: item.image || '',
    })
    setImagePreview(item.image || null)
    setIsDialogOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Rasm hajmi 2MB dan kichik bo\'lishi kerak')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Faqat rasm fayllarini yuklash mumkin')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData({ ...formData, image: base64String })
      setImagePreview(base64String)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' })
    setImagePreview(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Taomni o\'chirmoqchimisiz?')) return

    try {
      await menuAPI.delete(id)
      alert('Taom o\'chirildi!')
      loadMenuItems()
    } catch (error: any) {
      alert(error.message || 'O\'chirishda xatolik')
    }
  }

  const handleToggleAvailable = async (item: any) => {
    try {
      await menuAPI.update(item._id, { available: !item.available })
      loadMenuItems()
    } catch (error: any) {
      alert(error.message || 'Xatolik yuz berdi')
    }
  }

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryCount = (categoryName: string) => {
    return menuItems.filter((item) => item.category === categoryName).length
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
                <h1 className="text-2xl font-bold tracking-tight">Menyu</h1>
                <p className="text-muted-foreground">Taomlar va kategoriyalarni boshqarish</p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-1 size-4" />
                Yangi taom
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedCategory === category.name ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === category.name ? null : category.name)
                  }
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {getCategoryCount(category.name)} ta
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Taomlar ro&apos;yxati</CardTitle>
                    <CardDescription>
                      {selectedCategory
                        ? `${selectedCategory} kategoriyasidagi taomlar`
                        : 'Barcha taomlar'}
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Taom qidirish..."
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
                        <TableHead>Rasm</TableHead>
                        <TableHead>Taom nomi</TableHead>
                        <TableHead>Kategoriya</TableHead>
                        <TableHead>Narx</TableHead>
                        <TableHead>Tannarx</TableHead>
                        <TableHead>Foyda</TableHead>
                        <TableHead>Vaqt</TableHead>
                        <TableHead>Holat</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => {
                        const profit = item.price - item.cost
                        const profitPercent = ((profit / item.cost) * 100).toFixed(0)
                        return (
                          <TableRow key={item._id}>
                            <TableCell>
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="size-12 rounded-md object-cover"
                                />
                              ) : (
                                <div className="flex size-12 items-center justify-center rounded-md bg-muted">
                                  <ImageIcon className="size-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{item.category}</Badge>
                            </TableCell>
                            <TableCell>{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatCurrency(item.cost)}
                            </TableCell>
                            <TableCell>
                              <span className="text-emerald-600">+{profitPercent}%</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.preparationTime} daq
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={item.available}
                                onCheckedChange={() => handleToggleAvailable(item)}
                              />
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
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(item._id)}
                                  >
                                    <Trash2 className="mr-2 size-4" />
                                    O&apos;chirish
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
            <DialogTitle>{editingItem ? 'Taomni tahrirlash' : 'Yangi taom qo\'shish'}</DialogTitle>
            <DialogDescription>Taom ma&apos;lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="image">Taom rasmi</Label>
                <div className="flex flex-col gap-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-40 w-full rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="image-upload"
                      className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50"
                    >
                      <Upload className="mb-2 size-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Rasm yuklash uchun bosing
                      </span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        PNG, JPG (max 2MB)
                      </span>
                    </label>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Taom nomi</Label>
                <Input
                  id="name"
                  placeholder="Samarqand oshi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategoriya</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Narx (so'm)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="45000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cost">Tannarx (so'm)</Label>
                  <Input
                    id="cost"
                    type="number"
                    placeholder="22000"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="preparationTime">Tayyorlash vaqti (daqiqa)</Label>
                <Input
                  id="preparationTime"
                  type="number"
                  placeholder="25"
                  value={formData.preparationTime}
                  onChange={(e) =>
                    setFormData({ ...formData, preparationTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="available">Mavjud</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingItem(null)
                  setImagePreview(null)
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
