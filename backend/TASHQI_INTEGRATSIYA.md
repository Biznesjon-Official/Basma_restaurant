# 🌐 TASHQI PLATFORMALAR INTEGRATSIYASI

## 📋 UMUMIY MA'LUMOT

Tashqi platformalar (Yandex Eda, Uzum Tezkor, Telegram) dan buyurtmalar **Webhook** yoki **API** orqali keladi.

---

## 🔄 INTEGRATSIYA USULLARI

### 1️⃣ WEBHOOK (Tavsiya etiladi)

Tashqi platforma sizning serveringizga avtomatik so'rov yuboradi:

```
Yandex Eda → POST http://yourserver.com/api/webhooks/yandex
Uzum Tezkor → POST http://yourserver.com/api/webhooks/uzum
Telegram Bot → POST http://yourserver.com/api/webhooks/telegram
```

### 2️⃣ POLLING (Qo'lda tekshirish)

Sizning serveringiz tashqi platformadan ma'lumot so'raydi:

```
Har 30 soniyada:
  GET https://yandex-api.com/orders/new
  → Yangi buyurtmalar bormi?
```

---

## 🛠️ WEBHOOK ENDPOINT YARATISH

### 1. Webhook Controller yaratamiz

```typescript
// src/controllers/webhookController.ts
import { Request, Response } from 'express'
import Order from '../models/Order'
import { getIO } from '../config/socket'

// YANDEX EDA WEBHOOK
export const yandexWebhook = async (req: Request, res: Response) => {
  try {
    console.log('📥 Yandex dan buyurtma keldi:', req.body)
    
    const yandexOrder = req.body
    
    // Yandex formatini bizning formatga o'zgartirish
    const order = await Order.create({
      orderType: 'marketplace',
      marketplaceName: 'Yandex',
      marketplaceOrderId: yandexOrder.order_id,
      customerName: yandexOrder.customer.name,
      customerPhone: yandexOrder.customer.phone,
      customerAddress: yandexOrder.delivery.address,
      deliveryType: 'delivery',
      deliveryFee: yandexOrder.delivery.cost,
      items: yandexOrder.items.map((item: any) => ({
        menuItemName: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: yandexOrder.total_amount,
      paymentType: yandexOrder.payment_type,
      status: 'pending',
    })
    
    // Socket.io orqali real-time yuborish
    const io = getIO()
    const populatedOrder = await Order.findById(order._id)
    io.emit('marketplace-order-created', populatedOrder)
    io.emit('order:new', populatedOrder)
    
    console.log('✅ Buyurtma saqlandi va yuborildi')
    
    // Yandex ga javob qaytarish
    res.json({ 
      success: true, 
      order_id: order._id,
      status: 'accepted' 
    })
  } catch (error) {
    console.error('❌ Yandex webhook xatolik:', error)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

// UZUM TEZKOR WEBHOOK
export const uzumWebhook = async (req: Request, res: Response) => {
  try {
    console.log('📥 Uzum dan buyurtma keldi:', req.body)
    
    const uzumOrder = req.body
    
    const order = await Order.create({
      orderType: 'marketplace',
      marketplaceName: 'Uzum',
      marketplaceOrderId: uzumOrder.id,
      customerName: uzumOrder.client.name,
      customerPhone: uzumOrder.client.phone,
      customerAddress: uzumOrder.address.full_address,
      deliveryType: 'delivery',
      deliveryFee: uzumOrder.delivery_price,
      items: uzumOrder.products.map((item: any) => ({
        menuItemName: item.title,
        quantity: item.count,
        price: item.price,
      })),
      totalAmount: uzumOrder.total_price,
      paymentType: uzumOrder.payment_method,
      status: 'pending',
    })
    
    const io = getIO()
    const populatedOrder = await Order.findById(order._id)
    io.emit('marketplace-order-created', populatedOrder)
    io.emit('order:new', populatedOrder)
    
    res.json({ success: true, order_id: order._id })
  } catch (error) {
    console.error('❌ Uzum webhook xatolik:', error)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

// TELEGRAM BOT WEBHOOK
export const telegramWebhook = async (req: Request, res: Response) => {
  try {
    console.log('📥 Telegram dan buyurtma keldi:', req.body)
    
    const telegramOrder = req.body
    
    const order = await Order.create({
      orderType: 'marketplace',
      marketplaceName: 'Telegram',
      marketplaceOrderId: `TG-${telegramOrder.message_id}`,
      customerName: telegramOrder.from.first_name,
      customerPhone: telegramOrder.contact?.phone_number || 'N/A',
      customerAddress: telegramOrder.location?.address || 'N/A',
      deliveryType: telegramOrder.delivery_type || 'delivery',
      items: telegramOrder.order_items.map((item: any) => ({
        menuItemName: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: telegramOrder.total_amount,
      paymentType: 'cash',
      status: 'pending',
    })
    
    const io = getIO()
    const populatedOrder = await Order.findById(order._id)
    io.emit('marketplace-order-created', populatedOrder)
    io.emit('order:new', populatedOrder)
    
    res.json({ success: true, order_id: order._id })
  } catch (error) {
    console.error('❌ Telegram webhook xatolik:', error)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

// UMUMIY WEBHOOK (Barcha platformalar uchun)
export const universalWebhook = async (req: Request, res: Response) => {
  try {
    console.log('📥 Universal webhook:', req.body)
    
    // Qaysi platformadan kelganini aniqlash
    const platform = req.body.platform || req.query.platform || 'Other'
    
    const order = await Order.create({
      orderType: 'marketplace',
      marketplaceName: platform,
      marketplaceOrderId: req.body.orderId || `${platform}-${Date.now()}`,
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      customerAddress: req.body.customerAddress,
      deliveryType: req.body.deliveryType || 'delivery',
      deliveryFee: req.body.deliveryFee || 0,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      paymentType: req.body.paymentType || 'cash',
      status: 'pending',
    })
    
    const io = getIO()
    const populatedOrder = await Order.findById(order._id)
    io.emit('marketplace-order-created', populatedOrder)
    io.emit('order:new', populatedOrder)
    
    res.json({ success: true, order_id: order._id })
  } catch (error) {
    console.error('❌ Universal webhook xatolik:', error)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}
```

### 2. Routes yaratamiz

```typescript
// src/routes/webhookRoutes.ts
import express from 'express'
import {
  yandexWebhook,
  uzumWebhook,
  telegramWebhook,
  universalWebhook,
} from '../controllers/webhookController'

const router = express.Router()

// Har bir platforma uchun alohida endpoint
router.post('/yandex', yandexWebhook)
router.post('/uzum', uzumWebhook)
router.post('/telegram', telegramWebhook)

// Universal endpoint
router.post('/order', universalWebhook)

export default router
```

### 3. Server.ts ga qo'shamiz

```typescript
// src/server.ts
import webhookRoutes from './routes/webhookRoutes'

// Webhook routes (authentication kerak emas)
app.use('/api/webhooks', webhookRoutes)
```

---

## 🧪 TEST QILISH

### 1. Postman yoki cURL bilan test

```bash
# Yandex Eda simulyatsiyasi
curl -X POST http://localhost:5000/api/webhooks/yandex \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "YX-12345",
    "customer": {
      "name": "Ali Valiyev",
      "phone": "+998901234567"
    },
    "delivery": {
      "address": "Toshkent, Chilonzor 12-kvartal",
      "cost": 15000
    },
    "items": [
      {
        "name": "Osh",
        "quantity": 2,
        "price": 25000
      },
      {
        "name": "Choy",
        "quantity": 2,
        "price": 3000
      }
    ],
    "total_amount": 56000,
    "payment_type": "cash"
  }'
```

```bash
# Uzum Tezkor simulyatsiyasi
curl -X POST http://localhost:5000/api/webhooks/uzum \
  -H "Content-Type: application/json" \
  -d '{
    "id": "UZ-67890",
    "client": {
      "name": "Vali Aliyev",
      "phone": "+998909876543"
    },
    "address": {
      "full_address": "Toshkent, Yunusobod 5-kvartal"
    },
    "products": [
      {
        "title": "Lag'\''mon",
        "count": 1,
        "price": 20000
      }
    ],
    "total_price": 20000,
    "delivery_price": 10000,
    "payment_method": "card"
  }'
```

```bash
# Universal webhook
curl -X POST http://localhost:5000/api/webhooks/order \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "Website",
    "orderId": "WEB-001",
    "customerName": "Sardor Karimov",
    "customerPhone": "+998901112233",
    "customerAddress": "Toshkent, Sergeli",
    "deliveryType": "delivery",
    "deliveryFee": 12000,
    "items": [
      {
        "menuItemName": "Shashlik",
        "quantity": 3,
        "price": 18000
      }
    ],
    "totalAmount": 54000,
    "paymentType": "cash"
  }'
```

### 2. Test script yaratamiz

```javascript
// backend/test-marketplace-webhook.js
const axios = require('axios')

const API_URL = 'http://localhost:5000/api/webhooks'

async function testYandexWebhook() {
  console.log('🧪 Yandex webhook test...')
  
  try {
    const response = await axios.post(`${API_URL}/yandex`, {
      order_id: `YX-${Date.now()}`,
      customer: {
        name: 'Test User',
        phone: '+998901234567'
      },
      delivery: {
        address: 'Test Address, Toshkent',
        cost: 15000
      },
      items: [
        { name: 'Osh', quantity: 2, price: 25000 },
        { name: 'Choy', quantity: 2, price: 3000 }
      ],
      total_amount: 56000,
      payment_type: 'cash'
    })
    
    console.log('✅ Success:', response.data)
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message)
  }
}

async function testUniversalWebhook() {
  console.log('🧪 Universal webhook test...')
  
  try {
    const response = await axios.post(`${API_URL}/order`, {
      platform: 'Website',
      orderId: `WEB-${Date.now()}`,
      customerName: 'Website User',
      customerPhone: '+998909876543',
      customerAddress: 'Toshkent, Yunusobod',
      deliveryType: 'delivery',
      deliveryFee: 10000,
      items: [
        { menuItemName: 'Lag\'mon', quantity: 1, price: 20000 }
      ],
      totalAmount: 30000,
      paymentType: 'card'
    })
    
    console.log('✅ Success:', response.data)
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message)
  }
}

// Run tests
async function runTests() {
  await testYandexWebhook()
  console.log('\n')
  await testUniversalWebhook()
}

runTests()
```

---

## 🔐 XAVFSIZLIK

### 1. API Key bilan himoyalash

```typescript
// src/middlewares/webhookAuth.ts
import { Request, Response, NextFunction } from 'express'

export const validateWebhookKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key
  
  const validKeys = {
    yandex: process.env.YANDEX_API_KEY,
    uzum: process.env.UZUM_API_KEY,
    telegram: process.env.TELEGRAM_BOT_TOKEN,
  }
  
  const platform = req.path.split('/')[1] // yandex, uzum, telegram
  
  if (apiKey !== validKeys[platform]) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid API key' 
    })
  }
  
  next()
}

// Routes da ishlatish
router.post('/yandex', validateWebhookKey, yandexWebhook)
```

### 2. IP Whitelist

```typescript
const allowedIPs = [
  '185.71.76.0/27',  // Yandex Eda
  '185.71.77.0/27',  // Yandex Eda
  '91.201.214.0/24', // Uzum Tezkor
]

export const validateIP = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress
  
  if (!allowedIPs.includes(clientIP)) {
    return res.status(403).json({ 
      success: false, 
      error: 'IP not allowed' 
    })
  }
  
  next()
}
```

### 3. Signature verification

```typescript
import crypto from 'crypto'

export const verifySignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-signature']
  const secret = process.env.WEBHOOK_SECRET
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex')
  
  if (signature !== hash) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid signature' 
    })
  }
  
  next()
}
```

---

## 🌐 NGROK bilan test qilish (Local development)

Agar local serveringizni internetga ochmoqchi bo'lsangiz:

```bash
# 1. Ngrok o'rnatish
npm install -g ngrok

# 2. Ngrok ishga tushirish
ngrok http 5000

# Output:
# Forwarding: https://abc123.ngrok.io -> http://localhost:5000

# 3. Webhook URL
# https://abc123.ngrok.io/api/webhooks/yandex
```

---

## 📊 REAL INTEGRATSIYA

### Yandex Eda

1. **Yandex Eda Partner kabinetiga kirish**
2. **Webhook URL sozlash:**
   ```
   https://yourserver.com/api/webhooks/yandex
   ```
3. **API Key olish va .env ga qo'shish:**
   ```
   YANDEX_API_KEY=your_api_key_here
   ```

### Uzum Tezkor

1. **Uzum Tezkor bilan shartnoma tuzish**
2. **API dokumentatsiyasini olish**
3. **Webhook URL berish:**
   ```
   https://yourserver.com/api/webhooks/uzum
   ```

### Telegram Bot

1. **BotFather orqali bot yaratish**
2. **Webhook o'rnatish:**
   ```bash
   curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
     -d "url=https://yourserver.com/api/webhooks/telegram"
   ```

---

## 🎯 XULOSA

**Tashqidan buyurtma kelishi:**

1. **Webhook endpoint yaratish** ✅
2. **Tashqi platforma webhook URL sozlash** ✅
3. **Buyurtma kelganda avtomatik saqlash** ✅
4. **Socket.io orqali real-time yuborish** ✅
5. **Ofitsiant interfeysi avtomatik yangilanadi** ✅

**Kerakli fayllar:**
- `webhookController.ts` - Webhook logic
- `webhookRoutes.ts` - Routes
- `test-marketplace-webhook.js` - Test script

**Test qilish:**
```bash
node backend/test-marketplace-webhook.js
```
