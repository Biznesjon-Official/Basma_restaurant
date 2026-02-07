# Database Seed Instructions

## Barcha Foydalanuvchilarni Yaratish

Barcha rollar uchun test foydalanuvchilarni yaratish:

```bash
npm run create-all-users
```

### Yaratilgan Foydalanuvchilar

#### 👑 ADMIN (2 ta)
- **Admin Akbar** - 998901111111 / admin123
- **Admin Dilshod** - 998901111112 / admin123

#### 🍽️ OFITSIANT / WAITER (3 ta)
- **Ofitsiant Ali** (Ertalab) - 998902222221 / waiter123
- **Ofitsiant Bobur** (Kechqurun) - 998902222222 / waiter123
- **Ofitsiant Sardor** (Kecha) - 998902222223 / waiter123

#### 👨‍🍳 OSHPAZ / CHEF (3 ta)
- **Oshpaz Vali** (Ertalab) - 998903333331 / chef123
- **Oshpaz Rustam** (Kechqurun) - 998903333332 / chef123
- **Oshpaz Jamshid** (Kecha) - 998903333333 / chef123

#### 📦 OMBORCHI / STOREKEEPER (2 ta)
- **Omborchi Karim** - 998904444441 / store123
- **Omborchi Aziz** - 998904444442 / store123

#### 💰 KASSIR / CASHIER (3 ta)
- **Kassir Dilnoza** (Ertalab) - 998905555551 / cashier123
- **Kassir Malika** (Kechqurun) - 998905555552 / cashier123
- **Kassir Nodira** (Kecha) - 998905555553 / cashier123

**JAMI:** 13 ta xodim

---

## Full Seed (To'liq Tozalash)

Database'ni to'liq tozalash:

```bash
npm run full-seed
```

### Bu script nima qiladi?

1. **To'liq tozalash** - Barcha collectionlarni o'chiradi:
   - Users
   - Menu Items
   - Tables
   - Inventory
   - Orders
   - Customers
   - Activity Logs
   - Expenses
   - Incomes
   - Marketplace Orders
   - Recipes
   - Settings
   - Staff
   - Inventory Transactions

2. **Hardcoded Admin** - Admin kodda hardcoded, DB da yaratilmaydi:
   - Telefon: `901234567`
   - Parol: `admin123`
   - Role: `admin`

---

## Oddiy Seed (Test Ma'lumotlar)

Menu, stollar, ombor va test foydalanuvchilar yaratish:

```bash
npm run seed
```

Bu script quyidagilarni yaratadi:
- 19 ta menu elementi
- 12 ta stol
- 10 ta ombor mahsuloti
- 5 ta test foydalanuvchi (har bir rol uchun)

---

## Ma'lumotlarni Tozalash

Barcha ma'lumotlarni o'chirish (faqat admin userlarni saqlaydi):

```bash
npm run clear
```

---

## Muhim Eslatmalar

⚠️ **DIQQAT**: 
- `full-seed` va `clear` scriptlari barcha ma'lumotlarni o'chiradi!
- Production muhitda ishlatmang!
- Faqat development va testing uchun foydalaning.

✅ **Xavfsiz:**
- `create-all-users` mavjud foydalanuvchilarni o'zgartirmaydi
- Faqat yangi foydalanuvchilarni qo'shadi
- Agar telefon raqam allaqachon mavjud bo'lsa, o'tkazib yuboriladi
