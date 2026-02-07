# 🚀 BASMA Restaurant - Qayerdan Boshlash?

## 📚 Hujjatlar

### Development uchun:
1. **[QUICK_START.md](./QUICK_START.md)** ⭐ - 5 daqiqada ishga tushirish
2. **[README.md](./README.md)** - To'liq loyiha haqida ma'lumot

### Production Deploy uchun:
1. **[PRODUCTION_FINAL_CHECKLIST.md](./PRODUCTION_FINAL_CHECKLIST.md)** ⭐ - Qadamma-qadam checklist
2. **[PRODUCTION_DEPLOY_GUIDE.md](./PRODUCTION_DEPLOY_GUIDE.md)** - Batafsil qo'llanma
3. **[DEPLOY_WINDOWS.md](./DEPLOY_WINDOWS.md)** - Windows uchun maxsus

### Qo'shimcha:
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Keng qamrovli checklist
- **[PRODUCTION_READY.md](./PRODUCTION_READY.md)** - O'zgarishlar ro'yxati

---

## ⚡ Tezkor Yo'nalish

### Development (5 daqiqa):
```bash
# 1. Environment
cp .env.local.example .env.local
cd backend && cp .env.example .env && cd ..

# 2. Install
npm install
cd backend && npm install && cd ..

# 3. Seed
cd backend && npm run seed:users && cd ..

# 4. Run
npm run dev
```

**Login:** http://localhost:3001
- Admin: 998901111111 / admin123

---

### Production (15 daqiqa):
```bash
# 1. Environment sozlash
cp .env.production .env.local
cp backend/.env.production backend/.env
# JWT_SECRET ni o'zgartiring!

# 2. Avtomatik deploy
chmod +x deploy-production.sh
./deploy-production.sh

# 3. Nginx + SSL
sudo cp nginx-production.conf /etc/nginx/sites-available/basma
sudo ln -s /etc/nginx/sites-available/basma /etc/nginx/sites-enabled/
sudo certbot --nginx -d basma-restaurant.uz
```

**To'liq qo'llanma:** [PRODUCTION_FINAL_CHECKLIST.md](./PRODUCTION_FINAL_CHECKLIST.md)

---

## 🎯 Sizning Vazifangiz?

| Vazifa | Hujjat | Vaqt |
|--------|--------|------|
| Loyihani ishga tushirish (dev) | [QUICK_START.md](./QUICK_START.md) | 5 min |
| Production ga deploy qilish | [PRODUCTION_FINAL_CHECKLIST.md](./PRODUCTION_FINAL_CHECKLIST.md) | 30 min |
| Windows da deploy | [DEPLOY_WINDOWS.md](./DEPLOY_WINDOWS.md) | 30 min |
| Loyiha haqida o'rganish | [README.md](./README.md) | 10 min |
| Muammolarni hal qilish | [PRODUCTION_DEPLOY_GUIDE.md](./PRODUCTION_DEPLOY_GUIDE.md) | - |

---

## 📦 Loyiha Tuzilishi

```
basma-restaurant/
├── 📄 START_HERE.md                    ← Siz shu yerdasiz
├── 📄 QUICK_START.md                   ← Development boshlash
├── 📄 PRODUCTION_FINAL_CHECKLIST.md    ← Production checklist
├── 📄 PRODUCTION_DEPLOY_GUIDE.md       ← Deploy qo'llanma
├── 📄 README.md                        ← Loyiha haqida
│
├── 🔧 .env.production                  ← Frontend production env
├── 🔧 .env.local.example               ← Frontend dev env
├── 🚀 deploy-production.sh             ← Linux deploy script
├── 🚀 deploy-production.ps1            ← Windows deploy script
├── ⚙️ ecosystem.config.js              ← PM2 config
├── 🌐 nginx-production.conf            ← Nginx config
│
├── 📁 app/                             ← Next.js pages
├── 📁 components/                      ← React components
├── 📁 backend/                         ← Backend API
│   ├── 🔧 .env.production              ← Backend production env
│   ├── 🔧 .env.example                 ← Backend dev env
│   └── 📁 src/                         ← Source code
└── 📁 docs/                            ← Qo'shimcha hujjatlar
```

---

## 🆘 Yordam Kerakmi?

### Tez-tez so'raladigan savollar:

**Q: Qayerdan boshlashim kerak?**  
A: Development uchun [QUICK_START.md](./QUICK_START.md), Production uchun [PRODUCTION_FINAL_CHECKLIST.md](./PRODUCTION_FINAL_CHECKLIST.md)

**Q: Windows da qanday deploy qilaman?**  
A: [DEPLOY_WINDOWS.md](./DEPLOY_WINDOWS.md) ga qarang

**Q: Backend ishlamayapti, nima qilish kerak?**  
A: `pm2 logs basma-backend` buyrug'ini bajaring va loglarni tekshiring

**Q: MongoDB connection error**  
A: `.env` faylidagi `MONGODB_URI` ni tekshiring va MongoDB Atlas IP whitelist sozlamalarini ko'ring

**Q: Nginx 502 error**  
A: Backend ishlayotganini tekshiring: `curl http://localhost:5000/api/health`

---

## 📞 Qo'shimcha Ma'lumot

**Texnologiyalar:**
- Frontend: Next.js 15, React 18, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript, MongoDB, Socket.io
- Deploy: PM2, Nginx, Let's Encrypt

**Versiya:** 1.0.0  
**Status:** ✅ Production Ready  
**Oxirgi yangilanish:** 2026-02-07

---

**Muvaffaqiyatli ishlar!** 🎉
