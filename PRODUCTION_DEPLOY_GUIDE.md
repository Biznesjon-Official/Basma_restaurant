# 🚀 BASMA Restaurant - Production Deploy Guide

## Tezkor Deploy (5 daqiqa)

### 1. Environment fayllarni sozlash

```bash
# Frontend environment
cp .env.production .env.local

# Backend environment
cp backend/.env.production backend/.env

# MUHIM: JWT_SECRET ni o'zgartiring!
cd backend
# Linux/Mac:
openssl rand -base64 64

# Windows (PowerShell):
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

`.env` faylida `JWT_SECRET` ni yangi qiymat bilan almashtiring.

### 2. Dependencies va Build

```bash
# Frontend
npm install --production
npm run build

# Backend
cd backend
npm install --production
npm run build
cd ..
```

### 3. PM2 bilan ishga tushirish

```bash
# PM2 o'rnatish (agar o'rnatilmagan bo'lsa)
npm install -g pm2

# Ishga tushirish
pm2 start ecosystem.config.js

# Saqlash
pm2 save

# Auto-start sozlash
pm2 startup
# Ko'rsatilgan buyruqni ishga tushiring
```

### 4. Nginx sozlash

```bash
# Nginx o'rnatish
sudo apt update
sudo apt install nginx

# Config faylni ko'chirish
sudo cp nginx-production.conf /etc/nginx/sites-available/basma

# Symlink yaratish
sudo ln -s /etc/nginx/sites-available/basma /etc/nginx/sites-enabled/

# Test
sudo nginx -t

# Restart
sudo systemctl restart nginx
```

### 5. SSL Certificate (Let's Encrypt)

```bash
# Certbot o'rnatish
sudo apt install certbot python3-certbot-nginx

# SSL olish
sudo certbot --nginx -d basma-restaurant.uz -d www.basma-restaurant.uz

# Auto-renewal test
sudo certbot renew --dry-run
```

## ✅ Tekshirish

```bash
# PM2 status
pm2 status

# Loglarni ko'rish
pm2 logs

# Backend health
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:3001

# Production URL
curl https://basma-restaurant.uz
```

## 🔧 Muammolarni hal qilish

### Backend ishlamayapti

```bash
# Loglarni ko'rish
pm2 logs basma-backend --lines 100

# Restart
pm2 restart basma-backend

# Environment tekshirish
cd backend
cat .env
```

### Frontend ishlamayapti

```bash
# Loglarni ko'rish
pm2 logs basma-frontend --lines 100

# Restart
pm2 restart basma-frontend

# Build qayta qilish
npm run build
pm2 restart basma-frontend
```

### MongoDB connection error

```bash
# MongoDB URI tekshirish
cd backend
grep MONGODB_URI .env

# MongoDB Atlas IP whitelist tekshirish
# https://cloud.mongodb.com/ ga kiring
# Network Access -> Add IP Address -> Allow Access from Anywhere (0.0.0.0/0)
```

### Nginx 502 Bad Gateway

```bash
# Backend ishlayotganini tekshirish
curl http://localhost:5000/api/health

# Nginx loglarni ko'rish
sudo tail -f /var/log/nginx/basma-error.log

# Nginx restart
sudo systemctl restart nginx
```

## 📊 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Status
pm2 status

# Logs
pm2 logs

# Restart all
pm2 restart all

# Stop all
pm2 stop all

# Delete all
pm2 delete all
```

## 🔄 Yangilanishlar

```bash
# Git pull
git pull origin main

# Dependencies yangilash
npm install --production
cd backend && npm install --production && cd ..

# Build
npm run build
cd backend && npm run build && cd ..

# Restart
pm2 restart all
```

## 🔐 Xavfsizlik

### 1. Firewall sozlash

```bash
# UFW yoqish
sudo ufw enable

# SSH ruxsat berish
sudo ufw allow 22/tcp

# HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Status
sudo ufw status
```

### 2. Parollarni o'zgartirish

```bash
cd backend
npm run seed:users
# Yoki manual ravishda database da o'zgartiring
```

### 3. MongoDB IP Whitelist

MongoDB Atlas da:
1. Network Access
2. Add IP Address
3. Server IP ni qo'shing

## 📈 Performance

### PM2 Cluster Mode

`ecosystem.config.js` da:
```javascript
instances: 2,  // CPU core soniga qarab
exec_mode: 'cluster'
```

### Nginx Caching

```nginx
# Static files caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🎯 Production Checklist

- [ ] Environment variables sozlandi
- [ ] JWT_SECRET o'zgartirildi
- [ ] MongoDB production database yaratildi
- [ ] Admin parollari o'zgartirildi
- [ ] PM2 ishga tushirildi
- [ ] Nginx sozlandi
- [ ] SSL certificate o'rnatildi
- [ ] Firewall sozlandi
- [ ] Health check ishlayapti
- [ ] Monitoring sozlandi
- [ ] Backup strategiyasi
- [ ] Domain DNS sozlandi

## 📞 Yordam

Muammo bo'lsa:
1. PM2 loglarni tekshiring: `pm2 logs`
2. Nginx loglarni tekshiring: `sudo tail -f /var/log/nginx/basma-error.log`
3. Backend health check: `curl http://localhost:5000/api/health`

---

**Muvaffaqiyatli deploy!** 🎉
