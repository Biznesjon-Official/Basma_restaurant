'use client'

import { useState, useEffect } from 'react'
import { Plus, DollarSign, TrendingDown, Calendar, Download } from 'lucide-react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { expensesAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/mock-data'
import { exportExpensesReport } from '@/lib/export-utils'

const categoryConfig: any = {
  rent: { label: 'Ijara', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  utilities: { label: 'Kommunal', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  salaries: { label: 'Ish haqi', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  supplies: { label: 'Xom ashyo', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  maintenance: { label: 'Ta\'mirlash', color: 'bg-red-500/10 text-red-600 border-red-200' },
  marketing: { label: 'Marketing', color: 'bg-pink-500/10 text-pink-600 border-pink-200' },
  other: { label: 'Boshqa', color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    category: 'supplies',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
  })

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const response = await expensesAPI.getAll({ limit: 100 })
      setExpenses(response.data)
    } catch (error: any) {
      console.error('Chiqimlarni yuklashda xatolik:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await expensesAPI.create({
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        isRecurring: formData.isRecurring,
      })

      alert('Chiqim qo\'shildi!')
      setIsDialogOpen(false)
      setFormData({
        category: 'supplies',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
      })
      loadExpenses()
    } catch (error: any) {
      alert(error.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const expensesByCategory = expenses.reduce((acc: any, exp) => {
    if (!acc[exp.category]) acc[exp.category] = 0
    acc[exp.category] += exp.amount
    return acc
  }, {})

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Chiqimlar</h1>
                <p className="text-muted-foreground">Biznes xarajatlari va chiqimlar</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportExpensesReport(expenses)}>
                  <Download className="mr-2 size-4" />
                  Export
                </Button>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-1 size-4" />
                  Yangi chiqim
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-red-500/10">
                    <TrendingDown className="size-6 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                    <div className="text-sm text-muted-foreground">Jami chiqimlar</div>
                  </div>
                </CardContent>
              </Card>
              {Object.entries(expensesByCategory).slice(0, 3).map(([category, amount]: any) => (
                <Card key={category}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-gray-500/10">
                      <DollarSign className="size-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{formatCurrency(amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        {categoryConfig[category]?.label || category}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Chiqimlar ro&apos;yxati</CardTitle>
                <CardDescription>Barcha xarajatlar tarixi</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sana</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead>Tavsif</TableHead>
                      <TableHead>Summa</TableHead>
                      <TableHead>Holat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-muted-foreground" />
                            {new Date(expense.date).toLocaleDateString('uz-UZ')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={categoryConfig[expense.category]?.color}>
                            {categoryConfig[expense.category]?.label || expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="font-bold text-red-600">
                          -{formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>
                          {expense.isRecurring && (
                            <Badge variant="secondary">Doimiy</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yangi chiqim qo&apos;shish</DialogTitle>
            <DialogDescription>Chiqim ma&apos;lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
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
                    {Object.entries(categoryConfig).map(([key, config]: any) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Summa (so&apos;m)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="500000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Tavsif</Label>
                <Input
                  id="description"
                  placeholder="Elektr energiya to'lovi"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Sana</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
