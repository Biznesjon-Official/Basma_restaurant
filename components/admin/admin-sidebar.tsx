'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Users,
  Package,
  Settings,
  LogOut,
  ChefHat,
  Armchair,
  BarChart3,
  DollarSign,
  UserCheck,
  Activity,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// RBAC: Menu items by role
const menuByRole = {
  admin: {
    main: [
      { title: 'Dashboard', icon: LayoutDashboard, href: '/' },
      { title: 'Buyurtmalar', icon: ClipboardList, href: '/orders' },
      { title: 'Stollar', icon: Armchair, href: '/tables' },
      { title: 'Oshxona (KDS)', icon: ChefHat, href: '/kitchen' },
    ],
    analytics: [
      { title: 'Kassa', icon: DollarSign, href: '/cash-register' },
      { title: 'Hisobotlar', icon: BarChart3, href: '/reports' },
      { title: 'Chiqimlar', icon: DollarSign, href: '/expenses' },
      { title: 'Mijozlar (CRM)', icon: UserCheck, href: '/customers' },
      { title: 'Faoliyat loglari', icon: Activity, href: '/activity-logs' },
    ],
    management: [
      { title: 'Menyu', icon: UtensilsCrossed, href: '/menu' },
      { title: 'Ombor', icon: Package, href: '/inventory' },
      { title: 'Xodimlar', icon: Users, href: '/staff' },
      { title: 'Sozlamalar', icon: Settings, href: '/settings' },
    ],
  },
  waiter: {
    main: [
      { title: 'Mening Stollarim', icon: Armchair, href: '/waiter' },
    ],
    analytics: [],
    management: [],
  },
  chef: {
    main: [
      { title: 'Oshxona (KDS)', icon: ChefHat, href: '/kitchen' },
    ],
    analytics: [],
    management: [],
  },
  storekeeper: {
    main: [
      { title: 'Ombor', icon: Package, href: '/storekeeper' },
      { title: 'Texnologik Kartalar', icon: UtensilsCrossed, href: '/storekeeper/recipes' },
    ],
    analytics: [
      { title: 'Hisobotlar', icon: BarChart3, href: '/storekeeper/reports' },
      { title: 'Inventarizatsiya', icon: Activity, href: '/storekeeper/audit' },
    ],
    management: [],
  },
  cashier: {
    main: [
      { title: 'Kassir Paneli', icon: DollarSign, href: '/cashier' },
      { title: 'Kassa', icon: DollarSign, href: '/cash-register' },
      { title: 'Buyurtmalar', icon: ClipboardList, href: '/orders' },
      { title: 'Stollar', icon: Armchair, href: '/tables' },
    ],
    analytics: [
      { title: 'Kunlik Hisobot', icon: BarChart3, href: '/reports' },
    ],
    management: [],
  },
}

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  // RBAC: Get menu items based on user role
  const userRole = user?.role || 'waiter'
  const menuItems = menuByRole[userRole as keyof typeof menuByRole] || menuByRole.waiter

  return (
    <Sidebar collapsible="icon" className="border-r-0 [&_[data-sidebar=content]]:scrollbar-hide">
      <SidebarHeader className="p-4">
        <Link href={userRole === 'waiter' ? '/waiter' : '/'} className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <ChefHat className="size-6" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-base font-bold tracking-tight">BASMA</span>
            <span className="text-xs text-sidebar-foreground/70">Osh Markazi</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="scrollbar-hide overflow-y-auto">
        {/* Main Menu */}
        {menuItems.main.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Asosiy</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.main.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Analytics Menu - Only for admin */}
        {menuItems.analytics.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Analitika</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.analytics.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Management Menu - Only for admin */}
        {menuItems.management.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Boshqaruv</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.management.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarSeparator className="mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-auto py-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {user ? getInitials(user.fullName) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium">{user?.fullName || 'Foydalanuvchi'}</span>
                <span className="text-xs text-sidebar-foreground/70 capitalize">{user?.role || 'waiter'}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              tooltip="Chiqish" 
              className="text-destructive hover:text-destructive cursor-pointer"
            >
              <LogOut className="size-4" />
              <span>Chiqish</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
