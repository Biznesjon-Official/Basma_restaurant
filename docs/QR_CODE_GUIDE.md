# QR Kod Tizimi - Foydalanish Qo'llanmasi

## Umumiy Ma'lumot

Har bir stol uchun unikal QR kod yaratiladi. Mijozlar bu QR kodni skanlab, afitsantsiz o'zlari buyurtma berishlari mumkin.

## Xususiyatlar

### 1. Avtomatik QR Kod Generatsiyasi
- Yangi stol qo'shilganda avtomatik ravishda unikal QR kod yaratiladi
- Har bir QR kod kriptografik usulda generatsiya qilinadi (32 ta hex belgi)
- QR kod URL: `https://marketplace.uz/table/{qrCode}`

### 2. QR Kod Boshqaruvi
- **Ko'rish**: Stollar sahifasida har bir stolning QR kodini ko'rish mumkin
- **Yuklab olish**: PNG yoki SVG formatda yuklab olish
- **Yangilash**: Xavfsizlik uchun QR kodni qayta generatsiya qilish

### 3. Mijozlar Uchun Interfeys
- QR kodni skanlash orqali stol sahifasiga o'tish
- Menuni ko'rish va mahsulotlarni tanlash
- Savatga qo'shish va buyurtma berish
- Ism va telefon raqamini kiritish

## Foydalanish

### Admin/Kassir Uchun

1. **Stollar sahifasiga o'tish**
   - Sidebar → Stollar

2. **Stolni tanlash**
   - Stol raqamiga bosing

3. **QR Kodni Ko'rish**
   - Dialog oynasida QR kod ko'rsatiladi
   - QR kod rasmini ko'rish mumkin

4. **QR Kodni Yuklab Olish**
   - PNG tugmasi - rasm formatda
   - SVG tugmasi - vektor formatda
   - Yuklab olingan faylni chop etish mumkin

5. **QR Kodni Yangilash**
   - "Yangilash" tugmasini bosing
   - Tasdiqlash so'raladi
   - Yangi QR kod yaratiladi (eski kod ishlamay qoladi)

### Mijozlar Uchun

1. **QR Kodni Skanlash**
   - Telefon kamerasini QR kodga yo'naltiring
   - Yoki QR kod skaner ilovasidan foydalaning

2. **Menuni Ko'rish**
   - Avtomatik ravishda stol sahifasi ochiladi
   - Barcha mavjud taomlar ko'rsatiladi
   - Kategoriyalar bo'yicha ajratilgan

3. **Buyurtma Berish**
   - Taomni tanlang va "Qo'shish" tugmasini bosing
   - Savatga qo'shiladi
   - "Savat" tugmasini bosing

4. **Buyurtmani Tasdiqlash**
   - Ismingizni kiriting (majburiy)
   - Telefon raqamingizni kiriting (ixtiyoriy)
   - "Buyurtma berish" tugmasini bosing

5. **Tasdiqlash**
   - Buyurtma oshxonaga yuboriladi
   - Muvaffaqiyatli xabar ko'rsatiladi

## API Endpointlar

### Backend Routes

```typescript
// Stolni QR kod orqali topish (public)
GET /api/tables/qr/:qrCode

// QR kod rasmini olish (PNG)
GET /api/tables/:id/qr-image

// QR kod rasmini olish (SVG)
GET /api/tables/:id/qr-svg

// QR kodni yangilash
POST /api/tables/:id/regenerate-qr

// Menuni olish (public)
GET /api/menu/public?available=true

// Buyurtma berish (public)
POST /api/orders/public
```

### Frontend Routes

```
/table/[qrCode] - Mijozlar uchun buyurtma sahifasi
/tables - Admin/Kassir uchun stollar boshqaruvi
```

## Xavfsizlik

1. **QR Kod Unikalligi**
   - Har bir QR kod 32 ta hex belgi (128 bit)
   - Takrorlanish ehtimoli juda past
   - Database da unique index

2. **QR Kod Yangilash**
   - Faqat admin roli yangilashi mumkin
   - Eski QR kod avtomatik bekor qilinadi
   - Yangi QR kod darhol faol bo'ladi

3. **Public Endpointlar**
   - Faqat zarur ma'lumotlar qaytariladi
   - Narx va cost ma'lumotlari himoyalangan
   - Rate limiting qo'llaniladi

## Chop Etish Uchun Tavsiyalar

1. **QR Kod O'lchami**
   - Minimal: 3x3 cm
   - Tavsiya etilgan: 5x5 cm yoki kattaroq
   - Uzoqdan skanlanishi uchun kattaroq qiling

2. **Joylashtirish**
   - Stol markazida
   - Ko'rinadigan joyda
   - Toza va shaffof qoplamada

3. **Dizayn**
   - Oq fon, qora QR kod
   - Stol raqamini qo'shing
   - "Buyurtma berish uchun skanlang" yozuvini qo'shing

4. **Material**
   - Suv o'tkazmaydigan material
   - Laminatlangan qog'oz
   - Plastik karta

## Muammolarni Hal Qilish

### QR Kod Ishlamayapti
1. QR kod yangilanganmi tekshiring
2. Internet aloqasini tekshiring
3. QR kodni qayta generatsiya qiling

### Buyurtma Yuborilmayapti
1. Barcha maydonlar to'ldirilganini tekshiring
2. Savat bo'sh emasligini tekshiring
3. Server ishlab turganini tekshiring

### QR Kod Yuklanmayapti
1. Tizimga kirganingizni tekshiring
2. Admin yoki kassir roliga ega ekanligingizni tekshiring
3. Brauzer keshini tozalang

## Kelajakdagi Yaxshilanishlar

- [ ] QR kod dizaynini sozlash
- [ ] Logo qo'shish imkoniyati
- [ ] Rang sxemasini o'zgartirish
- [ ] Bir nechta QR kodni birga yuklab olish
- [ ] QR kod statistikasi (necha marta skanlangan)
- [ ] Mijozlar uchun til tanlash
- [ ] Afitsantni chaqirish tugmasi
- [ ] Buyurtma holatini kuzatish
