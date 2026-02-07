import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import Table from '../models/Table'
import crypto from 'crypto'
import QRCode from 'qrcode'

export const getTables = async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string
    const query: any = {}
    if (status) query.status = status

    const tables = await Table.find(query)
      .populate('currentOrder')
      .sort({ number: 1 })

    res.json({ success: true, data: tables })
  } catch (error) {
    console.error('Get tables error:', error)
    res.status(500).json({ success: false, error: 'Stollarni olishda xatolik' })
  }
}

export const createTable = async (req: AuthRequest, res: Response) => {
  try {
    const { number, capacity } = req.body

    // Generate unique QR code
    const qrCode = crypto.randomBytes(16).toString('hex')
    const marketplaceUrl = process.env.MARKETPLACE_URL || 'https://marketplace.uz'
    const qrCodeUrl = `${marketplaceUrl}/table/${qrCode}`

    const table = await Table.create({
      number,
      capacity,
      qrCode,
      qrCodeUrl,
    })

    console.log('✅ Table created with QR code:', {
      tableNumber: number,
      qrCode,
      qrCodeUrl,
    })

    res.status(201).json({ success: true, data: table })
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Bu stol raqami allaqachon mavjud' })
    }
    console.error('Create table error:', error)
    res.status(500).json({ success: false, error: 'Stol qo\'shishda xatolik' })
  }
}

export const updateTable = async (req: AuthRequest, res: Response) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!table) {
      return res.status(404).json({ success: false, error: 'Stol topilmadi' })
    }

    res.json({ success: true, data: table })
  } catch (error) {
    console.error('Update table error:', error)
    res.status(500).json({ success: false, error: 'Stol yangilashda xatolik' })
  }
}

// QR code orqali stolni topish (public endpoint)
export const getTableByQrCode = async (req: AuthRequest, res: Response) => {
  try {
    const { qrCode } = req.params

    const table = await Table.findOne({ qrCode })

    if (!table) {
      return res.status(404).json({ 
        success: false, 
        error: 'Stol topilmadi' 
      })
    }

    res.json({ 
      success: true, 
      data: {
        _id: table._id,
        number: table.number,
        capacity: table.capacity,
        status: table.status,
      }
    })
  } catch (error) {
    console.error('Get table by QR code error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Stolni olishda xatolik' 
    })
  }
}

// QR code ni regenerate qilish
export const regenerateQrCode = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const table = await Table.findById(id)
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        error: 'Stol topilmadi' 
      })
    }

    // Generate new QR code
    const qrCode = crypto.randomBytes(16).toString('hex')
    const marketplaceUrl = process.env.MARKETPLACE_URL || 'https://marketplace.uz'
    const qrCodeUrl = `${marketplaceUrl}/table/${qrCode}`

    table.qrCode = qrCode
    table.qrCodeUrl = qrCodeUrl
    await table.save()

    console.log('🔄 QR code regenerated:', {
      tableNumber: table.number,
      qrCode,
      qrCodeUrl,
    })

    res.json({ success: true, data: table })
  } catch (error) {
    console.error('Regenerate QR code error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'QR code yangilashda xatolik' 
    })
  }
}


// QR code image ni olish (PNG format)
export const getTableQrCodeImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const table = await Table.findById(id)
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        error: 'Stol topilmadi' 
      })
    }

    // Generate QR code as PNG buffer
    const qrCodeUrl = table.qrCodeUrl || `https://marketplace.uz/table/${table.qrCode}`
    const qrCodeBuffer = await QRCode.toBuffer(qrCodeUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Disposition', `inline; filename="table-${table.number}-qr.png"`)
    res.send(qrCodeBuffer)
  } catch (error) {
    console.error('Get QR code image error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'QR code olishda xatolik' 
    })
  }
}

// QR code ni base64 data URL sifatida olish
export const getTableQrCodeDataUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const table = await Table.findById(id)
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        error: 'Stol topilmadi' 
      })
    }

    // Generate QR code as data URL
    const qrCodeUrl = table.qrCodeUrl || `https://marketplace.uz/table/${table.qrCode}`
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    res.json({ 
      success: true, 
      data: {
        dataUrl: qrCodeDataUrl,
        qrCode: table.qrCode,
        qrCodeUrl: table.qrCodeUrl
      }
    })
  } catch (error) {
    console.error('Get QR code data URL error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'QR code olishda xatolik' 
    })
  }
}

// QR code ni SVG formatda olish
export const getTableQrCodeSvg = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const table = await Table.findById(id)
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        error: 'Stol topilmadi' 
      })
    }

    // Generate QR code as SVG string
    const qrCodeUrl = table.qrCodeUrl || `https://marketplace.uz/table/${table.qrCode}`
    const qrCodeSvg = await QRCode.toString(qrCodeUrl, {
      type: 'svg',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Content-Disposition', `inline; filename="table-${table.number}-qr.svg"`)
    res.send(qrCodeSvg)
  } catch (error) {
    console.error('Get QR code SVG error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'QR code olishda xatolik' 
    })
  }
}
