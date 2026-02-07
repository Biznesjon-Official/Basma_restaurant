import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import Recipe from '../models/Recipe'
import Inventory from '../models/Inventory'
import InventoryTransaction from '../models/InventoryTransaction'
import MenuItem from '../models/MenuItem'
import { createActivityLog } from './activityLogController'
import { getIO } from '../config/socket'

// ==================== 5.1. TEXNOLOGIK KARTALAR ====================

// Get all recipes
export const getRecipes = async (req: AuthRequest, res: Response) => {
  try {
    const recipes = await Recipe.find()
      .populate('menuItem', 'name category')
      .populate('ingredients.inventoryItem', 'name unit')
      .sort({ createdAt: -1 })

    res.json({ success: true, data: recipes })
  } catch (error) {
    console.error('Get recipes error:', error)
    res.status(500).json({ success: false, error: 'Texnologik kartalarni olishda xatolik' })
  }
}

// Get recipe by menu item
export const getRecipeByMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const { menuItemId } = req.params

    const recipe = await Recipe.findOne({ menuItem: menuItemId })
      .populate('menuItem', 'name category price')
      .populate('ingredients.inventoryItem', 'name unit price')

    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Texnologik karta topilmadi' })
    }

    res.json({ success: true, data: recipe })
  } catch (error) {
    console.error('Get recipe error:', error)
    res.status(500).json({ success: false, error: 'Texnologik kartani olishda xatolik' })
  }
}

// Create recipe
export const createRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const { menuItemId, ingredients, portionSize, notes } = req.body
    const userId = req.user?.userId

    // Validate menu item exists
    const menuItem = await MenuItem.findById(menuItemId)
    if (!menuItem) {
      return res.status(404).json({ success: false, error: 'Taom topilmadi' })
    }

    // Check if recipe already exists
    const existingRecipe = await Recipe.findOne({ menuItem: menuItemId })
    if (existingRecipe) {
      return res.status(400).json({
        success: false,
        error: 'Bu taom uchun texnologik karta allaqachon mavjud',
      })
    }

    // Validate ingredients
    for (const ing of ingredients) {
      const inventoryItem = await Inventory.findById(ing.inventoryItem)
      if (!inventoryItem) {
        return res.status(404).json({
          success: false,
          error: `Ingredient topilmadi: ${ing.inventoryItem}`,
        })
      }
    }

    const recipe = await Recipe.create({
      menuItem: menuItemId,
      ingredients,
      portionSize: portionSize || 1,
      notes,
      createdBy: userId,
      updatedBy: userId,
    })

    await createActivityLog(
      userId!,
      'create',
      'recipe',
      recipe._id.toString(),
      { menuItem: menuItem.name },
      req.ip,
      req.get('user-agent')
    )

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('menuItem')
      .populate('ingredients.inventoryItem')

    res.status(201).json({ success: true, data: populatedRecipe })
  } catch (error) {
    console.error('Create recipe error:', error)
    res.status(500).json({ success: false, error: 'Texnologik karta yaratishda xatolik' })
  }
}

// Update recipe
export const updateRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { ingredients, portionSize, notes } = req.body
    const userId = req.user?.userId

    const recipe = await Recipe.findById(id)
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Texnologik karta topilmadi' })
    }

    // Validate ingredients if provided
    if (ingredients) {
      for (const ing of ingredients) {
        const inventoryItem = await Inventory.findById(ing.inventoryItem)
        if (!inventoryItem) {
          return res.status(404).json({
            success: false,
            error: `Ingredient topilmadi: ${ing.inventoryItem}`,
          })
        }
      }
      recipe.ingredients = ingredients
    }

    if (portionSize) recipe.portionSize = portionSize
    if (notes !== undefined) recipe.notes = notes
    recipe.updatedBy = userId as any

    await recipe.save()

    await createActivityLog(
      userId!,
      'update',
      'recipe',
      recipe._id.toString(),
      { changes: req.body },
      req.ip,
      req.get('user-agent')
    )

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('menuItem')
      .populate('ingredients.inventoryItem')

    res.json({ success: true, data: populatedRecipe })
  } catch (error) {
    console.error('Update recipe error:', error)
    res.status(500).json({ success: false, error: 'Texnologik kartani yangilashda xatolik' })
  }
}

// Delete recipe
export const deleteRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.userId

    const recipe = await Recipe.findByIdAndDelete(id)
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Texnologik karta topilmadi' })
    }

    await createActivityLog(
      userId!,
      'delete',
      'recipe',
      recipe._id.toString(),
      {},
      req.ip,
      req.get('user-agent')
    )

    res.json({ success: true, message: 'Texnologik karta o\'chirildi' })
  } catch (error) {
    console.error('Delete recipe error:', error)
    res.status(500).json({ success: false, error: 'Texnologik kartani o\'chirishda xatolik' })
  }
}

// ==================== 5.2. MAHSULOT QABUL QILISH (KIRIM) ====================

// Receive inventory (Kirim)
export const receiveInventory = async (req: AuthRequest, res: Response) => {
  try {
    const { inventoryItemId, quantity, price, supplier, invoiceNumber } = req.body
    const userId = req.user?.userId

    if (!inventoryItemId || !quantity || !price) {
      return res.status(400).json({
        success: false,
        error: 'Mahsulot, miqdor va narx talab qilinadi',
      })
    }

    const inventoryItem = await Inventory.findById(inventoryItemId)
    if (!inventoryItem) {
      return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' })
    }

    const balanceBefore = inventoryItem.quantity
    const balanceAfter = balanceBefore + quantity

    // Check price change
    const priceChanged = inventoryItem.price !== price
    const priceIncreased = price > inventoryItem.price

    // Update inventory
    inventoryItem.quantity = balanceAfter
    if (priceChanged) {
      inventoryItem.priceHistory.push({
        price: inventoryItem.price,
        date: new Date(),
        changedBy: userId as any,
      })
      inventoryItem.price = price
    }
    if (supplier) inventoryItem.supplier = supplier
    inventoryItem.lastRestockDate = new Date()
    await inventoryItem.save()

    // Create transaction
    const transaction = await InventoryTransaction.create({
      inventoryItem: inventoryItemId,
      type: 'receive',
      quantity,
      unit: inventoryItem.unit,
      price,
      supplier,
      invoiceNumber,
      balanceBefore,
      balanceAfter,
      performedBy: userId,
    })

    await createActivityLog(
      userId!,
      'receive',
      'inventory',
      inventoryItem._id.toString(),
      { quantity, price, supplier, priceChanged, priceIncreased },
      req.ip,
      req.get('user-agent')
    )

    // Check if low stock and emit socket event
    if (inventoryItem.quantity <= inventoryItem.minQuantity) {
      try {
        const io = getIO()
        io.emit('inventory:low-stock', {
          _id: inventoryItem._id,
          name: inventoryItem.name,
          quantity: inventoryItem.quantity,
          minQuantity: inventoryItem.minQuantity,
          unit: inventoryItem.unit,
        })
        console.log('📤 Socket: Kam qolgan mahsulot xabari yuborildi', inventoryItem.name)
      } catch (error) {
        console.error('Socket emit error:', error)
      }
    }

    res.json({
      success: true,
      data: {
        inventory: inventoryItem,
        transaction,
        priceAlert: priceIncreased
          ? `Narx oshdi: ${inventoryItem.priceHistory[inventoryItem.priceHistory.length - 2]?.price} → ${price}`
          : null,
      },
    })
  } catch (error) {
    console.error('Receive inventory error:', error)
    res.status(500).json({ success: false, error: 'Mahsulot qabul qilishda xatolik' })
  }
}

// To be continued in next part...

// ==================== 5.4. KAM QOLGAN MAHSULOTLAR ====================

// Get low stock items
export const getLowStockItems = async (req: AuthRequest, res: Response) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minQuantity'] },
    }).sort({ quantity: 1 })

    res.json({ success: true, data: lowStockItems, count: lowStockItems.length })
  } catch (error) {
    console.error('Get low stock items error:', error)
    res.status(500).json({ success: false, error: 'Kam qolgan mahsulotlarni olishda xatolik' })
  }
}

// Update min quantity
export const updateMinQuantity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { minQuantity } = req.body
    const userId = req.user?.userId

    if (minQuantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Minimal miqdor 0 dan kichik bo\'lishi mumkin emas',
      })
    }

    const inventoryItem = await Inventory.findByIdAndUpdate(
      id,
      { minQuantity },
      { new: true }
    )

    if (!inventoryItem) {
      return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' })
    }

    await createActivityLog(
      userId!,
      'update',
      'inventory',
      inventoryItem._id.toString(),
      { minQuantity },
      req.ip,
      req.get('user-agent')
    )

    res.json({ success: true, data: inventoryItem })
  } catch (error) {
    console.error('Update min quantity error:', error)
    res.status(500).json({ success: false, error: 'Minimal miqdorni yangilashda xatolik' })
  }
}

// ==================== 5.5. INVENTARIZATSIYA ====================

// Perform inventory audit
export const performAudit = async (req: AuthRequest, res: Response) => {
  try {
    const { inventoryItemId, actualQuantity, reason } = req.body
    const userId = req.user?.userId

    if (!inventoryItemId || actualQuantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Mahsulot va haqiqiy miqdor talab qilinadi',
      })
    }

    const inventoryItem = await Inventory.findById(inventoryItemId)
    if (!inventoryItem) {
      return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' })
    }

    const systemQuantity = inventoryItem.quantity
    const difference = actualQuantity - systemQuantity

    // Create audit transaction
    const transaction = await InventoryTransaction.create({
      inventoryItem: inventoryItemId,
      type: 'audit',
      quantity: difference,
      unit: inventoryItem.unit,
      reason: reason || 'Inventarizatsiya',
      balanceBefore: systemQuantity,
      balanceAfter: actualQuantity,
      performedBy: userId,
    })

    // Update inventory
    inventoryItem.quantity = actualQuantity
    await inventoryItem.save()

    await createActivityLog(
      userId!,
      'audit',
      'inventory',
      inventoryItem._id.toString(),
      { systemQuantity, actualQuantity, difference, reason },
      req.ip,
      req.get('user-agent')
    )

    res.json({
      success: true,
      data: {
        inventory: inventoryItem,
        transaction,
        audit: {
          systemQuantity,
          actualQuantity,
          difference,
          differencePercent: ((difference / systemQuantity) * 100).toFixed(2),
        },
      },
    })
  } catch (error) {
    console.error('Perform audit error:', error)
    res.status(500).json({ success: false, error: 'Inventarizatsiya o\'tkazishda xatolik' })
  }
}

// Get audit history
export const getAuditHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query

    const query: any = { type: 'audit' }
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate as string)
      if (endDate) query.createdAt.$lte = new Date(endDate as string)
    }

    const audits = await InventoryTransaction.find(query)
      .populate('inventoryItem', 'name unit')
      .populate('performedBy', 'fullName')
      .sort({ createdAt: -1 })
      .limit(100)

    res.json({ success: true, data: audits })
  } catch (error) {
    console.error('Get audit history error:', error)
    res.status(500).json({ success: false, error: 'Inventarizatsiya tarixini olishda xatolik' })
  }
}

// ==================== 5.6. MAHSULOTLAR AYLANMASI VA HISOBOT ====================

// Get inventory transactions
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { type, startDate, endDate, inventoryItemId } = req.query

    const query: any = {}
    if (type) query.type = type
    if (inventoryItemId) query.inventoryItem = inventoryItemId
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate as string)
      if (endDate) query.createdAt.$lte = new Date(endDate as string)
    }

    const transactions = await InventoryTransaction.find(query)
      .populate('inventoryItem', 'name unit')
      .populate('performedBy', 'fullName')
      .populate('order', 'tableNumber')
      .sort({ createdAt: -1 })
      .limit(200)

    res.json({ success: true, data: transactions })
  } catch (error) {
    console.error('Get transactions error:', error)
    res.status(500).json({ success: false, error: 'Tranzaksiyalarni olishda xatolik' })
  }
}

// Get inventory report
export const getInventoryReport = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, type = 'daily' } = req.query

    const start = startDate ? new Date(startDate as string) : new Date()
    const end = endDate ? new Date(endDate as string) : new Date()

    // Get all transactions in period
    const transactions = await InventoryTransaction.find({
      createdAt: { $gte: start, $lte: end },
    }).populate('inventoryItem', 'name unit price')

    // Group by inventory item
    const report: any = {}

    transactions.forEach((tx: any) => {
      const itemId = tx.inventoryItem._id.toString()
      if (!report[itemId]) {
        report[itemId] = {
          item: tx.inventoryItem,
          received: 0,
          writeOff: 0,
          adjustment: 0,
          audit: 0,
          totalCost: 0,
        }
      }

      if (tx.type === 'receive') {
        report[itemId].received += tx.quantity
        report[itemId].totalCost += tx.quantity * (tx.price || 0)
      } else if (tx.type === 'write-off') {
        report[itemId].writeOff += Math.abs(tx.quantity)
      } else if (tx.type === 'adjustment') {
        report[itemId].adjustment += tx.quantity
      } else if (tx.type === 'audit') {
        report[itemId].audit += tx.quantity
      }
    })

    // Convert to array and sort by cost
    const reportArray = Object.values(report).sort(
      (a: any, b: any) => b.totalCost - a.totalCost
    )

    res.json({
      success: true,
      data: {
        period: { start, end, type },
        items: reportArray,
        summary: {
          totalItems: reportArray.length,
          totalCost: reportArray.reduce((sum: number, item: any) => sum + item.totalCost, 0),
          totalReceived: reportArray.reduce((sum: number, item: any) => sum + item.received, 0),
          totalWriteOff: reportArray.reduce((sum: number, item: any) => sum + item.writeOff, 0),
        },
      },
    })
  } catch (error) {
    console.error('Get inventory report error:', error)
    res.status(500).json({ success: false, error: 'Hisobotni olishda xatolik' })
  }
}

// Get cost analysis (eng ko'p xarajat)
export const getCostAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate as string) : new Date()

    const transactions = await InventoryTransaction.find({
      type: 'receive',
      createdAt: { $gte: start, $lte: end },
    }).populate('inventoryItem', 'name unit')

    // Group and calculate cost
    const costMap: any = {}

    transactions.forEach((tx: any) => {
      const itemId = tx.inventoryItem._id.toString()
      if (!costMap[itemId]) {
        costMap[itemId] = {
          item: tx.inventoryItem,
          totalQuantity: 0,
          totalCost: 0,
          transactions: 0,
        }
      }

      costMap[itemId].totalQuantity += tx.quantity
      costMap[itemId].totalCost += tx.quantity * (tx.price || 0)
      costMap[itemId].transactions += 1
    })

    const costArray = Object.values(costMap)
      .sort((a: any, b: any) => b.totalCost - a.totalCost)
      .slice(0, Number(limit))

    res.json({ success: true, data: costArray })
  } catch (error) {
    console.error('Get cost analysis error:', error)
    res.status(500).json({ success: false, error: 'Xarajat tahlilini olishda xatolik' })
  }
}
