# 📊 MongoDB Struktura - Stollar Joylashuvi

## 🌐 MongoDB Atlas Manzil

```
mongodb+srv://basmaprox:basmaprox2026@cluster0.1rfwets.mongodb.net/
```

## 📍 To'liq Yo'l (Hierarchy)

```
MongoDB Atlas Cloud
│
└─── Cluster0 (MongoDB Cluster)
     │
     └─── basma_osh_markazi (Database)
          │
          ├─── customers (Collection)
          ├─── tables (Collection) ⭐ STOLLAR SHU YERDA
          ├─── waitercalls (Collection)
          ├─── settings (Collection)
          ├─── expenses (Collection)
          ├─── staffs (Collection)
          ├─── incomes (Collection)
          ├─── recipes (Collection)
          ├─── inventories (Collection)
          ├─── menuitems (Collection)
          ├─── orders (Collection)
          ├─── inventorytransactions (Collection)
          ├─── activitylogs (Collection)
          ├─── users (Collection)
          └─── marketplaceorders (Collection)
```

## 📋 Tables Collection Tafsiloti

### Collection Ma'lumotlari
- **Database:** `basma_osh_markazi`
- **Collection:** `tables`
- **Hujjatlar soni:** 1 ta
- **Model fayl:** `backend/src/models/Table.ts`

### Hujjat Strukturasi

```javascript
{
  "_id": ObjectId("69871fd89ba6e965d0a919a3"),
  "number": 13,                    // Stol raqami
  "capacity": 10,                  // Sig'imi (kishi)
  "status": "available",           // Holat (available/occupied/reserved/cleaning)
  "qrCode": "5d7ca306aac3715d296f214e329cf7ba",  // ⭐ Unikal QR kod
  "qrCodeUrl": "https://marketplace.uz/table/5d7ca306aac3715d296f214e329cf7ba",
  "currentOrder": null,            // Joriy buyurtma (agar bo'lsa)
  "currentWaiter": null,           // Joriy afitsant (agar bo'lsa)
  "createdAt": ISODate("2026-02-07T11:19:52.000Z"),
  "updatedAt": ISODate("2026-02-07T11:20:05.000Z")
}
```

## 🔍 MongoDB Compass da Ko'rish

### 1. MongoDB Compass ni O'rnatish
```bash
# Windows
winget install MongoDB.Compass

# Mac
brew install --cask mongodb-compass

# Yoki: https://www.mongodb.com/try/download/compass
```

### 2. Ulanish
1. MongoDB Compass ni oching
2. "New Connection" tugmasini bosing
3. Connection string ni kiriting:
   ```
   mongodb+srv://basmaprox:basmaprox2026@cluster0.1rfwets.mongodb.net/
   ```
4. "Connect" tugmasini bosing

### 3. Stollarni Ko'rish
```
Connections
└─ cluster0.1rfwets.mongodb.net
   └─ basma_osh_markazi
      └─ tables  ← SHU YERNI BOSING
```

## 🌐 MongoDB Atlas Web Interface

### 1. Kirish
1. Brauzerda oching: https://cloud.mongodb.com/
2. Login qiling:
   - Email: (basmaprox account)
   - Password: (account password)

### 2. Stollarni Ko'rish
```
Dashboard
└─ Cluster0
   └─ Browse Collections
      └─ basma_osh_markazi
         └─ tables  ← SHU YERNI TANLANG
```

## 💻 Mongo Shell Orqali

### Ulanish va Ko'rish
```bash
# 1. Ulanish
mongosh "mongodb+srv://cluster0.1rfwets.mongodb.net/" --username basmaprox

# 2. Database ni tanlash
use basma_osh_markazi

# 3. Barcha stollarni ko'rish
db.tables.find().pretty()

# 4. Stollar sonini sanash
db.tables.countDocuments()

# 5. Bitta stolni topish
db.tables.findOne({ number: 13 })

# 6. QR kod bo'yicha qidirish
db.tables.findOne({ qrCode: "5d7ca306aac3715d296f214e329cf7ba" })

# 7. Faqat QR kodlarni ko'rish
db.tables.find({}, { number: 1, qrCode: 1, qrCodeUrl: 1 })
```

## 🔗 Backend API Orqali

### Barcha Stollarni Olish
```bash
# cURL
curl -X GET http://localhost:5002/api/tables \
  -H "Authorization: Bearer YOUR_TOKEN"

# PowerShell
Invoke-RestMethod -Uri "http://localhost:5002/api/tables" `
  -Headers @{ "Authorization" = "Bearer YOUR_TOKEN" }
```

### QR Kod Bo'yicha Topish (Public)
```bash
curl http://localhost:5002/api/tables/qr/5d7ca306aac3715d296f214e329cf7ba
```

## 📊 Hozirgi Holat

### Mavjud Stollar
| Stol # | Sig'im | Holat | QR Kod | QR URL |
|--------|--------|-------|--------|--------|
| 13 | 10 kishi | Bo'sh | ✅ Bor | ✅ Bor |

### QR Kod Ma'lumotlari
- **QR Kod:** `5d7ca306aac3715d296f214e329cf7ba`
- **URL:** `https://marketplace.uz/table/5d7ca306aac3715d296f214e329cf7ba`
- **Test URL:** `http://localhost:3001/table/5d7ca306aac3715d296f214e329cf7ba`

## 🛠️ Amaliy Misollar

### Yangi Stol Qo'shish (MongoDB Shell)
```javascript
db.tables.insertOne({
  number: 14,
  capacity: 4,
  status: "available",
  qrCode: "yangi_unikal_qr_kod_32_belgi",
  qrCodeUrl: "https://marketplace.uz/table/yangi_unikal_qr_kod_32_belgi",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Stolni Yangilash
```javascript
db.tables.updateOne(
  { number: 13 },
  { $set: { status: "occupied" } }
)
```

### QR Kodni Yangilash
```javascript
db.tables.updateOne(
  { number: 13 },
  { 
    $set: { 
      qrCode: "yangi_qr_kod",
      qrCodeUrl: "https://marketplace.uz/table/yangi_qr_kod",
      updatedAt: new Date()
    } 
  }
)
```

## 📱 Frontend Orqali

### Admin/Kassir Interface
1. Brauzerda oching: http://localhost:3001/login
2. Login: `998901111111` / Password: `admin123`
3. Sidebar → "Stollar"
4. Stol #13 ni bosing
5. QR kod va barcha ma'lumotlar ko'rinadi

### Mijoz Interface (QR Scan)
1. QR kodni skanlang yoki URL ni oching:
   ```
   http://localhost:3001/table/5d7ca306aac3715d296f214e329cf7ba
   ```
2. Stol ma'lumotlari va menu ko'rinadi
3. Buyurtma berish mumkin

## 🔐 Xavfsizlik

### Connection String
- ✅ `.env` faylida saqlanadi
- ✅ Git ignore qilingan
- ⚠️ Production da boshqa parol ishlatish kerak

### QR Kod
- ✅ 32 hex belgi (128 bit)
- ✅ Unique index
- ✅ Takrorlanish ehtimoli juda past

## 📝 Eslatmalar

1. **MongoDB Atlas Free Tier:**
   - 512 MB storage
   - Shared cluster
   - Yetarli development uchun

2. **Backup:**
   - Atlas avtomatik backup qiladi
   - Manual export: `mongodump`

3. **Monitoring:**
   - Atlas dashboard da ko'rish mumkin
   - Real-time metrics

## 🎯 Keyingi Qadamlar

1. ✅ Stollar MongoDB da saqlanmoqda
2. ✅ QR kodlar generatsiya qilinmoqda
3. ✅ Frontend va backend ishlayapti
4. 📝 Ko'proq stol qo'shish
5. 📝 Production ga deploy qilish
