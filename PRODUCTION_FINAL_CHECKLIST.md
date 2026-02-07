# ✅ Production Deploy - Yakuniy Checklist

## 🎯 Deploy Oldidan (5 daqiqa)

### 1. Environment Fayllar
```bash
# Frontend
[ ] .env.production yaratildi
[ ] NEXT_PUBLIC_APP_URL to'g'ri
[ ] NEXT_PUBLIC_API_URL to'g'ri

# Backend
[ ] backend/.env.production yaratildi
[ ] MONGODB_URI production database
[ ] JWT_SECRET o'zgartirildi (64+ char)
[ ] FRONTEND_URL production domain
[ ] RATE_LIMIT_MAX_REQUESTS = 50
```

### 2. Database
```bash
[ ] MongoDB Atlas production database yaratildi
[ ] Database user yaratildi (murakkab parol)
[ ] IP Whitelist sozlandi
[ ] Connection string test qilindi
```

### 3. Kod Tekshiruv
```bash
[ ] TypeScript errors yo'q
[ ] Build muvaffaqiyatli (npm run build)
[ ] Backend build muvaffaqiyatli (cd backend && npm run build)
[ ] .gitignore da .env fayllar bor
```

## 🚀 Deploy Jarayoni (10 daqiqa)

### 4. Server Tayyorlash
```bash
[ ] Node.js 18+ o'rnatildi
[ ] PM2 o'rnatildi (npm install -g pm2)
[ ] Git repository clone qilindi
[ ] Dependencies o'rnatildi
```

### 5. Build va Deploy
```bash
# Avtomatik (tavsiya etiladi)
[ ] chmod +x deploy-production.sh
[ ] ./deploy-production.sh

# Yoki manual
[ ] npm install --production
[ ] npm run build
[ ] cd backend && npm install --production && npm run build
[ ] pm2 start ecosystem.config.js
[ ] pm2 save
```

### 6. Health Check
```bash
[ ] Backend: curl http://localhost:5000/api/health
[ ] Frontend: curl http://localhost:3001
[ ] PM2 status: pm2 status
[ ] Loglar: pm2 logs (xatolar yo'q)
```

## 🌐 Web Server (15 daqiqa)

### 7. Nginx
```bash
[ ] Nginx o'rnatildi
[ ] nginx-production.conf ko'chirildi
[ ] Symlink yaratildi
[ ] nginx -t (test muvaffaqiyatli)
[ ] systemctl restart nginx
```

### 8. SSL Certificate
```bash
[ ] Certbot o'rnatildi
[ ] SSL certificate olindi
[ ] HTTPS ishlayapti
[ ] HTTP -> HTTPS redirect ishlayapti
[ ] Auto-renewal sozlandi
```

### 9. Domain
```bash
[ ] DNS A record sozlandi
[ ] Domain ping qilinyapti
[ ] HTTPS orqali ochiladi
```

## 🔒 Xavfsizlik (10 daqiqa)

### 10. Parollar
```bash
[ ] JWT_SECRET o'zgartirildi
[ ] MongoDB parol murakkab
[ ] Admin parol o'zgartirildi
[ ] Waiter parol o'zgartirildi
[ ] Chef parol o'zgartirildi
[ ] Storekeeper parol o'zgartirildi
[ ] Cashier parol o'zgartirildi
```

### 11. Firewall
```bash
[ ] UFW yoqildi (Linux)
[ ] Port 22 (SSH) ochiq
[ ] Port 80 (HTTP) ochiq
[ ] Port 443 (HTTPS) ochiq
[ ] Port 3001, 5000 yopiq (faqat localhost)
```

### 12. MongoDB
```bash
[ ] IP Whitelist faqat server IP
[ ] Database backup yoqildi
[ ] Monitoring yoqildi
```

## 📊 Monitoring (5 daqiqa)

### 13. PM2 Monitoring
```bash
[ ] pm2 startup sozlandi
[ ] pm2 save bajarildi
[ ] Auto-restart ishlayapti
[ ] Logs yozilmoqda
```

### 14. Test Qilish
```bash
[ ] Login ishlayapti (barcha rollar)
[ ] Order yaratish ishlayapti
[ ] Real-time updates ishlayapti
[ ] Menu CRUD ishlayapti
[ ] Table management ishlayapti
[ ] Inventory ishlayapti
[ ] Analytics ishlayapti
```

## 🎉 Deploy Tugadi!

### 15. Yakuniy Tekshiruv
```bash
[ ] Production URL ochiladi
[ ] HTTPS ishlayapti
[ ] Login qilish mumkin
[ ] Barcha funksiyalar ishlayapti
[ ] Mobile responsive
[ ] Real-time updates ishlayapti
[ ] Loglar to'g'ri yozilmoqda
```

## 📝 Keyingi Qadamlar

### Darhol bajarish kerak:
1. [ ] Barcha default parollarni o'zgartirish
2. [ ] Database backup test qilish
3. [ ] Monitoring sozlash
4. [ ] Team ga login ma'lumotlarini berish

### 1 hafta ichida:
1. [ ] Performance monitoring (GTmetrix, Lighthouse)
2. [ ] Security scan (OWASP ZAP)
3. [ ] Load testing
4. [ ] Backup restore test

### Ixtiyoriy (yaxshilashlar):
1. [ ] Redis caching (4 soat)
2. [ ] Sentry.io error monitoring (1 soat)
3. [ ] API documentation Swagger (4 soat)
4. [ ] Testing Jest (8 soat)
5. [ ] CDN sozlash (2 soat)

## 🆘 Muammo Bo'lsa

### Backend ishlamayapti
```bash
pm2 logs basma-backend --lines 100
pm2 restart basma-backend
```

### Frontend ishlamayapti
```bash
pm2 logs basma-frontend --lines 100
npm run build
pm2 restart basma-frontend
```

### MongoDB connection error
```bash
# .env faylni tekshiring
cat backend/.env | grep MONGODB_URI

# MongoDB Atlas IP whitelist tekshiring
# https://cloud.mongodb.com/
```

### Nginx 502 error
```bash
# Backend ishlayotganini tekshiring
curl http://localhost:5000/api/health

# Nginx loglar
sudo tail -f /var/log/nginx/basma-error.log

# Nginx restart
sudo systemctl restart nginx
```

## 📞 Yordam

**Hujjatlar:**
- [PRODUCTION_DEPLOY_GUIDE.md](./PRODUCTION_DEPLOY_GUIDE.md) - To'liq qo'llanma
- [QUICK_START.md](./QUICK_START.md) - Tezkor boshlash
- [DEPLOY_WINDOWS.md](./DEPLOY_WINDOWS.md) - Windows uchun
- [README.md](./README.md) - Loyiha haqida

**Buyruqlar:**
```bash
pm2 status          # Status
pm2 logs            # Loglar
pm2 monit           # Real-time monitoring
pm2 restart all     # Restart
```

---

**Deploy vaqti:** 30-45 daqiqa  
**Minimal vaqt:** 15 daqiqa (avtomatik script)  
**Status:** ✅ Production Ready

**Muvaffaqiyatli deploy!** 🎉
