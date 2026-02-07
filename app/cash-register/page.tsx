'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, TrendingUp, TrendingDown, Plus, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { ordersAPI, expensesAPI, incomesAPI } from '@/lib/api'
import { toast } from 'sonner'

export default function CashRegisterPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paidOrders, setPaidOrders] = useState<any[]>([])
  const [manualIncomes, setManualIncomes] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [incomeForm, setIncomeForm] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (parsedUser.role !== 'admin' && parsedUser.role !== 'cashier') {
        router.push('/')
        return
      }

      loadData()
    } else {
      router.push('/login')
      return
    }
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load paid orders
      const ordersResponse = await ordersAPI.getAll({ paymentStatus: 'paid', limit: 100 })
      setPaidOrders(ordersResponse.data)

      // Load manual incomes
      const incomesResponse = await incomesAPI.getAll({ limit: 100 })
      setManualIncomes(incomesResponse.data)

      // Load expenses
      const expensesResponse = await expensesAPI.getAll({ limit: 100 })
      setExpenses(expensesResponse.data)
    } catch (error: any) {
      console.error('Ma\'lumotlarni yuklashda xatolik:', error)
      toast.error('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await expensesAPI.create({
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description,
        date: new Date(expenseForm.date),
      })
      toast.success('Chiqim qo\'shildi!')
      setIsExpenseDialogOpen(false)
      setExpenseForm({
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      })
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Xatolik yuz berdi')
    }
  }

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await incomesAPI.create({
        category: incomeForm.category,
        amount: parseFloat(incomeForm.amount),
        description: incomeForm.description,
        date: new Date(incomeForm.date),
      })
      toast.success('Kirim qo\'shildi!')
      setIsIncomeDialogOpen(false)
      setIncomeForm({
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      })
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Xatolik yuz berdi')
    }
  }

  // Calculate totals
  const allIncome = [...paidOrders, ...manualIncomes]
  const todayIncome = allIncome
    .filter((item) => {
      const itemDate = new Date(item.paidAt || item.date).toDateString()
      return itemDate === new Date().toDateString()
    })
    .reduce((sum, item) => sum + (item.totalAmount || item.amount), 0)

  const todayExpenses = expenses
    .filter((exp) => new Date(exp.date).toDateString() === new Date().toDateString())
    .reduce((sum, exp) => sum + exp.amount, 0)

  const todayBalance = todayIncome - todayExpenses

  const totalIncome = allIncome.reduce((sum, item) => sum + (item.totalAmount || item.amount), 0)
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalBalance = totalIncome - totalExpenses

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kassa Boshqaruvi</h1>
          <p className="text-muted-foreground">Kirim va chiqimlarni boshqarish</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsIncomeDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Kirim Qo'shish
          </Button>
          <Button onClick={() => setIsExpenseDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Chiqim Qo'shish
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugungi Kirim</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              +{todayIncome.toLocaleString()} so'm
            </div>
            <p className="text-xs text-muted-foreground">
              {allIncome.filter((i) => new Date(i.paidAt || i.date).toDateString() === new Date().toDateString()).length} ta kirim
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugungi Chiqim</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{todayExpenses.toLocaleString()} so'm
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.filter((e) => new Date(e.date).toDateString() === new Date().toDateString()).length} ta xarajat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugungi Balans</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todayBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {todayBalance >= 0 ? '+' : ''}{todayBalance.toLocaleString()} so'm
            </div>
            <p className="text-xs text-muted-foreground">Kirim - Chiqim</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umumiy Balans</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {totalBalance >= 0 ? '+' : ''}{totalBalance.toLocaleString()} so'm
            </div>
            <p className="text-xs text-muted-foreground">Jami balans</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="income" className="space-y-4">
        <TabsList>
          <TabsTrigger value="income">
            <TrendingUp className="mr-2 h-4 w-4" />
            Kirim
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <TrendingDown className="mr-2 h-4 w-4" />
            Chiqim
          </TabsTrigger>
        </TabsList>

        {/* Income Tab */}
        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Kirimlar (To'lovlar)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : allIncome.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Kirimlar yo'q
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sana</TableHead>
                      <TableHead>Manba</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead>Tavsif</TableHead>
                      <TableHead className="text-right">Summa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allIncome.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          {new Date(item.paidAt || item.date).toLocaleDateString('uz-UZ')}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.paidAt || item.date).toLocaleTimeString('uz-UZ', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.tableNumber ? (
                            <Badge variant="outline">Buyurtma</Badge>
                          ) : (
                            <Badge>Qo'lda</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.category || (item.paymentType === 'cash' ? 'Naqd' : item.paymentType === 'card' ? 'Karta' : 'Online')}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {item.description || (item.tableNumber ? `Stol #${item.tableNumber}` : '-')}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-emerald-600">
                          +{(item.totalAmount || item.amount).toLocaleString()} so'm
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Chiqimlar (Xarajatlar)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Chiqimlar yo'q
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sana</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead>Tavsif</TableHead>
                      <TableHead className="text-right">Summa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell>
                          {new Date(expense.date).toLocaleDateString('uz-UZ')}
                        </TableCell>
                        <TableCell>
                          <Badge>{expense.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {expense.description}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          -{expense.amount.toLocaleString()} so'm
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chiqim Qo'shish</DialogTitle>
            <DialogDescription>
              Yangi xarajat qo'shing
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddExpense}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategoriya *</Label>
                <Select
                  value={expenseForm.category}
                  onValueChange={(value) =>
                    setExpenseForm({ ...expenseForm, category: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mahsulotlar">Mahsulotlar</SelectItem>
                    <SelectItem value="Ish haqi">Ish haqi</SelectItem>
                    <SelectItem value="Kommunal">Kommunal</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Ta'mirlash">Ta'mirlash</SelectItem>
                    <SelectItem value="Boshqa">Boshqa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Summa (so'm) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="50000"
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Sana *</Label>
                <Input
                  id="date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Tavsif</Label>
                <Textarea
                  id="description"
                  placeholder="Xarajat haqida qo'shimcha ma'lumot..."
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpenseDialogOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit">Saqlash</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Income Dialog */}
      <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kirim Qo'shish</DialogTitle>
            <DialogDescription>
              Qo'shimcha kirim (buyurtmalardan tashqari) qo'shing
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddIncome}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="income-category">Kategoriya *</Label>
                <Select
                  value={incomeForm.category}
                  onValueChange={(value) =>
                    setIncomeForm({ ...incomeForm, category: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yetkazib berish">Yetkazib berish</SelectItem>
                    <SelectItem value="Xizmat ko'rsatish">Xizmat ko'rsatish</SelectItem>
                    <SelectItem value="Bron to'lovi">Bron to'lovi</SelectItem>
                    <SelectItem value="Sovg'a">Sovg'a</SelectItem>
                    <SelectItem value="Boshqa">Boshqa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="income-amount">Summa (so'm) *</Label>
                <Input
                  id="income-amount"
                  type="number"
                  placeholder="100000"
                  value={incomeForm.amount}
                  onChange={(e) =>
                    setIncomeForm({ ...incomeForm, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="income-date">Sana *</Label>
                <Input
                  id="income-date"
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) =>
                    setIncomeForm({ ...incomeForm, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="income-description">Tavsif</Label>
                <Textarea
                  id="income-description"
                  placeholder="Kirim haqida qo'shimcha ma'lumot..."
                  value={incomeForm.description}
                  onChange={(e) =>
                    setIncomeForm({ ...incomeForm, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsIncomeDialogOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit">Saqlash</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
