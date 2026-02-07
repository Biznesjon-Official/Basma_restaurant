'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, MoreVertical, Phone, Shield, ChefHat, User, Warehouse } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { staff } from '@/lib/mock-data'
import { usersAPI } from '@/lib/api'

const roleConfig = {
  admin: { label: 'Admin', icon: Shield, color: 'bg-red-500/10 text-red-600 border-red-200' },
  waiter: { label: 'Ofitsiant', icon: User, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  chef: { label: 'Oshpaz', icon: ChefHat, color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  storekeeper: { label: 'Omborchi', icon: Warehouse, color: 'bg-teal-500/10 text-teal-600 border-teal-200' },
  cashier: { label: 'Kassir', icon: User, color: 'bg-green-500/10 text-green-600 border-green-200' },
}

const shiftConfig = {
  morning: { label: 'Ertalab', time: '08:00 - 16:00' },
  evening: { label: 'Kechqurun', time: '16:00 - 00:00' },
  night: { label: 'Tungi', time: '00:00 - 08:00' },
}

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [staffList, setStaffList] = useState<any[]>([]) // Bo'sh array bilan boshlash
  const [editingMember, setEditingMember] = useState<any>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    role: 'waiter',
  })

  // Format phone number for display: 90 949 78 78
  const formatPhoneDisplay = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as XX XXX XX XX
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
  }

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Remove all non-digits
    const digits = input.replace(/\D/g, '')
    
    // Limit to 9 digits (after +998)
    const limitedDigits = digits.slice(0, 9)
    
    // Update form data with just the digits (will be saved as 909497878)
    setFormData({ ...formData, phone: limitedDigits })
  }

  // Check authentication and role
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token) {
      alert('Iltimos, tizimga kiring')
      window.location.href = '/login'
      return
    }
    
    if (userStr) {
      const user = JSON.parse(userStr)
      // Faqat admin kirishi mumkin
      if (user.role !== 'admin') {
        alert('Bu sahifa faqat admin uchun')
        window.location.href = '/login'
        return
      }
    }
    
    loadStaff()
  }, [])

  const filteredStaff = staffList.filter(member =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeCount = staffList.filter(s => s.status === 'active').length
  const roleStats = {
    admin: staffList.filter(s => s.role === 'admin').length,
    waiter: staffList.filter(s => s.role === 'waiter').length,
    chef: staffList.filter(s => s.role === 'chef').length,
    storekeeper: staffList.filter(s => s.role === 'storekeeper').length,
    cashier: staffList.filter(s => s.role === 'cashier').length,
  }

  const handleDelete = async (id: string, name: string) => {
    console.log('🗑️ Delete request for:', { id, name })
    
    if (!confirm(`${name} xodimini o'chirmoqchimisiz?`)) {
      console.log('❌ Delete cancelled by user')
      return
    }

    try {
      console.log('📤 Sending delete request to API...')
      const response = await usersAPI.delete(id)
      console.log('✅ Delete response:', response)
      alert('Xodim o\'chirildi!')
      loadStaff()
    } catch (error: any) {
      console.error('❌ Delete error:', error)
      
      // Check if it's an authentication error
      if (error.status === 401) {
        alert('Sessiya tugadi. Iltimos, qaytadan tizimga kiring.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return
      }
      
      alert(error.message || 'O\'chirishda xatolik')
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await usersAPI.toggleStatus(id)
      loadStaff()
    } catch (error: any) {
      alert(error.message || 'Xatolik yuz berdi')
    }
  }

  const handleEdit = (member: any) => {
    setEditingMember(member)
    // Remove +998 prefix if exists for editing
    const phoneDigits = member.phone.replace(/^\+998/, '').replace(/\D/g, '')
    setFormData({
      fullName: member.name,
      phone: phoneDigits,
      password: '',
      role: member.role,
    })
    setIsDialogOpen(true)
  }

  const loadStaff = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getAll({ limit: 100 })
      setStaffList(
        response.data.map((user: any) => ({
          id: user._id,
          name: user.fullName,
          role: user.role,
          phone: user.phone,
          status: user.isActive ? 'active' : 'inactive',
          shift: 'morning', // Default
        }))
      )
    } catch (error: any) {
      console.error('Xodimlarni yuklashda xatolik:', error)
      
      // Check if it's an authentication error
      if (error.status === 401) {
        alert('Sessiya tugadi. Iltimos, qaytadan tizimga kiring.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else if (error.status === 403) {
        alert('Sizda bu ma\'lumotlarni ko\'rish uchun ruxsat yo\'q.')
        window.location.href = '/login'
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data: any = {
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role,
      }

      if (formData.password) {
        data.password = formData.password
      }

      if (editingMember) {
        await usersAPI.update(editingMember.id, data)
        alert('Xodim yangilandi!')
      } else {
        if (!formData.password) {
          alert('Parol talab qilinadi!')
          return
        }
        data.password = formData.password
        await usersAPI.create(data)
        alert('Xodim qo\'shildi!')
      }

      setIsDialogOpen(false)
      setEditingMember(null)
      setFormData({ fullName: '', phone: '', password: '', role: 'waiter' })
      loadStaff()
    } catch (err: any) {
      setError(err.message || 'Xodim qo\'shishda xatolik')
      alert(err.message || 'Xodim qo\'shishda xatolik')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [])

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Xodimlar</h1>
                <p className="text-muted-foreground">Jamoa a&apos;zolari va rollarni boshqarish</p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-1 size-4" />
                Yangi xodim
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {Object.entries(roleConfig).map(([key, config]) => {
                const RoleIcon = config.icon
                return (
                  <Card key={key}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className={`flex size-10 items-center justify-center rounded-lg ${config.color.split(' ')[0]}`}>
                        <RoleIcon className={`size-5 ${config.color.split(' ')[1]}`} />
                      </div>
                      <div>
                        <div className="text-xl font-bold">{roleStats[key as keyof typeof roleStats]}</div>
                        <div className="text-sm text-muted-foreground">{config.label}</div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Xodimlar ro&apos;yxati</CardTitle>
                    <CardDescription>
                      Jami {staffList.length} xodim, {activeCount} nafari faol
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Xodim qidirish..."
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
                      <TableHead>Xodim</TableHead>
                      <TableHead>Lavozim</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Smena</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((member) => {
                      const role = roleConfig[member.role as keyof typeof roleConfig]
                      const shift = shiftConfig[member.shift as keyof typeof shiftConfig]
                      const initials = member.name.split(' ').map(n => n[0]).join('')
                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{member.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={role?.color || 'bg-gray-500/10 text-gray-600 border-gray-200'}>
                              {role?.label || member.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="size-4" />
                              {member.phone}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{shift.label}</div>
                              <div className="text-sm text-muted-foreground">{shift.time}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={member.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' 
                                : 'bg-gray-500/10 text-gray-600 border-gray-200'
                              }
                            >
                              {member.status === 'active' ? 'Faol' : 'Nofaol'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(member)}>
                                  <Edit className="mr-2 size-4" />
                                  Tahrirlash
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(member.id)}>
                                  {member.status === 'active' ? 'Faolsizlantirish' : 'Faollashtirish'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(member.id, member.name)}
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
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}</DialogTitle>
            <DialogDescription>
              Xodim ma&apos;lumotlarini kiriting
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">To&apos;liq ism</Label>
                <Input
                  id="fullName"
                  placeholder="Akmal Karimov"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefon raqam</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    +998
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="90 949 78 78"
                    value={formatPhoneDisplay(formData.phone)}
                    onChange={handlePhoneChange}
                    className="pl-14"
                    required
                    maxLength={14}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: 90 949 78 78
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">
                  Parol {editingMember && '(bo\'sh qoldiring agar o\'zgartirmasangiz)'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingMember}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Lavozim</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="waiter">Ofitsiant</SelectItem>
                    <SelectItem value="chef">Oshpaz</SelectItem>
                    <SelectItem value="storekeeper">Omborchi</SelectItem>
                    <SelectItem value="cashier">Kassir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingMember(null)
                }}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Yuklanmoqda...' : editingMember ? 'Saqlash' : 'Qo\'shish'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
