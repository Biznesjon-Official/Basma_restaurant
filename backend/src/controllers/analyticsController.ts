import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import Order from '../models/Order'
import MenuItem from '../models/MenuItem'
import User from '../models/User'
import Inventory from '../models/Inventory'
import Expense from '../models/Expense'

// Revenue Analytics
export const getRevenueAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query

    let dateFilter: any = {}
    const now = new Date()

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      }
    } else {
      switch (period) {
        case 'daily':
          dateFilter = {
            createdAt: {
              $gte: new Date(now.setHours(0, 0, 0, 0)),
            },
          }
          break
        case 'weekly':
          const weekAgo = new Date(now.setDate(now.getDate() - 7))
          dateFilter = { createdAt: { $gte: weekAgo } }
          break
        case 'monthly':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
          dateFilter = { createdAt: { $gte: monthAgo } }
          break
      }
    }

    const orders = await Order.find({
      ...dateFilter,
      paymentStatus: 'paid',
    })

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Group by date
    const revenueByDate = orders.reduce((acc: any, order) => {
      const date = order.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 }
      }
      acc[date].revenue += (order.totalAmount || 0)
      acc[date].orders += 1
      return acc
    }, {})

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        revenueByDate: Object.values(revenueByDate),
      },
    })
  } catch (error) {
    console.error('Revenue analytics error:', error)
    res.status(500).json({ success: false, error: 'Analitika xatosi' })
  }
}

// Top Selling Items
export const getTopSellingItems = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 10, period = 'monthly' } = req.query

    let dateFilter: any = {}
    const now = new Date()

    switch (period) {
      case 'daily':
        dateFilter = { createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } }
        break
      case 'weekly':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } }
        break
      case 'monthly':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } }
        break
    }

    const topItems = await Order.aggregate([
      { $match: { ...dateFilter, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.quantity', '$items.price'] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit as string) },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem',
        },
      },
      { $unwind: '$menuItem' },
    ])

    res.json({ success: true, data: topItems })
  } catch (error) {
    console.error('Top selling items error:', error)
    res.status(500).json({ success: false, error: 'Analitika xatosi' })
  }
}

// Low Performing Items
export const getLowPerformingItems = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 10, period = 'monthly' } = req.query

    let dateFilter: any = {}
    const now = new Date()

    switch (period) {
      case 'monthly':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } }
        break
      case 'quarterly':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 3)) } }
        break
    }

    // Get all menu items
    const allMenuItems = await MenuItem.find({ available: true })

    // Get sold items
    const soldItems = await Order.aggregate([
      { $match: { ...dateFilter, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
    ])

    const soldItemsMap = new Map(
      soldItems
        .filter((item) => item._id != null)
        .map((item) => [item._id.toString(), item.totalQuantity])
    )

    // Find items with low sales
    const lowPerforming = allMenuItems
      .filter((item) => item._id != null)
      .map((item) => ({
        _id: item._id,
        name: item.name,
        category: item.category,
        price: item.price,
        totalQuantity: soldItemsMap.get(item._id.toString()) || 0,
      }))
      .sort((a, b) => a.totalQuantity - b.totalQuantity)
      .slice(0, parseInt(limit as string))

    res.json({ success: true, data: lowPerforming })
  } catch (error) {
    console.error('Low performing items error:', error)
    res.status(500).json({ success: false, error: 'Analitika xatosi' })
  }
}

// Staff Performance (KPI)
export const getStaffPerformance = async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'monthly' } = req.query

    let dateFilter: any = {}
    const now = new Date()

    switch (period) {
      case 'daily':
        dateFilter = { createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } }
        break
      case 'weekly':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } }
        break
      case 'monthly':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } }
        break
    }

    const staffPerformance = await Order.aggregate([
      { $match: { ...dateFilter, paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$waiter',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'waiter',
        },
      },
      { $unwind: { path: '$waiter', preserveNullAndEmptyArrays: true } },
    ])

    res.json({ success: true, data: staffPerformance })
  } catch (error) {
    console.error('Staff performance error:', error)
    res.status(500).json({ success: false, error: 'Analitika xatosi' })
  }
}

// Expense Analytics
export const getExpenseAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'monthly' } = req.query

    let dateFilter: any = {}
    const now = new Date()

    switch (period) {
      case 'monthly':
        dateFilter = { date: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } }
        break
      case 'quarterly':
        dateFilter = { date: { $gte: new Date(now.setMonth(now.getMonth() - 3)) } }
        break
      case 'yearly':
        dateFilter = { date: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } }
        break
    }

    const expenses = await Expense.find(dateFilter)

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    const expensesByCategory = expenses.reduce((acc: any, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = 0
      }
      acc[exp.category] += exp.amount
      return acc
    }, {})

    res.json({
      success: true,
      data: {
        totalExpenses,
        expensesByCategory,
        expenses,
      },
    })
  } catch (error) {
    console.error('Expense analytics error:', error)
    res.status(500).json({ success: false, error: 'Analitika xatosi' })
  }
}

// Profit & Loss Report
export const getProfitLossReport = async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query

    let dateFilter: any = {}
    const now = new Date()

    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      }
    } else {
      switch (period) {
        case 'daily':
          dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)) }
          break
        case 'weekly':
          dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) }
          break
        case 'monthly':
          dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) }
          break
        case 'yearly':
          dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) }
          break
      }
    }

    // Total Revenue
    const orders = await Order.find({
      createdAt: dateFilter,
      paymentStatus: 'paid',
    })
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

    // Total Expenses
    const expenses = await Expense.find({
      date: dateFilter,
    })
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    // Expenses by category
    const expensesByCategory = expenses.reduce((acc: any, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = 0
      }
      acc[exp.category] += exp.amount
      return acc
    }, {})

    // Net Profit
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Daily breakdown
    const dailyData = await Order.aggregate([
      { $match: { createdAt: dateFilter, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const expensesByDate = await Expense.aggregate([
      { $match: { date: dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          expenses: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const expensesMap = new Map(expensesByDate.map((e) => [e._id, e.expenses]))

    const profitByDate = dailyData.map((d) => ({
      date: d._id,
      revenue: d.revenue,
      expenses: expensesMap.get(d._id) || 0,
      profit: d.revenue - (expensesMap.get(d._id) || 0),
    }))

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: Math.round(profitMargin * 100) / 100,
        expensesByCategory,
        profitByDate,
      },
    })
  } catch (error) {
    console.error('Profit/Loss report error:', error)
    res.status(500).json({ success: false, error: 'Hisobot xatosi' })
  }
}

// Dashboard Summary
export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Today's revenue
    const todayOrders = await Order.find({
      createdAt: { $gte: today },
      paymentStatus: 'paid',
    })
    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

    // Yesterday's revenue
    const yesterdayOrders = await Order.find({
      createdAt: { $gte: yesterday, $lt: today },
      paymentStatus: 'paid',
    })
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

    // Active orders
    const activeOrders = await Order.countDocuments({
      status: { $in: ['pending', 'preparing', 'ready'] },
    })

    // Average order value
    const averageOrderValue = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0

    // Popular items today
    const popularItems = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          count: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem',
        },
      },
      { $unwind: '$menuItem' },
      {
        $project: {
          name: '$menuItem.name',
          count: 1,
          revenue: 1,
        },
      },
    ])

    // Revenue by hour (today)
    const revenueByHour = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          hour: { $concat: [{ $toString: '$_id' }, ':00'] },
          revenue: 1,
          _id: 0,
        },
      },
    ])

    // Weekly revenue (last 7 days)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    
    const weeklyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          revenue: 1,
          _id: 0,
        },
      },
    ])

    // Low stock items
    const lowStockItems = await Inventory.countDocuments({
      $expr: { $lte: ['$quantity', '$minQuantity'] }
    })

    res.json({
      success: true,
      data: {
        todayRevenue,
        yesterdayRevenue,
        todayOrders: todayOrders.length,
        yesterdayOrders: yesterdayOrders.length,
        activeOrders,
        averageOrderValue,
        popularItems,
        revenueByHour,
        weeklyRevenue,
        lowStockItems,
      },
    })
  } catch (error) {
    console.error('Dashboard summary error:', error)
    res.status(500).json({ success: false, error: 'Analitika xatosi' })
  }
}

// Item Profitability (Marjinallik)
export const getItemProfitability = async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'monthly' } = req.query

    let dateFilter: any = {}
    const now = new Date()

    switch (period) {
      case 'monthly':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } }
        break
      case 'quarterly':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 3)) } }
        break
    }

    const itemSales = await Order.aggregate([
      { $match: { ...dateFilter, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem',
        },
      },
      { $unwind: '$menuItem' },
      {
        $lookup: {
          from: 'recipes',
          localField: 'menuItem._id',
          foreignField: 'menuItem',
          as: 'recipe',
        },
      },
      { $unwind: { path: '$recipe', preserveNullAndEmptyArrays: true } },
    ])

    const profitability = itemSales.map((item) => {
      const cost = item.recipe?.ingredients?.reduce((sum: number, ing: any) => {
        return sum + (ing.cost || 0)
      }, 0) || 0

      const totalCost = cost * item.totalQuantity
      const profit = item.totalRevenue - totalCost
      const profitMargin = item.totalRevenue > 0 ? (profit / item.totalRevenue) * 100 : 0

      return {
        name: item.menuItem.name,
        category: item.menuItem.category,
        price: item.menuItem.price,
        quantity: item.totalQuantity,
        revenue: item.totalRevenue,
        cost: totalCost,
        profit,
        profitMargin: Math.round(profitMargin * 100) / 100,
      }
    })

    profitability.sort((a, b) => b.profit - a.profit)

    res.json({ success: true, data: profitability })
  } catch (error) {
    console.error('Item profitability error:', error)
    res.status(500).json({ success: false, error: 'Analitika xatosi' })
  }
}
