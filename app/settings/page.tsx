'use client'

import { useState, useEffect } from 'react'
import { Save, Building2, CreditCard, Bell, Shield, Palette, Send } from 'lucide-react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { settingsAPI } from '@/lib/api'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<any>({
    restaurantName: 'BASMA Osh Markazi',
    restaurantPhone: '',
    restaurantAddress: '',
    business: {
      openTime: '08:00',
      closeTime: '23:00',
    },
    telegram: {
      enabled: false,
      botToken: '',
      chatId: '',
      notifications: {
        dailyReport: false,
        weeklyReport: false,
        monthlyReport: false,
        lowStock: false,
        newOrder: false,
      },
    },
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.get()
      setSettings(response.data)
    } catch (error: any) {
      console.error('Sozlamalarni yuklashda xatolik:', error)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await settingsAPI.update(settings)
      alert('Sozlamalar saqlandi!')
    } catch (error: any) {
      alert(error.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sozlamalar</h1>
              <p className="text-muted-foreground">Tizim sozlamalari va konfiguratsiya</p>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="general">
                  <Building2 className="mr-2 size-4" />
                  Umumiy
                </TabsTrigger>
                <TabsTrigger value="telegram">
                  <Send className="mr-2 size-4" />
                  Telegram
                </TabsTrigger>
                <TabsTrigger value="payments">
                  <CreditCard className="mr-2 size-4" />
                  To&apos;lovlar
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="mr-2 size-4" />
                  Bildirishnoma
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="mr-2 size-4" />
                  Xavfsizlik
                </TabsTrigger>
                <TabsTrigger value="appearance">
                  <Palette className="mr-2 size-4" />
                  Ko&apos;rinish
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Restoran ma&apos;lumotlari</CardTitle>
                    <CardDescription>Asosiy ma&apos;lumotlarni tahrirlash</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Restoran nomi</Label>
                        <Input
                          id="name"
                          value={settings.restaurantName || ''}
                          onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon raqam</Label>
                        <Input
                          id="phone"
                          value={settings.restaurantPhone || ''}
                          onChange={(e) => setSettings({ ...settings, restaurantPhone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Manzil</Label>
                      <Input
                        id="address"
                        value={settings.restaurantAddress || ''}
                        onChange={(e) => setSettings({ ...settings, restaurantAddress: e.target.value })}
                      />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium">Ish vaqti</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Ochilish vaqti</Label>
                          <Input
                            type="time"
                            value={settings.business?.openTime || ''}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                business: { ...settings.business, openTime: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Yopilish vaqti</Label>
                          <Input
                            type="time"
                            value={settings.business?.closeTime || ''}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                business: { ...settings.business, closeTime: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleSave} disabled={loading}>
                      <Save className="mr-2 size-4" />
                      {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="telegram">
                <Card>
                  <CardHeader>
                    <CardTitle>Telegram Bot sozlamalari</CardTitle>
                    <CardDescription>Telegram orqali hisobotlar va xabarnomalar</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Telegram botni yoqish</div>
                        <div className="text-sm text-muted-foreground">Avtomatik xabarnomalar</div>
                      </div>
                      <Switch
                        checked={settings.telegram?.enabled}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            telegram: { ...settings.telegram, enabled: checked },
                          })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Bot Token</Label>
                        <Input
                          placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                          value={settings.telegram?.botToken || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              telegram: { ...settings.telegram, botToken: e.target.value },
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          @BotFather dan olingan token
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Chat ID</Label>
                        <Input
                          placeholder="-1001234567890"
                          value={settings.telegram?.chatId || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              telegram: { ...settings.telegram, chatId: e.target.value },
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Guruh yoki kanal ID raqami
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium">Xabarnoma turlari</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Kunlik hisobot</div>
                          <div className="text-sm text-muted-foreground">Har kuni kechqurun</div>
                        </div>
                        <Switch
                          checked={settings.telegram?.notifications?.dailyReport}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              telegram: {
                                ...settings.telegram,
                                notifications: {
                                  ...settings.telegram.notifications,
                                  dailyReport: checked,
                                },
                              },
                            })
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Haftalik hisobot</div>
                          <div className="text-sm text-muted-foreground">Har dushanba</div>
                        </div>
                        <Switch
                          checked={settings.telegram?.notifications?.weeklyReport}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              telegram: {
                                ...settings.telegram,
                                notifications: {
                                  ...settings.telegram.notifications,
                                  weeklyReport: checked,
                                },
                              },
                            })
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Oylik hisobot</div>
                          <div className="text-sm text-muted-foreground">Har oy boshida</div>
                        </div>
                        <Switch
                          checked={settings.telegram?.notifications?.monthlyReport}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              telegram: {
                                ...settings.telegram,
                                notifications: {
                                  ...settings.telegram.notifications,
                                  monthlyReport: checked,
                                },
                              },
                            })
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Kam qoldiq ogohlantirish</div>
                          <div className="text-sm text-muted-foreground">Mahsulot tugaganda</div>
                        </div>
                        <Switch
                          checked={settings.telegram?.notifications?.lowStock}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              telegram: {
                                ...settings.telegram,
                                notifications: {
                                  ...settings.telegram.notifications,
                                  lowStock: checked,
                                },
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <Button onClick={handleSave} disabled={loading}>
                      <Save className="mr-2 size-4" />
                      {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle>To&apos;lov tizimlari</CardTitle>
                    <CardDescription>To&apos;lov usullarini sozlash</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-blue-500/10">
                          <span className="text-xl font-bold text-blue-600">C</span>
                        </div>
                        <div>
                          <div className="font-medium">Click</div>
                          <div className="text-sm text-muted-foreground">Online to&apos;lov</div>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-cyan-500/10">
                          <span className="text-xl font-bold text-cyan-600">P</span>
                        </div>
                        <div>
                          <div className="font-medium">Payme</div>
                          <div className="text-sm text-muted-foreground">Online to&apos;lov</div>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-purple-500/10">
                          <span className="text-xl font-bold text-purple-600">U</span>
                        </div>
                        <div>
                          <div className="font-medium">Uzum Pay</div>
                          <div className="text-sm text-muted-foreground">Online to&apos;lov</div>
                        </div>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-500/10">
                          <span className="text-xl font-bold text-emerald-600">N</span>
                        </div>
                        <div>
                          <div className="font-medium">Naqd pul</div>
                          <div className="text-sm text-muted-foreground">Kassada to&apos;lov</div>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Bildirishnoma sozlamalari</CardTitle>
                    <CardDescription>Qanday bildirishnomalar olishni tanlang</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Yangi buyurtmalar</div>
                        <div className="text-sm text-muted-foreground">Har bir yangi buyurtma haqida</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Kam qoldiq</div>
                        <div className="text-sm text-muted-foreground">Mahsulot kam qolganda</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Kunlik hisobot</div>
                        <div className="text-sm text-muted-foreground">Har kuni kechqurun</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Ovozli signal</div>
                        <div className="text-sm text-muted-foreground">Oshxonada yangi buyurtmada</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Xavfsizlik sozlamalari</CardTitle>
                    <CardDescription>Tizim xavfsizligini boshqarish</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Parolni o&apos;zgartirish</h4>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Joriy parol</Label>
                          <Input type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label>Yangi parol</Label>
                          <Input type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label>Parolni tasdiqlash</Label>
                          <Input type="password" />
                        </div>
                      </div>
                      <Button>Parolni yangilash</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Ikki bosqichli autentifikatsiya</div>
                        <div className="text-sm text-muted-foreground">Qo&apos;shimcha xavfsizlik</div>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Avtomatik chiqish</div>
                        <div className="text-sm text-muted-foreground">30 daqiqa harakatsiz bo&apos;lganda</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Ko&apos;rinish sozlamalari</CardTitle>
                    <CardDescription>Interfeys ko&apos;rinishini moslashtirish</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Qorong&apos;i rejim</div>
                        <div className="text-sm text-muted-foreground">Tungi ko&apos;rinish</div>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Ixcham sidebar</div>
                        <div className="text-sm text-muted-foreground">Faqat ikonkalarni ko&apos;rsatish</div>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Animatsiyalar</div>
                        <div className="text-sm text-muted-foreground">Interfeys animatsiyalari</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
