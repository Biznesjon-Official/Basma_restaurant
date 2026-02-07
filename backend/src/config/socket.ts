import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

let io: SocketIOServer | null = null

export const initializeSocket = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id)

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id)
    })

    // Placeholder events
    socket.on('order:subscribe', (tableNumber) => {
      socket.join(`table:${tableNumber}`)
      console.log(`Socket ${socket.id} subscribed to table ${tableNumber}`)
    })

    socket.on('kitchen:subscribe', () => {
      socket.join('kitchen')
      console.log(`Socket ${socket.id} subscribed to kitchen`)
    })

    // Waiter subscription
    socket.on('waiter:subscribe', () => {
      socket.join('waiters')
      console.log(`Socket ${socket.id} subscribed to waiters`)
    })

    // Marketplace orders subscription
    socket.on('marketplace:subscribe', () => {
      socket.join('marketplace')
      console.log(`Socket ${socket.id} subscribed to marketplace`)
    })
  })

  return io
}

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io not initialized')
  }
  return io
}

// Helper functions for emitting events
export const emitNewOrder = (order: any) => {
  if (io) {
    io.to('kitchen').emit('order:new', order)
    io.to(`table:${order.tableNumber}`).emit('order:new', order)
  }
}

export const emitOrderReady = (order: any) => {
  if (io) {
    io.to(`table:${order.tableNumber}`).emit('order:ready', order)
  }
}

export const emitOrderStatusUpdate = (order: any) => {
  if (io) {
    io.to('kitchen').emit('order:status', order)
    io.to(`table:${order.tableNumber}`).emit('order:status', order)
  }
}

// Waiter call events
export const emitWaiterCall = (call: any) => {
  if (io) {
    io.to('waiters').emit('waiter:call', call)
    console.log('🔔 Waiter call emitted:', call.tableNumber)
  }
}

export const emitWaiterCallResponded = (call: any) => {
  if (io) {
    io.to('waiters').emit('waiter:call-responded', call)
    console.log('✅ Waiter call responded:', call.tableNumber)
  }
}

export const emitWaiterCallCompleted = (call: any) => {
  if (io) {
    io.to('waiters').emit('waiter:call-completed', call)
    console.log('✅ Waiter call completed:', call.tableNumber)
  }
}

// Marketplace order events
export const emitMarketplaceOrder = (order: any) => {
  if (io) {
    io.to('marketplace').emit('marketplace:order', order)
    io.to('waiters').emit('marketplace:order', order)
    console.log('📦 Marketplace order emitted:', order._id)
  }
}

export const emitMarketplaceOrderUpdate = (order: any) => {
  if (io) {
    io.to('marketplace').emit('marketplace:order-update', order)
    io.to('waiters').emit('marketplace:order-update', order)
    console.log('🔄 Marketplace order updated:', order._id)
  }
}
