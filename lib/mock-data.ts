// BASMA Osh Markazi - Mock Data

export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  cost: number
  image?: string
  available: boolean
  preparationTime: number // minutes
}

export interface Category {
  id: string
  name: string
  icon: string
  itemCount: number
}

export interface Order {
  id: string
  tableNumber: number
  items: { menuItem: MenuItem; quantity: number; notes?: string }[]
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid'
  waiter: string
  createdAt: Date
  totalAmount: number
}

export interface Table {
  id: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved' | 'cleaning'
  currentOrder?: string
}

export interface Staff {
  id: string
  name: string
  role: 'admin' | 'waiter' | 'chef' | 'storekeeper' | 'cashier'
  phone: string
  avatar?: string
  status: 'active' | 'inactive'
  shift: 'morning' | 'evening' | 'night'
}

export interface InventoryItem {
  id: string
  name: string
  unit: string
  quantity: number
  minQuantity: number
  price: number
  lastUpdated: Date
  supplier?: string
}

export const categories: Category[] = [
  { id: '1', name: 'Osh', icon: '🍚', itemCount: 8 },
  { id: '2', name: 'Sho\'rva', icon: '🍜', itemCount: 5 },
  { id: '3', name: 'Kabob', icon: '🍖', itemCount: 12 },
  { id: '4', name: 'Salat', icon: '🥗', itemCount: 7 },
  { id: '5', name: 'Ichimlik', icon: '🥤', itemCount: 15 },
  { id: '6', name: 'Shirinlik', icon: '🍰', itemCount: 6 },
]

export const menuItems: MenuItem[] = [
  { id: '1', name: 'Samarqand oshi', category: 'Osh', price: 45000, cost: 22000, available: true, preparationTime: 25 },
  { id: '2', name: 'Toshkent oshi', category: 'Osh', price: 42000, cost: 20000, available: true, preparationTime: 25 },
  { id: '3', name: 'Buxoro oshi', category: 'Osh', price: 48000, cost: 24000, available: true, preparationTime: 30 },
  { id: '4', name: 'To\'y oshi', category: 'Osh', price: 55000, cost: 28000, available: true, preparationTime: 35 },
  { id: '5', name: 'Mastava', category: 'Sho\'rva', price: 28000, cost: 12000, available: true, preparationTime: 15 },
  { id: '6', name: 'Lag\'mon', category: 'Sho\'rva', price: 32000, cost: 14000, available: true, preparationTime: 20 },
  { id: '7', name: 'Shurpa', category: 'Sho\'rva', price: 35000, cost: 16000, available: true, preparationTime: 25 },
  { id: '8', name: 'Qo\'y kabob', category: 'Kabob', price: 18000, cost: 9000, available: true, preparationTime: 15 },
  { id: '9', name: 'Mol kabob', category: 'Kabob', price: 16000, cost: 8000, available: true, preparationTime: 15 },
  { id: '10', name: 'Jigar kabob', category: 'Kabob', price: 14000, cost: 7000, available: true, preparationTime: 12 },
  { id: '11', name: 'Tovuq kabob', category: 'Kabob', price: 12000, cost: 5000, available: true, preparationTime: 12 },
  { id: '12', name: 'Achichuk', category: 'Salat', price: 15000, cost: 5000, available: true, preparationTime: 5 },
  { id: '13', name: 'Shakarob', category: 'Salat', price: 12000, cost: 4000, available: true, preparationTime: 5 },
  { id: '14', name: 'Coca-Cola', category: 'Ichimlik', price: 8000, cost: 4000, available: true, preparationTime: 1 },
  { id: '15', name: 'Fanta', category: 'Ichimlik', price: 8000, cost: 4000, available: true, preparationTime: 1 },
  { id: '16', name: 'Kompot', category: 'Ichimlik', price: 6000, cost: 2000, available: true, preparationTime: 2 },
  { id: '17', name: 'Choy (choynak)', category: 'Ichimlik', price: 10000, cost: 2000, available: true, preparationTime: 5 },
  { id: '18', name: 'Halvo', category: 'Shirinlik', price: 15000, cost: 8000, available: true, preparationTime: 2 },
  { id: '19', name: 'Chak-chak', category: 'Shirinlik', price: 18000, cost: 9000, available: true, preparationTime: 2 },
]

export const tables: Table[] = [
  { id: '1', number: 1, capacity: 4, status: 'occupied', currentOrder: 'ORD001' },
  { id: '2', number: 2, capacity: 4, status: 'available' },
  { id: '3', number: 3, capacity: 6, status: 'occupied', currentOrder: 'ORD002' },
  { id: '4', number: 4, capacity: 2, status: 'reserved' },
  { id: '5', number: 5, capacity: 8, status: 'available' },
  { id: '6', number: 6, capacity: 4, status: 'occupied', currentOrder: 'ORD003' },
  { id: '7', number: 7, capacity: 4, status: 'cleaning' },
  { id: '8', number: 8, capacity: 6, status: 'available' },
  { id: '9', number: 9, capacity: 4, status: 'occupied', currentOrder: 'ORD004' },
  { id: '10', number: 10, capacity: 10, status: 'reserved' },
  { id: '11', number: 11, capacity: 4, status: 'available' },
  { id: '12', number: 12, capacity: 4, status: 'available' },
]

export const orders: Order[] = [
  {
    id: 'ORD001',
    tableNumber: 1,
    items: [
      { menuItem: menuItems[0], quantity: 2 },
      { menuItem: menuItems[11], quantity: 1 },
      { menuItem: menuItems[16], quantity: 1 },
    ],
    status: 'preparing',
    waiter: 'Akmal',
    createdAt: new Date(Date.now() - 15 * 60000),
    totalAmount: 115000,
  },
  {
    id: 'ORD002',
    tableNumber: 3,
    items: [
      { menuItem: menuItems[2], quantity: 3 },
      { menuItem: menuItems[7], quantity: 4 },
      { menuItem: menuItems[13], quantity: 3 },
    ],
    status: 'ready',
    waiter: 'Sardor',
    createdAt: new Date(Date.now() - 25 * 60000),
    totalAmount: 240000,
  },
  {
    id: 'ORD003',
    tableNumber: 6,
    items: [
      { menuItem: menuItems[5], quantity: 2 },
      { menuItem: menuItems[8], quantity: 3 },
      { menuItem: menuItems[14], quantity: 2 },
    ],
    status: 'pending',
    waiter: 'Dilshod',
    createdAt: new Date(Date.now() - 5 * 60000),
    totalAmount: 128000,
  },
  {
    id: 'ORD004',
    tableNumber: 9,
    items: [
      { menuItem: menuItems[3], quantity: 1 },
      { menuItem: menuItems[6], quantity: 1 },
      { menuItem: menuItems[17], quantity: 2 },
    ],
    status: 'served',
    waiter: 'Akmal',
    createdAt: new Date(Date.now() - 45 * 60000),
    totalAmount: 120000,
  },
]

export const staff: Staff[] = [
  { id: '1', name: 'Akmal Karimov', role: 'admin', phone: '+998901234567', status: 'active', shift: 'morning' },
  { id: '3', name: 'Dilshod Rahimov', role: 'waiter', phone: '+998901234569', status: 'active', shift: 'morning' },
  { id: '4', name: 'Bobur Toshmatov', role: 'waiter', phone: '+998901234570', status: 'active', shift: 'evening' },
  { id: '5', name: 'Jasur Qodirov', role: 'chef', phone: '+998901234571', status: 'active', shift: 'morning' },
  { id: '6', name: 'Anvar Saidov', role: 'chef', phone: '+998901234572', status: 'active', shift: 'evening' },
  { id: '7', name: 'Malika Umarova', role: 'storekeeper', phone: '+998901234573', status: 'active', shift: 'morning' },
  { id: '8', name: 'Nodira Karimova', role: 'waiter', phone: '+998901234574', status: 'inactive', shift: 'night' },
]

export const inventory: InventoryItem[] = [
  { id: '1', name: 'Guruch (Laser)', unit: 'kg', quantity: 150, minQuantity: 50, price: 22000, lastUpdated: new Date(), supplier: 'Agro Markaz' },
  { id: '2', name: 'Qo\'y go\'shti', unit: 'kg', quantity: 45, minQuantity: 20, price: 95000, lastUpdated: new Date(), supplier: 'Go\'sht Savdo' },
  { id: '3', name: 'Mol go\'shti', unit: 'kg', quantity: 30, minQuantity: 15, price: 85000, lastUpdated: new Date(), supplier: 'Go\'sht Savdo' },
  { id: '4', name: 'Sabzi', unit: 'kg', quantity: 25, minQuantity: 10, price: 8000, lastUpdated: new Date(), supplier: 'Dehqon Bozori' },
  { id: '5', name: 'Piyoz', unit: 'kg', quantity: 40, minQuantity: 15, price: 5000, lastUpdated: new Date(), supplier: 'Dehqon Bozori' },
  { id: '6', name: 'Yog\' (paxta)', unit: 'litr', quantity: 35, minQuantity: 20, price: 28000, lastUpdated: new Date(), supplier: 'Yog\' Zavodi' },
  { id: '7', name: 'Tuz', unit: 'kg', quantity: 20, minQuantity: 10, price: 3000, lastUpdated: new Date(), supplier: 'Ulgurji Savdo' },
  { id: '8', name: 'Pomidor', unit: 'kg', quantity: 15, minQuantity: 10, price: 12000, lastUpdated: new Date(), supplier: 'Dehqon Bozori' },
  { id: '9', name: 'Coca-Cola (0.5L)', unit: 'dona', quantity: 120, minQuantity: 50, price: 5500, lastUpdated: new Date(), supplier: 'Coca-Cola UZ' },
  { id: '10', name: 'Non', unit: 'dona', quantity: 8, minQuantity: 20, price: 4000, lastUpdated: new Date(), supplier: 'Novvoyxona' },
]

// Dashboard stats
export const dashboardStats = {
  todayRevenue: 4850000,
  yesterdayRevenue: 4200000,
  todayOrders: 67,
  yesterdayOrders: 58,
  activeOrders: 4,
  averageOrderValue: 72388,
  popularItems: [
    { name: 'Samarqand oshi', count: 24, revenue: 1080000 },
    { name: 'Qo\'y kabob', count: 45, revenue: 810000 },
    { name: 'Toshkent oshi', count: 18, revenue: 756000 },
    { name: 'Lag\'mon', count: 22, revenue: 704000 },
    { name: 'Shurpa', count: 15, revenue: 525000 },
  ],
  revenueByHour: [
    { hour: '09:00', revenue: 180000 },
    { hour: '10:00', revenue: 250000 },
    { hour: '11:00', revenue: 420000 },
    { hour: '12:00', revenue: 680000 },
    { hour: '13:00', revenue: 850000 },
    { hour: '14:00', revenue: 620000 },
    { hour: '15:00', revenue: 350000 },
    { hour: '16:00', revenue: 280000 },
    { hour: '17:00', revenue: 320000 },
    { hour: '18:00', revenue: 450000 },
    { hour: '19:00', revenue: 580000 },
    { hour: '20:00', revenue: 720000 },
    { hour: '21:00', revenue: 550000 },
  ],
  weeklyRevenue: [
    { day: 'Dush', revenue: 3800000 },
    { day: 'Sesh', revenue: 4200000 },
    { day: 'Chor', revenue: 4500000 },
    { day: 'Pay', revenue: 5100000 },
    { day: 'Jum', revenue: 6200000 },
    { day: 'Shan', revenue: 7500000 },
    { day: 'Yak', revenue: 6800000 },
  ],
  lowStockItems: inventory.filter(item => item.quantity <= item.minQuantity),
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount).replace(/,/g, ' ') + ' so\'m'
}

// Format time ago
export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'hozirgina'
  if (diffMins < 60) return `${diffMins} daqiqa oldin`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} soat oldin`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} kun oldin`
}
