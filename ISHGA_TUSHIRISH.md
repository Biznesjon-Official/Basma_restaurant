# 🚀 BASMA LOYIHALARI - ISHGA TUSHIRISH

## ✅ HOZIRGI HOLAT

Ikkala loyiha ham muvaffaqiyatli ishga tushdi!

---

## 📊 BASMA RESTAURANT (Admin Panel)

### 🌐 URLs:
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:5000
- **Socket.io:** ws://localhost:5000

### 🔑 Login Ma'lumotlari:

#### 👑 ADMIN
```
Telefon: 998901111111
Parol:   admin123
URL:     http://localhost:3001/login
```

#### 🍽️ OFITSIANT (Waiter)
```
Telefon: 998902222221
Parol:   waiter123
```

#### 👨‍🍳 OSHPAZ (Chef)
```
Telefon: 998903333331
Parol:   chef123
```

#### 📦 OMBORCHI (Storekeeper)
```
Telefon: 998904444441
Parol:   store123
```

#### 💰 KASSIR (Cashier)
```
Telefon: 998905555551
Parol:   cashier123
```

### 📱 Sahifalar:
- **Admin Dashboard:** http://localhost:3001/admin/dashboard
- **Xodimlar:** http://localhost:3001/staff
- **Menu:** http://localhost:3001/menu
- **Orders:** http://localhost:3001/orders
- **Inventory:** http://localhost:3001/inventory
- **Customers:** http://localhost:3001/customers
- **Reports:** http://localhost:3001/reports

---

## 🛒 BASMA MARKETPLACE (Customer App)

### 🌐 URLs:
- **Local:** http://localhost:3000
- **Network:** http://192.168.1.14:3000

### 📱 Sahifalar:
- **Menu:** http://localhost:3000/menu
- **Cart:** http://localhost:3000/cart
- **Orders:** http://localhost:3000/orders
- **Profile:** http://localhost:3000/profile
- **Tables:** http://localhost:3000/tables

### 🔑 Login:
- Ro'yxatdan o'tish yoki mavjud akkaunt bilan kirish
- Telefon format: +998 XX XXX XX XX

---

## 🔧 BACKEND API

### Health Check:
```bash
curl http://localhost:5000/api/health
```

### API Endpoints:
- **Auth:** http://localhost:5000/api/auth
- **Users:** http://localhost:5000/api/users
- **Menu:** http://localhost:5000/api/menu
- **Orders:** http://localhost:5000/api/orders
- **Tables:** http://localhost:5000/api/tables
- **Inventory:** http://localhost:5000/api/inventory

---

## 🛠️ Ishga Tushirish Buyruqlari

### Backend:
```bash
cd "Basma restarant/backend"
npm run dev
```

### Restaurant Frontend:
```bash
cd "Basma restarant"
npm run dev
```

### Marketplace Frontend:
```bash
cd "Basma marketplace"
npm run dev
```

---

## 📊 Database

### MongoDB:
- **Connection:** mongodb+srv://basmaprox:basmaprox2026@cluster0.1rfwets.mongodb.net/basma_osh_markazi
- **Database:** basma_osh_markazi

### Seed Data:
```bash
cd "Basma restarant/backend"
npm run full-seed        # To'liq seed
npm run create-all-users # Faqat userlar
```

---

## 🔍 Monitoring

### Real-time Features:
- ✅ Order monitoring (Change Streams)
- ✅ Inventory monitoring
- ✅ Socket.io real-time updates
- ✅ Waiter call notifications

---

## 🐛 Troubleshooting

### Port band bo'lsa:
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Process o'chirish
taskkill /PID <PID> /F
```

### Environment variables:
```bash
# Basma restarant/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Basma marketplace/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Cache tozalash:
```bash
# Next.js cache
rm -rf .next

# Node modules
rm -rf node_modules
npm install
```

---

## ✅ Barcha Servislar Ishlamoqda!

Endi brauzerda ochishingiz mumkin:
- Restaurant Admin: http://localhost:3001
- Marketplace: http://localhost:3000
