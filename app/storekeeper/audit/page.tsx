'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ClipboardCheck, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { inventoryAPI, storekeeperAPI } from '@/lib/api'
import { toast } from 'sonner'

export default function AuditPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    inventoryItemId: '',
    actualQuantity: '',
    reason: '',
  })
  const [auditResult, setAuditResult] = useState<any>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAuditResult(null)

    try {
      const response = await storekeeperAPI.performAudit({
        inventoryItemId: formData.inventoryItemId,
        actualQuantity: parseFloat(formData.actualQuantity),
        reason: formData.reason,
      })

      setAuditResult(response.data.audit)
      toast.success('Inventarizatsiya muvaffaqiyatli o\'tkazildi!')
      
      setFormData({
        inventoryItemId: '',
        actualQuantity: '',
        reason: '',
      })
      
      loadInventoryItems()
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
          <h1 className="text-3xl font-bold">Inventarizatsiya</h1>
          <p className="text-muted-foreground">
            Tizimdagi va haqiqiy qoldiqni solishtirish
          </p>
        </div>
      </div>

      {/* Audit Result */}
      {auditResult && (
        <Alert variant={auditResult.difference < 0 ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Inventarizatsiya natijasi:</strong>
            <br />
            Tizimdagi: {auditResult.systemQuantity} | Haqiqiy: {auditResult.actualQuantity} |
            Tafovut: {auditResult.difference} ({auditResult.differencePercent}%)
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Inventarizatsiya Formasi</CardTitle>
          <CardDescription>
            Mahsulotni sanab, haqiqiy miqdorni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inventoryItemId">Mahsulot *</Label>
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
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <p className="text-sm font-medium">
                      Tizimdagi qoldiq: {selectedItem.quantity} {selectedItem.unit}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Minimal: {selectedItem.minQuantity} {selectedItem.unit}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualQuantity">Haqiqiy miqdor *</Label>
                <Input
                  id="actualQuantity"
                  type="number"
                  step="0.01"
                  placeholder="43.5"
                  value={formData.actualQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, actualQuantity: e.target.value })
                  }
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Sanash natijasida topilgan haqiqiy miqdor
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="reason">Sabab</Label>
                <Textarea
                  id="reason"
                  placeholder="Kamomad sababi (agar bo'lsa)"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Yuklanmoqda...' : 'Inventarizatsiya o\'tkazish'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
