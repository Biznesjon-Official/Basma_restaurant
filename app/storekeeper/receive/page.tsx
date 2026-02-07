'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, AlertCircle, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { inventoryAPI, storekeeperAPI } from '@/lib/api'
import { toast } from 'sonner'

export default function ReceivePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false)
  const [newItemData, setNewItemData] = useState({
    name: '',
    unit: 'kg',
    minQuantity: '10',
  })
  const [formData, setFormData] = useState({
    inventoryItemId: '',
    quantity: '',
    price: '',
    supplier: '',
    invoiceNumber: '',
  })
  const [priceAlert, setPriceAlert] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (
        parsedUser.role !== 'storekeeper' &&
        parsedUser.role !== 'admin'
      ) {
        router.push('/')
        return
      }

      loadInventoryItems()
    } else {
      router.push('/login')
      return
    }
  }, [router])

  const loadInventoryItems = async () => {
    try {
      const response = await inventoryAPI.getAll({ limit: 1000 })
      setInventoryItems(response.data)
    } catch (error: any) {
      console.error('Mahsulotlarni yuklashda xatolik:', error)
      toast.error('Mahsulotlarni yuklashda xatolik')
    }
  }

  const handleCreateNewItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await inventoryAPI.create({
        name: newItemData.name,
        unit: newItemData.unit,
        quantity: 0,
        minQuantity: parseFloat(newItemData.minQuantity),
        price: 0,
        supplier: '',
      })

      toast.success('Yangi mahsulot qo\'shildi!')
      setIsNewItemDialogOpen(false)
      setNewItemData({ name: '', unit: 'kg', minQuantity: '10' })
      
      // Reload items and select the new one
      await loadInventoryItems()
      setFormData({ ...formData, inventoryItemId: response.data._id })
    } catch (error: any) {
      toast.error(error.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setPriceAlert(null)

    try {
      const response = await storekeeperAPI.receiveInventory({
        inventoryItemId: formData.inventoryItemId,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        supplier: formData.supplier,
        invoiceNumber: formData.invoiceNumber,
      })

      if (response.data.priceAlert) {
        setPriceAlert(response.data.priceAlert)
      }

      toast.success('Mahsulot muvaffaqiyatli qabul qilindi!')
      setFormData({
        inventoryItemId: '',
        quantity: '',
        price: '',
        supplier: '',
        invoiceNumber: '',
      })
    } catch (error: any) {
      toast.error(error.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const selectedItem = inventoryItems.find((item) => item._id === formData.inventoryItemId)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Mahsulot Qabul Qilish</h1>
          <p className="text-muted-foreground">
            Yetkazib beruvchilardan mahsulot qabul qilish (Kirim)
          </p>
        </div>
      </div>

      {/* Price Alert */}
      {priceAlert && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{priceAlert}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Mahsulot Qabul Qilish Formasi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="inventoryItemId">Mahsulot *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsNewItemDialogOpen(true)}
                  >
                    <Plus className="size-4 mr-1" />
                    Yangi
                  </Button>
                </div>
                <Select
                  value={formData.inventoryItemId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, inventoryItemId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mahsulotni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name} ({item.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedItem && (
                  <p className="text-sm text-muted-foreground">
                    Hozirgi qoldiq: {selectedItem.quantity} {selectedItem.unit}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Miqdor *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  placeholder="50"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Narx (so'm) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="85000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                {selectedItem && (
                  <p className="text-sm text-muted-foreground">
                    Oldingi narx: {selectedItem.price.toLocaleString()} so'm
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Yetkazib beruvchi</Label>
                <Input
                  id="supplier"
                  placeholder="Agro Markaz"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">
                  Hisob-faktura raqami <span className="text-muted-foreground text-sm">(ixtiyoriy)</span>
                </Label>
                <Input
                  id="invoiceNumber"
                  placeholder="INV-2026-001 (ixtiyoriy)"
                  value={formData.invoiceNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceNumber: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Yetkazib beruvchidan olingan hujjat raqami (bo'sh qoldirsangiz ham bo'ladi)
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Yuklanmoqda...' : 'Qabul qilish'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* New Item Dialog */}
      <Dialog open={isNewItemDialogOpen} onOpenChange={setIsNewItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi Mahsulot Qo'shish</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateNewItem} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newItemName">Mahsulot nomi *</Label>
              <Input
                id="newItemName"
                placeholder="Guruch, Go'sht, Yog'..."
                value={newItemData.name}
                onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newItemUnit">O'lchov birligi *</Label>
              <Select
                value={newItemData.unit}
                onValueChange={(value) => setNewItemData({ ...newItemData, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogramm (kg)</SelectItem>
                  <SelectItem value="g">Gramm (g)</SelectItem>
                  <SelectItem value="l">Litr (l)</SelectItem>
                  <SelectItem value="ml">Millilitr (ml)</SelectItem>
                  <SelectItem value="dona">Dona</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newItemMinQty">Minimal miqdor *</Label>
              <Input
                id="newItemMinQty"
                type="number"
                placeholder="10"
                value={newItemData.minQuantity}
                onChange={(e) => setNewItemData({ ...newItemData, minQuantity: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Bu miqdordan kam qolganda ogohlan tirish beriladi
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewItemDialogOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Yuklanmoqda...' : 'Qo\'shish'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
