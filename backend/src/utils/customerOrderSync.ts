/**
 * Customer Order Sync Utility
 * Restoran backend dan mijoz backend ga status yangilanishlarini yuborish
 */

const CUSTOMER_API_URL = process.env.CUSTOMER_API_URL || 'http://localhost:3000/api/orders'

interface StatusUpdatePayload {
  status: string
}

/**
 * Mijoz buyurtmasini yangilash
 */
export async function syncCustomerOrderStatus(
  customerOrderId: string,
  newStatus: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🔄 Syncing customer order:', { customerOrderId, newStatus })

    // Map restaurant statuses to customer statuses
    const statusMap: Record<string, string> = {
      'new': 'confirmed',
      'accepted': 'confirmed',
      'preparing': 'preparing',
      'ready': 'ready',
      'delivering': 'ready',
      'delivered': 'completed',
      'cancelled': 'cancelled',
    }

    const customerStatus = statusMap[newStatus] || newStatus

    const response = await fetch(`${CUSTOMER_API_URL}/${customerOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: customerStatus }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to sync customer order:', errorText)
      return {
        success: false,
        message: `Failed to sync: ${response.status} ${errorText}`,
      }
    }

    const result = await response.json()
    console.log('✅ Customer order synced successfully:', result)

    return {
      success: true,
      message: 'Customer order synced',
    }
  } catch (error: any) {
    console.error('❌ Error syncing customer order:', error.message)
    return {
      success: false,
      message: error.message,
    }
  }
}

/**
 * Batch sync - bir nechta buyurtmalarni yangilash
 */
export async function syncMultipleOrders(
  orders: Array<{ customerOrderId: string; status: string }>
): Promise<void> {
  const promises = orders.map(({ customerOrderId, status }) =>
    syncCustomerOrderStatus(customerOrderId, status)
  )

  await Promise.allSettled(promises)
}
