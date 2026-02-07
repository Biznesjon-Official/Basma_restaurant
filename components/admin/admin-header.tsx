'use client'

import { Bell, Search, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const notifications = [
  { id: 1, title: 'Yangi buyurtma', message: 'Stol #3 dan yangi buyurtma', time: '2 daqiqa oldin', unread: true },
  { id: 2, title: 'Kam qoldiq', message: 'Non zahirasi tugab qoldi', time: '15 daqiqa oldin', unread: true },
  { id: 3, title: 'Buyurtma tayyor', message: 'ORD002 buyurtma tayyor', time: '25 daqiqa oldin', unread: false },
]

export function AdminHeader() {
  const [isDark, setIsDark] = useState(false)
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
    
    // Client-side only date formatting
    setCurrentDate(
      new Date().toLocaleDateString('uz-UZ', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      })
    )
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark', newIsDark)
  }

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <SidebarTrigger className="-ml-2" />
      
      <div className="flex flex-1 items-center gap-4">
        <div className="relative hidden md:block md:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            className="pl-9 bg-secondary/50 border-0 focus-visible:bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground"
        >
          {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          <span className="sr-only">Mavzuni o&apos;zgartirish</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 size-5 items-center justify-center rounded-full p-0 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
              <span className="sr-only">Bildirishnomalar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Bildirishnomalar</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3">
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium">{notification.title}</span>
                  {notification.unread && (
                    <span className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{notification.message}</span>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              Hammasini ko&apos;rish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden items-center gap-3 border-l pl-4 md:flex">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">Bugun</span>
            <span className="text-xs text-muted-foreground">
              {currentDate || 'Yuklanmoqda...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
