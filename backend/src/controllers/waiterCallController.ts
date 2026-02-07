import { Request, Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import WaiterCall from '../models/WaiterCall'
import Table from '../models/Table'
import { getIO, emitWaiterCall, emitWaiterCallResponded, emitWaiterCallCompleted } from '../config/socket'

// Ofitsantni chaqirish (mijoz tomonidan - QR code orqali)
export const createWaiterCall = async (req: Request, res: Response) => {
  try {
    const { tableId, message } = req.body

    if (!tableId) {
      return res.status(400).json({
        success: false,
        error: 'Stol ID talab qilinadi',
      })
    }

    const table = await Table.findById(tableId)
    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Stol topilmadi',
      })
    }

    // Avvalgi pending chaqiruvni tekshirish
    const existingCall = await WaiterCall.findOne({
      table: tableId,
      status: 'pending',
    })

    if (existingCall) {
      return res.status(400).json({
        success: false,
        error: 'Ofitsant allaqachon chaqirilgan',
        data: existingCall,
      })
    }

    // Yangi chaqiruv yaratish
    const waiterCall = await WaiterCall.create({
      table: tableId,
      tableNumber: table.number,
      message: message || 'Ofitsant chaqirildi',
    })

    const populatedCall = await WaiterCall.findById(waiterCall._id).populate('table')

    // Real-time notification - BARCHA waiterlarga
    emitWaiterCall(populatedCall)

    console.log('🔔 Waiter call created:', {
      tableNumber: table.number,
      callId: waiterCall._id,
    })

    res.status(201).json({
      success: true,
      data: populatedCall,
    })
  } catch (error) {
    console.error('Create waiter call error:', error)
    res.status(500).json({
      success: false,
      error: 'Ofitsantni chaqirishda xatolik',
    })
  }
}

// Barcha chaqiruvlarni olish (waiter uchun)
export const getWaiterCalls = async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string

    const query: any = {}
    if (status) {
      query.status = status
    } else {
      // Default: faqat pending va responded
      query.status = { $in: ['pending', 'responded'] }
    }

    const calls = await WaiterCall.find(query)
      .populate('table')
      .populate('respondedBy', 'fullName')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: calls,
    })
  } catch (error) {
    console.error('Get waiter calls error:', error)
    res.status(500).json({
      success: false,
      error: 'Chaqiruvlarni olishda xatolik',
    })
  }
}

// Chaqiruvga javob berish (waiter tomonidan)
export const respondToCall = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const waiterId = req.user?.userId

    const waiterCall = await WaiterCall.findById(id)
    if (!waiterCall) {
      return res.status(404).json({
        success: false,
        error: 'Chaqiruv topilmadi',
      })
    }

    if (waiterCall.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Chaqiruv allaqachon javob berilgan',
      })
    }

    waiterCall.status = 'responded'
    waiterCall.respondedBy = waiterId as any
    waiterCall.respondedAt = new Date()
    await waiterCall.save()

    const populatedCall = await WaiterCall.findById(id)
      .populate('table')
      .populate('respondedBy', 'fullName')

    // Real-time notification
    emitWaiterCallResponded(populatedCall)

    console.log('✅ Waiter responded to call:', {
      callId: id,
      waiterId,
      tableNumber: waiterCall.tableNumber,
    })

    res.json({
      success: true,
      data: populatedCall,
    })
  } catch (error) {
    console.error('Respond to call error:', error)
    res.status(500).json({
      success: false,
      error: 'Javob berishda xatolik',
    })
  }
}

// Chaqiruvni yakunlash
export const completeCall = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const waiterCall = await WaiterCall.findById(id)
    if (!waiterCall) {
      return res.status(404).json({
        success: false,
        error: 'Chaqiruv topilmadi',
      })
    }

    waiterCall.status = 'completed'
    waiterCall.completedAt = new Date()
    await waiterCall.save()

    const populatedCall = await WaiterCall.findById(id)
      .populate('table')
      .populate('respondedBy', 'fullName')

    // Real-time notification
    emitWaiterCallCompleted(populatedCall)

    res.json({
      success: true,
      data: populatedCall,
    })
  } catch (error) {
    console.error('Complete call error:', error)
    res.status(500).json({
      success: false,
      error: 'Chaqiruvni yakunlashda xatolik',
    })
  }
}

// Stol uchun pending chaqiruvni tekshirish
export const checkTableCall = async (req: Request, res: Response) => {
  try {
    const { tableId } = req.params

    const pendingCall = await WaiterCall.findOne({
      table: tableId,
      status: 'pending',
    }).populate('table')

    res.json({
      success: true,
      data: pendingCall,
      hasPendingCall: !!pendingCall,
    })
  } catch (error) {
    console.error('Check table call error:', error)
    res.status(500).json({
      success: false,
      error: 'Chaqiruvni tekshirishda xatolik',
    })
  }
}
