# 🍽️ BASMA Osh Markazi - Loyiha Holati

## ✅ Tayyor Funksiyalar

### 1. Autentifikatsiya
- ✅ Login/Logout
- ✅ JWT token
- ✅ Role-based access (Admin, Waiter, Chef, Storekeeper, Cashier)

### 2. Admin Panel
- ✅ Dashboard (statistika, grafiklar)
- ✅ Menu boshqaruvi
- ✅ Stol boshqaruvi
- ✅ Xodimlar boshqaruvi
- ✅ Buyurtmalar ko'rish
- ✅ Ombor boshqaruvi
- ✅ Hisobotlar
- ✅ Sozlamalar
- ✅ Activity logs
- ✅ Export (Excel, PDF)

### 3. Waiter (Afitsiant)
- ✅ Stollarni ko'rish va boshqarish
- ✅ Yangi buyurtma yaratish
- ✅ Buyurtmaga taom qo'shish
- ✅ Buyurtmani oshxonaga yuborish
- ✅ Tayyor buyurtmalarni ko'rish
- ✅ Tashqi sayt buyurtmalarini ko'rish
- ✅ Real-time yangilanishlar

### 4. Chef (Oshpaz)
- ✅ Kitchen Display System (KDS)
- ✅ Yangi buyurtmalarni ko'rish
- ✅ Buyurtma statusini o'zgartirish
- ✅ Real-time yangilanishlar
- ✅ Ovoz bildirishnomasi

### 5. Storekeeper (Omborchi)
- ✅ Ombor qoldiqlari
- ✅ Mahsulot qabul qilish
- ✅ Inventarizatsiya
- ✅ Texnologik kartalar
- ✅ Hisobotlar
- ✅ Low stock alerts

### 6. Cashier (Kassir)
- ✅ Buyurtmalarni ko'rish
- ✅ To'lov qabul qilish
- ✅ Kassa hisoboti
- ✅ Chek chop etish

### 7. Tashqi Sayt Integratsiyasi
- ✅ Webhook qabul qilish
- ✅ Tashqi sayt buyurtmalarini waiter paneliga ko'rsatish
- ✅ Marketplace buyurtmalari
- ✅ Real-time yangilanishlar
- ✅ Faqat faol buyurtmalar (limit yo'q)

### 8. Real-time (WebSocket)
- ✅ Socket.io integratsiyasi
- ✅ Buyurtma yangilanishlari
- ✅ Low stock alerts
- ✅ Marketplace buyurtmalari

### 9. Database
- ✅ MongoDB Atlas
- ✅ Mongoose models
- ✅ Change Streams monitoring
- ✅ Backup/Restore

## 📊 Texnologiyalar

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Socket.io Client

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- Socket.io
- JWT Authentication

## 🔐 Login Ma'lumotlari

### Admin (2 ta)
- Phone: 998901111111 / Password: admin123 (Admin Akbar)
- Phone: 998901111112 / Password: admin123 (Admin Dilshod)

### Waiter / Ofitsiant (3 ta)
- Phone: 998902222221 / Password: waiter123 (Ali - Ertalab)
- Phone: 998902222222 / Password: waiter123 (Bobur - Kechqurun)
- Phone: 998902222223 / Password: waiter123 (Sardor - Kecha)

### Chef / Oshpaz (3 ta)
- Phone: 998903333331 / Password: chef123 (Vali - Ertalab)
- Phone: 998903333332 / Password: chef123 (Rustam - Kechqurun)
- Phone: 998903333333 / Password: chef123 (Jamshid - Kecha)

### Storekeeper / Omborchi (2 ta)
- Phone: 998904444441 / Password: store123 (Karim)
- Phone: 998904444442 / Password: store123 (Aziz)

### Cashier / Kassir (3 ta)
- Phone: 998905555551 / Password: cashier123 (Dilnoza - Ertalab)
- Phone: 998905555552 / Password: cashier123 (Malika - Kechqurun)
- Phone: 998905555553 / Password: cashier123 (Nodira - Kecha)

**JAMI:** 13 ta xodim

## 🚀 Ishga Tushirish

### Backend
```bash
cd backend
npm install
npm run dev
```
Port: 5001

### Frontend
```bash
npm install
npm run dev
```
Port: 3001

## 📝 API Endpoints

Backend API: `http://localhost:5001/api`

- `/auth/login` - Login
- `/waiter/*` - Waiter endpoints
- `/chef/*` - Chef endpoints
- `/storekeeper/*` - Storekeeper endpoints
- `/orders` - Orders (limit yo'q, faqat faol)
- `/menu` - Menu
- `/tables` - Tables
- `/inventory` - Inventory
- `/marketplace-orders` - Marketplace orders (limit yo'q)

## 🧹 Loyiha Tozalandi (2026-02-05)

**O'chirilgan backend fayllar:**
- ✅ checkCashier.ts - debugging script
- ✅ resetCashierPassword.ts - specific password reset
- ✅ createAdmin.ts - duplicate admin creation
- ✅ createCashier.ts - specific cashier creation
- ✅ USERS_SEED_GUIDE.md - duplicate documentation

**O'chirilgan frontend fayllar:**
- ✅ app/marketplace - bo'sh papka
- ✅ app/order - bo'sh papka
- ✅ app/admin/login - duplicate login page

**Jami:** 8 ta keraksiz fayl/papka o'chirildi

**Qolgan seed scriptlar:**
- ✅ seed.ts - test ma'lumotlar
- ✅ createAllUsers.ts - barcha foydalanuvchilar
- ✅ fullSeed.ts - to'liq tozalash
- ✅ clearData.ts - ma'lumotlarni tozalash

## 🎯 Keyingi Qadamlar

1. Production deployment
2. SMS notifications (Eskiz.uz)
3. Payment gateway integration
4. Mobile app (optional)

## 📞 Support

Muammolar yoki savollar bo'lsa, backend loglarini tekshiring:
```bash
cd backend
npm run dev
```

---

**Loyiha holati:** ✅ Production Ready & Clean
**Oxirgi yangilanish:** 2026-02-05
**Kod sifati:** Professional & Optimized
**Tozalangan:** 8 ta duplicate/keraksiz fayl o'chirildi
