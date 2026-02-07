// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// API Error Handler
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'APIError'
  }
}

// Generic fetch wrapper
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  console.log('🌐 API Request:', {
    endpoint: `${API_URL}${endpoint}`,
    method: options.method || 'GET',
    hasToken: !!token,
  })

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  console.log('📥 API Response:', {
    endpoint,
    status: response.status,
    ok: response.ok,
    data,
  })

  if (!response.ok) {
    // Handle 401 errors - redirect to login
    if (response.status === 401) {
      console.error('🔒 Authentication failed, clearing token and redirecting to login')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    
    // Handle 403 errors - permission denied
    if (response.status === 403) {
      // Silent for role-specific endpoints (expected for other roles)
      const silentEndpoints = [
        '/analytics/', 
        '/tables', 
        '/users', 
        '/staff', 
        '/settings', 
        '/expenses', 
        '/incomes',
        '/chef/',
        '/waiter/',
        '/cashier/',
        '/storekeeper/'
      ]
      const isSilent = silentEndpoints.some(ep => endpoint.includes(ep))
      
      if (!isSilent) {
        console.error('🚫 Permission denied:', endpoint)
      }
      // Don't redirect, just throw error
      // Component will handle it
    }
    
    // Handle 429 errors - rate limiting (silent)
    if (response.status === 429) {
      // Silent - just throw error, component will handle
      console.warn('⏱️ Rate limit exceeded, slowing down requests')
    }
    
    throw new APIError(response.status, data.error || 'API Error')
  }

  return data
}

// Auth API
export const authAPI = {
  login: (phone: string, password: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    }),

  getProfile: () => apiFetch('/auth/profile'),
}

// Menu API
export const menuAPI = {
  getAll: (params?: { page?: number; limit?: number; category?: string; available?: boolean }) => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.category) query.append('category', params.category)
    if (params?.available !== undefined) query.append('available', params.available.toString())
    
    return apiFetch(`/menu?${query}`)
  },

  create: (data: any) =>
    apiFetch('/menu', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiFetch(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/menu/${id}`, {
      method: 'DELETE',
    }),
}

// Users API
export const usersAPI = {
  getAll: (params?: { page?: number; limit?: number; role?: string; isActive?: boolean }) => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.role) query.append('role', params.role)
    if (params?.isActive !== undefined) query.append('isActive', params.isActive.toString())
    
    return apiFetch(`/users?${query}`)
  },

  create: (data: any) =>
    apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiFetch(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/users/${id}`, {
      method: 'DELETE',
    }),

  toggleStatus: (id: string) =>
    apiFetch(`/users/${id}/toggle-status`, {
      method: 'PATCH',
    }),
}

// Tables API
export const tablesAPI = {
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : ''
    return apiFetch(`/tables${query}`)
  },

  create: (data: any) =>
    apiFetch('/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiFetch(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  regenerateQrCode: (id: string) =>
    apiFetch(`/tables/${id}/regenerate-qr`, {
      method: 'POST',
    }),

  getQrCodeData: (id: string) => apiFetch(`/tables/${id}/qr-data`),

  getQrCodeImage: (id: string) => {
    const token = getToken()
    return `${API_URL}/tables/${id}/qr-image?token=${token}`
  },

  getQrCodeSvg: (id: string) => {
    const token = getToken()
    return `${API_URL}/tables/${id}/qr-svg?token=${token}`
  },
}

// Orders API
export const ordersAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string; paymentStatus?: string; tableNumber?: number }) => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.status) query.append('status', params.status)
    if (params?.paymentStatus) query.append('paymentStatus', params.paymentStatus)
    if (params?.tableNumber) query.append('tableNumber', params.tableNumber.toString())
    
    return apiFetch(`/orders?${query}`)
  },

  getById: (id: string) => apiFetch(`/orders/${id}`),

  create: (data: any) =>
    apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string) =>
    apiFetch(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
}

// Inventory API
export const inventoryAPI = {
  getAll: (params?: { page?: number; limit?: number; lowStock?: boolean }) => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.lowStock) query.append('lowStock', 'true')
    
    return apiFetch(`/inventory?${query}`)
  },

  create: (data: any) =>
    apiFetch('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiFetch(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Analytics API
export const analyticsAPI = {
  getRevenue: (params?: { period?: string; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams()
    if (params?.period) query.append('period', params.period)
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    return apiFetch(`/analytics/revenue?${query}`)
  },

  getTopSelling: (params?: { limit?: number; period?: string }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.period) query.append('period', params.period)
    return apiFetch(`/analytics/top-selling?${query}`)
  },

  getLowPerforming: (params?: { limit?: number; period?: string }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.period) query.append('period', params.period)
    return apiFetch(`/analytics/low-performing?${query}`)
  },

  getStaffPerformance: (params?: { period?: string }) => {
    const query = new URLSearchParams()
    if (params?.period) query.append('period', params.period)
    return apiFetch(`/analytics/staff-performance?${query}`)
  },

  getExpenseAnalytics: (params?: { period?: string }) => {
    const query = new URLSearchParams()
    if (params?.period) query.append('period', params.period)
    return apiFetch(`/analytics/expenses?${query}`)
  },

  getDashboard: () => apiFetch('/analytics/dashboard'),
}

// Expenses API
export const expensesAPI = {
  getAll: (params?: { page?: number; limit?: number; category?: string; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.category) query.append('category', params.category)
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    return apiFetch(`/expenses?${query}`)
  },

  create: (data: any) =>
    apiFetch('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiFetch(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/expenses/${id}`, {
      method: 'DELETE',
    }),
}

// Incomes API
export const incomesAPI = {
  getAll: (params?: { limit?: number; category?: string; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.category) query.append('category', params.category)
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    return apiFetch(`/incomes?${query}`)
  },

  create: (data: any) =>
    apiFetch('/incomes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiFetch(`/incomes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/incomes/${id}`, {
      method: 'DELETE',
    }),
}

// Customers API
export const customersAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; isVIP?: boolean }) => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.search) query.append('search', params.search)
    if (params?.isVIP !== undefined) query.append('isVIP', params.isVIP.toString())
    return apiFetch(`/customers?${query}`)
  },

  getTop: (params?: { limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.append('limit', params.limit.toString())
    return apiFetch(`/customers/top?${query}`)
  },

  getById: (id: string) => apiFetch(`/customers/${id}`),

  create: (data: any) =>
    apiFetch('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiFetch(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Settings API
export const settingsAPI = {
  get: () => apiFetch('/settings'),

  update: (data: any) =>
    apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Activity Logs API
export const activityLogsAPI = {
  getAll: (params?: { page?: number; limit?: number; action?: string; entity?: string; userId?: string }) => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.action) query.append('action', params.action)
    if (params?.entity) query.append('entity', params.entity)
    if (params?.userId) query.append('userId', params.userId)
    return apiFetch(`/activity-logs?${query}`)
  },
}

// Waiter API
export const waiterAPI = {
  // Get my tables
  getMyTables: () => apiFetch('/waiter/tables'),

  // Get my orders
  getMyOrders: (params?: { status?: string }) => {
    const query = new URLSearchParams()
    if (params?.status) query.append('status', params.status)
    return apiFetch(`/waiter/orders?${query}`)
  },

  // Get available menu
  getMenu: (params?: { category?: string }) => {
    const query = new URLSearchParams()
    if (params?.category) query.append('category', params.category)
    return apiFetch(`/waiter/menu?${query}`)
  },

  // Create new order
  createOrder: (data: any) =>
    apiFetch('/waiter/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Add items to order
  addItems: (orderId: string, data: any) =>
    apiFetch(`/waiter/orders/${orderId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Submit order to kitchen
  submitToKitchen: (orderId: string) =>
    apiFetch(`/waiter/orders/${orderId}/submit`, {
      method: 'POST',
    }),

  // Mark order as served (ready for cashier)
  markAsServed: (orderId: string) =>
    apiFetch(`/waiter/orders/${orderId}/served`, {
      method: 'POST',
    }),
}

// Chef API
export const chefAPI = {
  // Get kitchen orders (KDS)
  getKitchenOrders: (params?: { status?: string }) => {
    const query = new URLSearchParams()
    if (params?.status) query.append('status', params.status)
    return apiFetch(`/chef/orders?${query}`)
  },

  // Update order status (preparing -> ready)
  updateOrderStatus: (orderId: string, status: string) =>
    apiFetch(`/chef/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
}

// Storekeeper API
export const storekeeperAPI = {
  // Recipes
  getRecipes: () => apiFetch('/storekeeper/recipes'),
  
  getRecipeByMenuItem: (menuItemId: string) =>
    apiFetch(`/storekeeper/recipes/menu/${menuItemId}`),
  
  createRecipe: (data: any) =>
    apiFetch('/storekeeper/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateRecipe: (id: string, data: any) =>
    apiFetch(`/storekeeper/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteRecipe: (id: string) =>
    apiFetch(`/storekeeper/recipes/${id}`, {
      method: 'DELETE',
    }),

  // Inventory
  receiveInventory: (data: any) =>
    apiFetch('/storekeeper/inventory/receive', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getLowStockItems: () => apiFetch('/storekeeper/inventory/low-stock'),
  
  updateMinQuantity: (id: string, minQuantity: number) =>
    apiFetch(`/storekeeper/inventory/${id}/min-quantity`, {
      method: 'PUT',
      body: JSON.stringify({ minQuantity }),
    }),

  // Audit
  performAudit: (data: any) =>
    apiFetch('/storekeeper/inventory/audit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getAuditHistory: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    return apiFetch(`/storekeeper/inventory/audit-history?${query}`)
  },

  // Reports
  getTransactions: (params?: {
    type?: string
    startDate?: string
    endDate?: string
    inventoryItemId?: string
    limit?: number
  }) => {
    const query = new URLSearchParams()
    if (params?.type) query.append('type', params.type)
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    if (params?.inventoryItemId) query.append('inventoryItemId', params.inventoryItemId)
    if (params?.limit) query.append('limit', params.limit.toString())
    return apiFetch(`/storekeeper/inventory/transactions?${query}`)
  },
  
  getInventoryReport: (params?: {
    startDate?: string
    endDate?: string
    type?: string
  }) => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    if (params?.type) query.append('type', params.type)
    return apiFetch(`/storekeeper/inventory/report?${query}`)
  },
  
  getCostAnalysis: (params?: {
    startDate?: string
    endDate?: string
    limit?: number
  }) => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    if (params?.limit) query.append('limit', params.limit.toString())
    return apiFetch(`/storekeeper/inventory/cost-analysis?${query}`)
  },
}

// Cashier API
export const cashierAPI = {
  // Get orders ready for payment
  getOrdersForPayment: (params?: { limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.append('limit', params.limit.toString())
    return apiFetch(`/cashier/orders?${query}`)
  },

  // Process payment
  processPayment: (orderId: string, paymentType: 'cash' | 'card' | 'online') =>
    apiFetch(`/cashier/orders/${orderId}/payment`, {
      method: 'POST',
      body: JSON.stringify({ paymentType }),
    }),

  // Get cashier statistics
  getStats: () => apiFetch('/cashier/stats'),
}
