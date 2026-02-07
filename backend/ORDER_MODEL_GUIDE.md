# 📦 Order Model - To'liq Qo'llanma

## 🎯 Umumiy Ma'lumot

Order modeli butun restaurant tizimining markaziy qismi. U **restoran ichidagi** va **tashqi platformalardan** kelgan buyurtmalarni boshqaradi.

---

## 📊 Model Strukturasi

### 1️⃣ **ORDER TYPE** - Buyurtma Turi

```typescript
orderType: 'restaurant' | 'marketplace'  // MAJBURIY
```

- **restaurant** - Restoran ichidagi buyurtmalar (stolda o'tirgan mijozlar)
- **marketplace** - Tashqi platformalardan (Yandex, Uzum, Telegram, Website)

---

### 2️⃣ **RESTAURANT ORDER** - Restoran Buyurtmalari

```typescript
{
  table: ObjectId,           // Stol ID
  tableNumber: number,       // Stol raqami (1, 2, 3...)
  waiter: ObjectId,          // Ofitsiant ID
}
```

**Misol:**
```json
{
  "orderType": "restaurant",
  "tableNumber": 5,
  "waiter": "6985b132f20abbc07be4dcfc"
}
```

---

### 3️⃣ **MARKETPLACE ORDER** - Tashqi Buyurtmalar

```typescript
{
  marketplaceOrderId: string,                    // Tashqi platform order ID
  marketplaceName: 'Yandex' | 'Uzum' | 'Telegram' | 'Website' | 'Other'
}
```

**Misol:**
```json
{
  "orderType": "marketplace",
  "marketplaceName": "Yandex",
  "marketplaceOrderId": "YA-12345"
}
```

---

### 4️⃣ **CUSTOMER INFO** - Mijoz Ma'lumotlari

```typescript
{
  userId: ObjectId | null,   // Ro'yxatdan o'tgan mijoz (null = guest)
  customerName: string,      // Mijoz ismi
  customerPhone: string,     // Telefon raqami
  customerAddress: string    // Manzil
}
```

**Misol (Guest):**
```json
{
  "userId": null,
  "customerName": "Ali Valiyev",
  "customerPhone": "+998901234567"
}
```

**Misol (Registered):**
```json
{
  "userId": "6985b132f20abbc07be4dcfc",
  "customerName": "Ali Valiyev",
  "customerPhone": "+998901234567"
}
```

---

### 5️⃣ **DELIVERY INFO** - Yetkazib Berish

```typescript
{
  deliveryType: 'delivery' | 'pickup' | 'dine-in',
  deliveryFee: number,
  deliveryTime: Date,
  deliveryAddress: string
}
```

**Misol:**
```json
{
  "deliveryType": "delivery",
  "deliveryFee": 15000,
  "deliveryTime": "2026-02-06T18:00:00Z",
  "deliveryAddress": "Toshkent, Chilonzor 12-kvartal"
}
```

---

### 6️⃣ **ORDER ITEMS** - Mahsulotlar

```typescript
items: [{
  menuItemId: ObjectId,      // Menyu mahsulot ID
  name: string,              // Mahsulot nomi
  price: number,             // Narxi
  quantity: number,          // Miqdori
  specialInstructions: string // Maxsus talablar
}]
```

**Misol:**
```json
{
  "items": [
    {
      "menuItemId": "69858f5ee4e1c425e2bdba32",
      "name": "Osh",
      "price": 25000,
      "quantity": 2,
      "specialInstructions": "Kam yog'li"
    },
    {
      "menuItemId": "69858f5ee4e1c425e2bdba33",
      "name": "Somsa",
      "price": 7000,
      "quantity": 3
    }
  ]
}
```

---

### 7️⃣ **PRICING** - Narxlar

```typescript
{
  subtotal: number,          // Mahsulotlar summasi
  deliveryFee: number,       // Yetkazib berish
  serviceFee: number,        // Xizmat to'lovi
  discount: number,          // Chegirma
  totalAmount: number        // JAMI (MAJBURIY)
}
```

**Hisoblash:**
```
totalAmount = subtotal + deliveryFee + serviceFee - discount
```

**Misol:**
```json
{
  "subtotal": 71000,
  "deliveryFee": 15000,
  "serviceFee": 5000,
  "discount": 10000,
  "totalAmount": 81000
}
```

---

### 8️⃣ **STATUS** - Holat

```typescript
status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 
        'served' | 'delivering' | 'delivered' | 'completed' | 'cancelled'
```

**Oqim:**

**Restaurant:**
```
pending → confirmed → preparing → ready → served → completed
```

**Marketplace (Delivery):**
```
pending → confirmed → preparing → ready → delivering → delivered → completed
```

**Marketplace (Pickup):**
```
pending → confirmed → preparing → ready → completed
```

---

### 9️⃣ **PAYMENT** - To'lov

```typescript
{
  paymentMethod: 'cash' | 'card' | 'online' | 'prepaid',
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed',
  paidAt: Date
}
```

**Misol:**
```json
{
  "paymentMethod": "online",
  "paymentStatus": "paid",
  "paidAt": "2026-02-06T14:30:00Z"
}
```

---

## 🔧 API Endpoints

### Create Order (Buyurtma Yaratish)

**Endpoint:** `POST /api/orders`

**Restaurant Order:**
```json
{
  "orderType": "restaurant",
  "tableNumber": 5,
  "items": [
    {
      "menuItemId": "69858f5ee4e1c425e2bdba32",
      "name": "Osh",
      "price": 25000,
      "quantity": 2
    }
  ],
  "totalAmount": 50000,
  "paymentMethod": "cash"
}
```

**Marketplace Order (Guest):**
```json
{
  "orderType": "marketplace",
  "marketplaceName": "Yandex",
  "customerName": "Ali Valiyev",
  "customerPhone": "+998901234567",
  "customerAddress": "Toshkent, Chilonzor",
  "deliveryType": "delivery",
  "deliveryFee": 15000,
  "items": [
    {
      "menuItemId": "69858f5ee4e1c425e2bdba32",
      "name": "Osh",
      "price": 25000,
      "quantity": 1
    }
  ],
  "totalAmount": 40000,
  "paymentMethod": "online",
  "paymentStatus": "paid"
}
```

---

## 🔄 Backward Compatibility (Eski Format Qo'llab-quvvatlash)

Backend avtomatik ravishda eski formatlarni yangi formatga convert qiladi:

### ✅ Auto-Conversions:

1. **guestInfo → customerName/customerPhone**
   ```json
   // Eski format
   { "guestInfo": { "name": "Ali", "phone": "+998901234567" } }
   
   // Yangi format (avtomatik)
   { "customerName": "Ali", "customerPhone": "+998901234567" }
   ```

2. **status: 'new' → 'pending'**
   ```json
   // Eski
   { "status": "new" }
   
   // Yangi (avtomatik)
   { "status": "pending" }
   ```

3. **paymentMethod: 'click'/'payme'/'uzum' → 'online'**
   ```json
   // Eski
   { "paymentMethod": "click" }
   
   // Yangi (avtomatik)
   { "paymentMethod": "online" }
   ```

4. **total → totalAmount**
   ```json
   // Eski
   { "total": 50000 }
   
   // Yangi (avtomatik)
   { "totalAmount": 50000 }
   ```

5. **orderType avtomatik aniqlash**
   - Agar `table` yoki `tableNumber` bo'lsa → `'restaurant'`
   - Agar `customerName` yoki `customerPhone` bo'lsa → `'marketplace'`
   - Default → `'restaurant'`

---

## 📈 Model Methods

### Instance Methods:

```typescript
// Total hisoblash
order.calculateTotal()

// To'langan deb belgilash
await order.markAsPaid()

// Bekor qilish
await order.cancel("Mijoz bekor qildi")
```

### Static Methods:

```typescript
// Faol buyurtmalar
const activeOrders = await Order.getActiveOrders()

// Bugungi buyurtmalar
const todayOrders = await Order.getTodayOrders()

// Marketplace buyurtmalari
const marketplaceOrders = await Order.getMarketplaceOrders('pending')
```

---

## 🎯 Best Practices

### ✅ DO (Qiling):

1. Har doim `orderType` ni belgilang
2. `totalAmount` ni to'g'ri hisoblang
3. Status o'zgarishlarini ketma-ket bajaring
4. Marketplace buyurtmalarda `customerName` va `customerPhone` majburiy

### ❌ DON'T (Qilmang):

1. `status` ni o'tkazib yuborish (pending → ready)
2. `totalAmount` ni items summasi bilan mos kelmasa
3. Restaurant buyurtmada `tableNumber` yo'q
4. Marketplace buyurtmada `customerPhone` yo'q

---

## 🔍 Qidiruv va Filter

### Status bo'yicha:
```javascript
GET /api/orders?status=pending,confirmed,preparing
```

### OrderType bo'yicha:
```javascript
GET /api/orders?orderType=marketplace
```

### Stol bo'yicha:
```javascript
GET /api/orders?tableNumber=5
```

### Kombinatsiya:
```javascript
GET /api/orders?orderType=marketplace&status=pending,confirmed&limit=20
```

---

## 📝 Xulosa

Bu Order model:
- ✅ Restaurant va Marketplace buyurtmalarni qo'llab-quvvatlaydi
- ✅ Eski formatlarni avtomatik convert qiladi
- ✅ To'liq validatsiya va indexlar bilan
- ✅ Virtual fields va metodlar bilan
- ✅ Real-time tracking uchun timestamps

**Savol bo'lsa, so'rang!** 🚀
