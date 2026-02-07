# QR Kod Tizimi Test

## Test Qadamlari

### 1. Tizimga Kirish
- URL: http://localhost:3001/login
- Phone: 998901111111
- Password: admin123

### 2. Stollar Sahifasiga O'tish
- Sidebar → Stollar
- Yoki: http://localhost:3001/tables

### 3. Yangi Stol Qo'shish
- "Yangi stol" tugmasini bosing
- Stol raqami: 1
- Sig'imi: 4
- Holat: Bo'sh
- "Qo'shish" tugmasini bosing

### 4. QR Kodni Ko'rish
- Stol #1 ni bosing
- Dialog oynasida QR kod ko'rsatiladi
- QR kod rasmi ko'rinadi

### 5. QR Kodni Yuklab Olish
- PNG tugmasini bosing → stol-1-qr.png yuklanadi
- SVG tugmasini bosing → stol-1-qr.svg yuklanadi

### 6. QR Kodni Test Qilish
- QR kodni telefon bilan skanlang
- Yoki brauzerda URL ni qo'lda kiriting:
  - Backend loglaridan qrCode ni oling
  - URL: http://localhost:3001/table/{qrCode}

### 7. Mijoz Interfeysi
- Stol ma'lumotlari ko'rsatiladi
- Menu ko'rsatiladi (kategoriyalar bo'yicha)
- Taomlarni savatga qo'shish
- Buyurtma berish

### 8. QR Kodni Yangilash
- Stol dialogida "Yangilash" tugmasini bosing
- Tasdiqlang
- Yangi QR kod yaratiladi
- Eski QR kod ishlamay qoladi

## API Testlar

### Stolni QR kod orqali topish
```bash
curl http://localhost:5002/api/tables/qr/{qrCode}
```

### QR kod rasmini olish
```bash
curl http://localhost:5002/api/tables/{tableId}/qr-image -H "Authorization: Bearer {token}" > qr.png
```

### Menuni olish (public)
```bash
curl http://localhost:5002/api/menu/public?available=true
```

### Buyurtma berish (public)
```bash
curl -X POST http://localhost:5002/api/orders/public \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "...",
    "tableNumber": 1,
    "items": [
      {
        "menuItem": "...",
        "quantity": 2,
        "price": 25000
      }
    ],
    "customerName": "Test Mijoz",
    "customerPhone": "+998901234567",
    "orderType": "dine-in",
    "status": "pending"
  }'
```

## Kutilgan Natijalar

✅ Stol yaratilganda avtomatik QR kod generatsiya qilinadi
✅ QR kod PNG/SVG formatda yuklanadi
✅ QR kod skanlanganida mijoz sahifasi ochiladi
✅ Mijoz menuni ko'radi va buyurtma beradi
✅ Buyurtma oshxonaga yuboriladi
✅ QR kod yangilanganida eski kod ishlamaydi

## Muammolar va Yechimlar

### QR kod ko'rinmayapti
- Token mavjudligini tekshiring
- Admin yoki kassir roliga ega ekanligingizni tekshiring

### Mijoz sahifasi ochilmayapti
- QR kod to'g'ri ekanligini tekshiring
- Backend server ishlab turganini tekshiring
- URL to'g'ri formatda ekanligini tekshiring

### Buyurtma yuborilmayapti
- Barcha maydonlar to'ldirilganini tekshiring
- Menu itemlar mavjudligini tekshiring
- Backend loglarini tekshiring
