import Order from '../models/Order'
import Recipe from '../models/Recipe'
import Inventory from '../models/Inventory'
import InventoryTransaction from '../models/InventoryTransaction'
import mongoose from 'mongoose'

/**
 * AVTOMATIK HISOBDAN CHIQARISH XIZMATI
 * 
 * Bu xizmat buyurtma yopilganda (completed) avtomatik ravishda
 * ombor mahsulotlarini kamaytiradi va tranzaksiya yaratadi.
 */

interface WriteOffResult {
  success: boolean
  message: string
  transactions?: any[]
  errors?: string[]
}

/**
 * Buyurtma uchun avtomatik hisobdan chiqarish
 */
export const autoWriteOffForOrder = async (
  orderId: string,
  performedBy: mongoose.Types.ObjectId
): Promise<WriteOffResult> => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // 1. Buyurtmani olish
    const order = await Order.findById(orderId).session(session)
    if (!order) {
      await session.abortTransaction()
      return {
        success: false,
        message: 'Buyurtma topilmadi',
      }
    }

    // 2. Faqat completed buyurtmalar uchun
    if (order.status !== 'completed') {
      await session.abortTransaction()
      return {
        success: false,
        message: 'Faqat yopilgan buyurtmalar uchun hisobdan chiqarish mumkin',
      }
    }

    const transactions: any[] = []
    const errors: string[] = []

    // 3. Har bir taom uchun
    for (const item of order.items) {
      const menuItemId = item.menuItem || item.menuItemId

      if (!menuItemId) {
        errors.push(`Taom ID topilmadi: ${item.name || item.menuItemName}`)
        continue
      }

      // 4. Texnologik kartani topish
      const recipe = await Recipe.findOne({ menuItem: menuItemId })
        .populate('ingredients.inventoryItem')
        .session(session)

      if (!recipe) {
        errors.push(
          `Texnologik karta topilmadi: ${item.name || item.menuItemName}`
        )
        continue
      }

      // 5. Har bir ingredient uchun
      for (const ingredient of recipe.ingredients) {
        const inventoryItem = await Inventory.findById(
          ingredient.inventoryItem
        ).session(session)

        if (!inventoryItem) {
          errors.push(
            `Ombor mahsuloti topilmadi: ${ingredient.inventoryItem}`
          )
          continue
        }

        // 6. Kerakli miqdorni hisoblash (porsiya * ingredient miqdori)
        const totalQuantity = item.quantity * ingredient.quantity

        // 7. Omborda yetarli mahsulot borligini tekshirish
        if (inventoryItem.quantity < totalQuantity) {
          errors.push(
            `${inventoryItem.name} yetarli emas. Kerak: ${totalQuantity}${ingredient.unit}, Bor: ${inventoryItem.quantity}${inventoryItem.unit}`
          )
          continue
        }

        // 8. Balansni saqlash
        const balanceBefore = inventoryItem.quantity

        // 9. Ombor mahsulotini kamaytirish
        inventoryItem.quantity -= totalQuantity
        await inventoryItem.save({ session })

        // 10. Tranzaksiya yaratish
        const transaction = await InventoryTransaction.create(
          [
            {
              inventoryItem: inventoryItem._id,
              type: 'write-off',
              quantity: -totalQuantity, // Manfiy qiymat (chiqim)
              unit: ingredient.unit,
              order: order._id,
              reason: `Buyurtma #${order._id.toString().slice(-6)} uchun avtomatik hisobdan chiqarish`,
              balanceBefore,
              balanceAfter: inventoryItem.quantity,
              performedBy,
            },
          ],
          { session }
        )

        transactions.push(transaction[0])
      }
    }

    // 11. Agar xatoliklar bo'lsa, rollback
    if (errors.length > 0) {
      await session.abortTransaction()
      return {
        success: false,
        message: 'Hisobdan chiqarishda xatoliklar',
        errors,
      }
    }

    // 12. Commit
    await session.commitTransaction()

    return {
      success: true,
      message: `${transactions.length} ta mahsulot hisobdan chiqarildi`,
      transactions,
    }
  } catch (error: any) {
    await session.abortTransaction()
    console.error('❌ Auto write-off error:', error)
    return {
      success: false,
      message: error.message || 'Hisobdan chiqarishda xatolik',
    }
  } finally {
    session.endSession()
  }
}

/**
 * Buyurtma yopilishidan oldin mahsulot yetarliligini tekshirish
 */
export const checkInventoryAvailability = async (
  orderId: string
): Promise<{ available: boolean; missing: string[] }> => {
  try {
    const order = await Order.findById(orderId)
    if (!order) {
      return { available: false, missing: ['Buyurtma topilmadi'] }
    }

    const missing: string[] = []

    for (const item of order.items) {
      const menuItemId = item.menuItem || item.menuItemId
      if (!menuItemId) continue

      const recipe = await Recipe.findOne({ menuItem: menuItemId }).populate(
        'ingredients.inventoryItem'
      )

      if (!recipe) {
        missing.push(
          `Texnologik karta yo'q: ${item.name || item.menuItemName}`
        )
        continue
      }

      for (const ingredient of recipe.ingredients) {
        const inventoryItem = await Inventory.findById(
          ingredient.inventoryItem
        )
        if (!inventoryItem) continue

        const totalQuantity = item.quantity * ingredient.quantity

        if (inventoryItem.quantity < totalQuantity) {
          missing.push(
            `${inventoryItem.name}: kerak ${totalQuantity}${ingredient.unit}, bor ${inventoryItem.quantity}${inventoryItem.unit}`
          )
        }
      }
    }

    return {
      available: missing.length === 0,
      missing,
    }
  } catch (error: any) {
    console.error('❌ Check inventory error:', error)
    return {
      available: false,
      missing: ['Tekshirishda xatolik: ' + error.message],
    }
  }
}

/**
 * Manual hisobdan chiqarish (eski funksiya uchun)
 */
export const manualWriteOff = async (
  inventoryItemId: string,
  quantity: number,
  reason: string,
  performedBy: mongoose.Types.ObjectId
): Promise<WriteOffResult> => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const inventoryItem = await Inventory.findById(inventoryItemId).session(
      session
    )

    if (!inventoryItem) {
      await session.abortTransaction()
      return {
        success: false,
        message: 'Mahsulot topilmadi',
      }
    }

    if (inventoryItem.quantity < quantity) {
      await session.abortTransaction()
      return {
        success: false,
        message: 'Mahsulot yetarli emas',
      }
    }

    const balanceBefore = inventoryItem.quantity
    inventoryItem.quantity -= quantity
    await inventoryItem.save({ session })

    const transaction = await InventoryTransaction.create(
      [
        {
          inventoryItem: inventoryItem._id,
          type: 'write-off',
          quantity: -quantity,
          unit: inventoryItem.unit,
          reason,
          balanceBefore,
          balanceAfter: inventoryItem.quantity,
          performedBy,
        },
      ],
      { session }
    )

    await session.commitTransaction()

    return {
      success: true,
      message: 'Mahsulot hisobdan chiqarildi',
      transactions: [transaction[0]],
    }
  } catch (error: any) {
    await session.abortTransaction()
    return {
      success: false,
      message: error.message || 'Xatolik',
    }
  } finally {
    session.endSession()
  }
}
