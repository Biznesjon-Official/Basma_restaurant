import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('✅ Socket.io connected:', socket?.id)
    })

    socket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error)
    })
  }

  return socket
}

export const connectSocket = () => {
  const socket = getSocket()
  if (!socket.connected) {
    socket.connect()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect()
  }
}

// Event emitters
export const emitNewOrder = (order: any) => {
  const socket = getSocket()
  if (socket.connected) {
    socket.emit('order:new', order)
    console.log('📤 Emitted order:new', order._id)
  }
}

export const emitOrderStatusUpdate = (order: any) => {
  const socket = getSocket()
  if (socket.connected) {
    socket.emit('order:status', order)
    console.log('📤 Emitted order:status', order._id, order.status)
  }
}

export const emitLowStock = (item: any) => {
  const socket = getSocket()
  if (socket.connected) {
    socket.emit('inventory:low-stock', item)
    console.log('📤 Emitted inventory:low-stock', item.name)
  }
}

// Event listeners
export const onNewOrder = (callback: (order: any) => void) => {
  const socket = getSocket()
  socket.on('order:new', callback)
  return () => socket.off('order:new', callback)
}

export const onKitchenNewOrder = (callback: (order: any) => void) => {
  const socket = getSocket()
  socket.on('kitchen:new-order', callback)
  return () => socket.off('kitchen:new-order', callback)
}

export const onOrderStatusUpdate = (callback: (order: any) => void) => {
  const socket = getSocket()
  socket.on('order:status', callback)
  return () => socket.off('order:status', callback)
}

export const onLowStock = (callback: (item: any) => void) => {
  const socket = getSocket()
  socket.on('inventory:low-stock', callback)
  return () => socket.off('inventory:low-stock', callback)
}

export const onDashboardUpdate = (callback: (data: any) => void) => {
  const socket = getSocket()
  socket.on('dashboard:update', callback)
  return () => socket.off('dashboard:update', callback)
}

// Marketplace order events
export const onMarketplaceOrderCreated = (callback: (order: any) => void) => {
  const socket = getSocket()
  socket.on('marketplace-order-created', callback)
  return () => socket.off('marketplace-order-created', callback)
}

export const onMarketplaceOrderAccepted = (callback: (order: any) => void) => {
  const socket = getSocket()
  socket.on('marketplace-order-accepted', callback)
  return () => socket.off('marketplace-order-accepted', callback)
}

export const onMarketplaceOrderUpdated = (callback: (order: any) => void) => {
  const socket = getSocket()
  socket.on('marketplace-order-updated', callback)
  return () => socket.off('marketplace-order-updated', callback)
}

export const onMarketplaceOrderCancelled = (callback: (order: any) => void) => {
  const socket = getSocket()
  socket.on('marketplace-order-cancelled', callback)
  return () => socket.off('marketplace-order-cancelled', callback)
}
