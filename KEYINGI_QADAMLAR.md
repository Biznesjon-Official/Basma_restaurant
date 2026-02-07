# 🎯 KEYINGI QADAMLAR - Prioritet bo'yicha

## ✅ BAJARILDI (Hozir)

### 1. Avtomatik Hisobdan Chiqarish ✅
- ✅ `inventoryWriteOffService.ts` yaratildi
- ✅ `cashierController.ts` da avtomatik write-off qo'shildi
- ✅ Recipe CRUD operatsiyalari yaratildi
- ✅ `/api/recipes` endpoint qo'shildi

**Qanday ishlaydi:**
1. Kassir buyurtmani yopganda (status = 'completed')
2. Tizim avtomatik ravishda Recipe ni topadi
3. Har bir ingredient uchun Inventory dan ayiradi
4. InventoryTransaction yaratadi (type: 'write-off')

**Test qilish:**
```bash
# 1. Recipe yaratish
POST /api/recipes
{
  "menuItem": "menu_item_id",
  "ingredients": [
    {
      "inventoryItem": "inventory_id",
      "quantity": 150,
      "unit": "g"
    }
  ],
  "portionSize": 1
}

# 2. Buyurtma yopish
POST /api/cashier/orders/:orderId/payment
{
  "paymentType": "cash"
}

# 3. Inventory tekshirish
GET /api/inventory
```

---

## 🔴 CRITICAL - Darhol qilish kerak (1-2 hafta)

### 2. To'lov Tizimlari Integratsiyasi
**Vaqt:** 15-20 soat  
**Prioritet:** 🔴 HIGH

#### 2.1. Click Integratsiyasi (5-7 soat)
```typescript
// backend/src/services/clickService.ts
- Click Merchant API
- prepare() - to'lovni boshlash
- complete() - to'lovni tasdiqlash
- Webhook handler
```

**Kerakli ma'lumotlar:**
- Merchant ID
- Service ID
- Secret Key

**Qadamlar:**
1. Click bilan shartnoma tuzish
2. Test muhitda test qilish
3. Production ga o'tkazish

#### 2.2. Payme Integratsiyasi (5-7 soat)
```typescript
// backend/src/services/paymeService.ts
- Payme Merchant API
- CheckPerformTransaction
- CreateTransaction
- PerformTransaction
- CancelTransaction
```

**Kerakli ma'lumotlar:**
- Merchant ID
- Secret Key (Base64)

#### 2.3. Uzum Pay Integratsiyasi (5-7 soat)
```typescript
// backend/src/services/uzumPayService.ts
- Uzum Pay API
- Create payment
- Check status
- Webhook handler
```

**Fayllar yaratish:**
```
backend/src/
├── services/
│   ├── clickService.ts
│   ├── paymeService.ts
│   └── uzumPayService.ts
├── routes/
│   └── paymentRoutes.ts
└── controllers/
    └── paymentController.ts
```

---

### 3. Telegram Bot (20-30 soat)
**Vaqt:** 20-30 soat  
**Prioritet:** 🔴 HIGH

#### 3.1. Telegram Bot Backend (10-15 soat)
```typescript
// backend/src/services/telegramBot.ts
import TelegramBot from 'node-telegram-bot-api'

class BasmaTelegramBot {
  // Commands
  - /start - Botni boshlash
  - /menu - Menyu ko'rish
  - /order - Buyurtma berish
  - /history - Buyurtmalar tarixi
  - /booking - Stol bron qilish
  - /help - Yordam
}
```

**Kerakli paketlar:**
```bash
npm install node-telegram-bot-api
npm install @types/node-telegram-bot-api --save-dev
```

#### 3.2. Telegram Web App (10-15 soat)
```
telegram-webapp/
├── index.html
├── styles.css
├── app.js
└── components/
    ├── menu.js
    ├── cart.js
    └── checkout.js
```

**Funksiyalar:**
- Menyu ko'rish (rasmlar bilan)
- Savatcha
- Buyurtma berish
- To'lov (Click/Payme/Uzum)
- Buyurtma tarixi

---

## 🟡 MEDIUM - 1 oyda qilish (2-4 hafta)

### 4. Pre-order va Booking (10-15 soat)
**Vaqt:** 10-15 soat  
**Prioritet:** 🟡 MEDIUM

#### 4.1. Booking Model
```typescript
// backend/src/models/Booking.ts
interface IBooking {
  customer: ObjectId
  customerName: string
  customerPhone: string
  table: ObjectId
  date: Date
  time: string
  guests: number
  status: 'pending' | 'confirmed' | 'cancelled'
  specialRequests?: string
}
```

#### 4.2. Pre-order Logic
```typescript
// backend/src/models/PreOrder.ts
interface IPreOrder {
  customer: ObjectId
  items: OrderItem[]
  scheduledFor: Date
  status: 'scheduled' | 'preparing' | 'ready' | 'completed'
}
```

#### 4.3. Frontend
```
app/booking/
├── page.tsx - Booking sahifasi
├── calendar.tsx - Kalendar
└── time-slots.tsx - Vaqt tanlash
```

---

### 5. CRM va Loyalty (12-16 soat)
**Vaqt:** 12-16 soat  
**Prioritet:** 🟡 MEDIUM

#### 5.1. CRM Frontend
```
app/admin/crm/
├── page.tsx - Mijozlar ro'yxati
├── [id]/
│   └── page.tsx - Mijoz profili
└── components/
    ├── customer-stats.tsx
    └── loyalty-manager.tsx
```

#### 5.2. Loyalty Service
```typescript
// backend/src/services/loyaltyService.ts
class LoyaltyService {
  // Bonus berish
  addPoints(customerId, amount)
  
  // Bonus ishlatish
  usePoints(customerId, points)
  
  // Cashback hisoblash
  calculateCashback(orderAmount)
  
  // VIP status
  checkVIPStatus(customer)
}
```

#### 5.3. Maxsus Takliflar
```typescript
// backend/src/models/Promotion.ts
interface IPromotion {
  title: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  validFrom: Date
  validTo: Date
  targetCustomers: 'all' | 'vip' | 'new'
}
```

---

## 🟢 LOW - Kelajakda (1-2 oy)

### 6. KPI va Advanced Analytics (8-12 soat)
**Vaqt:** 8-12 soat  
**Prioritet:** 🟢 LOW

#### 6.1. Ofitsiantlar Reytingi
```typescript
// backend/src/services/kpiService.ts
class KPIService {
  // Ofitsiant statistikasi
  getWaiterStats(waiterId, period) {
    - Buyurtmalar soni
    - O'rtacha check
    - Mijozlar reytingi
    - Tezlik (order to payment time)
  }
  
  // Oshpaz statistikasi
  getChefStats(chefId, period) {
    - Tayyorlangan taomlar
    - O'rtacha vaqt
    - Kechikishlar
  }
}
```

#### 6.2. Marjinallik Tahlili
```typescript
// backend/src/services/profitAnalysisService.ts
class ProfitAnalysisService {
  // Taom marjinalligi
  getMenuItemMargin(menuItemId) {
    const cost = calculateRecipeCost(menuItemId)
    const price = menuItem.price
    const margin = ((price - cost) / price) * 100
    return { cost, price, margin }
  }
  
  // Eng foydali taomlar
  getTopProfitableItems(period)
}
```

---

### 7. Qo'shimcha Funksiyalar (20+ soat)

#### 7.1. SMS Xabarnomalar (4 soat)
- Eskiz.uz yoki Playmobile integratsiyasi
- Buyurtma tasdiqlanishi
- Booking confirmation
- Promo xabarlar

#### 7.2. Email Hisobotlar (3 soat)
- Kunlik hisobotlar
- Haftalik analitika
- Oylik moliyaviy hisobot

#### 7.3. QR Menu (2 soat)
- Har bir stol uchun QR code
- Mijoz QR ni skanerlaydi
- Telegram Web App ochiladi
- Buyurtma beradi

#### 7.4. Kitchen Display System (KDS) Yaxshilash (4 soat)
- Normativ vaqt belgilash
- Rang o'zgarishi (qizil - kechikish)
- Ovozli signal
- Statistika

#### 7.5. Waiter Call System (2 soat)
- Mijoz ofitsiantni chaqiradi
- Real-time notification
- Response tracking

---

## 📋 UMUMIY VAQT BAHOLASH

| Vazifa | Prioritet | Vaqt | Holat |
|--------|-----------|------|-------|
| ✅ Avtomatik write-off | 🔴 CRITICAL | 6 soat | ✅ Bajarildi |
| To'lov tizimlari | 🔴 HIGH | 15-20 soat | ❌ Qilinmagan |
| Telegram Bot | 🔴 HIGH | 20-30 soat | ❌ Qilinmagan |
| Pre-order & Booking | 🟡 MEDIUM | 10-15 soat | ❌ Qilinmagan |
| CRM & Loyalty | 🟡 MEDIUM | 12-16 soat | ⚠️ 30% tayyor |
| KPI & Analytics | 🟢 LOW | 8-12 soat | ⚠️ 50% tayyor |
| Qo'shimcha | 🟢 LOW | 20+ soat | ⚠️ 20% tayyor |
| **JAMI** | | **91-119 soat** | **70% tayyor** |

---

## 🚀 TAVSIYA QILINADIGAN TARTIB

### 1-hafta: To'lov Tizimlari
- Click integratsiyasi (2 kun)
- Payme integratsiyasi (2 kun)
- Uzum Pay integratsiyasi (2 kun)
- Test va debug (1 kun)

### 2-3 hafta: Telegram Bot
- Bot backend (1 hafta)
- Web App frontend (1 hafta)
- Test va optimizatsiya (3 kun)

### 4-hafta: Pre-order & Booking
- Backend models va logic (2 kun)
- Frontend interfeys (2 kun)
- Test (1 kun)

### 5-6 hafta: CRM & Loyalty
- CRM frontend (1 hafta)
- Loyalty logic (3 kun)
- Promo system (2 kun)

### 7-8 hafta: Analytics & KPI
- KPI service (3 kun)
- Advanced analytics (3 kun)
- Hisobotlar (2 kun)

---

## 📞 YORDAM VA RESURSLAR

### API Dokumentatsiyalar:
- **Click:** https://docs.click.uz/
- **Payme:** https://developer.help.paycom.uz/
- **Uzum Pay:** https://uzumpay.uz/developers
- **Telegram Bot:** https://core.telegram.org/bots/api

### Kerakli Paketlar:
```bash
# To'lov tizimlari
npm install axios crypto

# Telegram
npm install node-telegram-bot-api

# SMS
npm install axios

# Email
npm install nodemailer
```

### Test Muhitlar:
- Click: test.click.uz
- Payme: test.paycom.uz
- Telegram: @BotFather (test bot yaratish)

---

## ✅ XULOSA

**Hozirgi holat:** Restoran ichidagi barcha funksiyalar tayyor ✅

**Keyingi qadam:** To'lov tizimlari va Telegram bot (mijozlar uchun)

**Umumiy vaqt:** 2-3 oy (part-time) yoki 1-1.5 oy (full-time)

**Tavsiya:** Bosqichma-bosqich qo'shing, har bir funksiyani test qilib boring.

---

**Yaratildi:** 2026-02-07  
**Versiya:** 1.0.0  
**Muallif:** Kiro AI
