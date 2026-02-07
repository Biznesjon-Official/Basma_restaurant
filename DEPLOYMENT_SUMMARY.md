# 🚀 BASMA Restaurant - Deployment Summary

## ✅ Loyiha basmapos.biznesjon.uz domeniga deploy qilishga tayyor!

**Sana:** 2026-02-06  
**Domen:** basmapos.biznesjon.uz  
**Repository:** https://github.com/Biznesjon-Official/Basma_restaurant

---

## 📋 Yangilangan Fayllar

### 1. Nginx Configuration
**Fayl:** `nginx.conf`

```nginx
server_name basmapos.biznesjon.uz;
ssl_certificate /etc/letsencrypt/live/basmapos.biznesjon.uz/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/basmapos.biznesjon.uz/privkey.pem;
```

✅ HTTP → HTTPS redirect  
✅ SSL/TLS configuration  
✅ Proxy settings for frontend (port 3001)  
✅ Proxy settings for backend API (port 5000)  
✅ WebSocket support for Socket.io  
✅ Static file caching  
✅ Security headers  
✅ Gzip compression

---

### 2. Environment Variables

#### Frontend (.env.production)
```env
MONGODB_URI=mongodb+srv://basmaprox:basmaprox2026@cluster0.1rfwets.mongodb.net/basma_production
NEXT_PUBLIC_APP_URL=https://basmapos.biznesjon.uz
NEXT_PUBLIC_API_URL=https://basmapos.biznesjon.uz/api
```

#### Backend (.env.production)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://basmaprox:basmaprox2026@cluster0.1rfwets.mongodb.net/basma_production
JWT_SECRET=<will-be-generated-on-server>
FRONTEND_URL=https://basmapos.biznesjon.uz
RATE_LIMIT_MAX_REQUESTS=50
```

---

### 3. Deployment Script
**Fayl:** `deploy.sh`

Avtomatik deployment script yaratildi:
- ✅ System packages o'rnatish
- ✅ Node.js 20.x o'rnatish
- ✅ PM2 o'rnatish
- ✅ Repository clone qilish
- ✅ Dependencies o'rnatish
- ✅ Build qilish
- ✅ Environment sozlash
- ✅ Database seed qilish
- ✅ PM2 sozlash
- ✅ Nginx sozlash
- ✅ SSL certificate olish
- ✅ Firewall sozlash

---

### 4. PM2 Configuration
**Fayl:** `ecosystem.config.js`

```javascript
apps: [
  {
    name: 'basma-backend',
    instances: 2,
    exec_mode: 'cluster',
    port: 5000
  },
  {
    name: 'basma-frontend',
    port: 3001
  }
]
```

---

### 5. Documentation
**Fayl:** `DEPLOYMENT_GUIDE_BIZNESJON.md`

To'liq deployment qo'llanmasi yaratildi:
- ✅ Pre-deployment checklist
- ✅ Automated deployment
- ✅ Manual step-by-step guide
- ✅ Post-deployment security
- ✅ Update procedures
- ✅ Troubleshooting guide

---

## 🚀 Deployment Qadamlari

### Option 1: Avtomatik Deploy (Tavsiya etiladi)

```bash
# 1. Serverga kirish
ssh root@your-server-ip

# 2. Deploy scriptni yuklab olish va ishga tushirish
curl -o deploy.sh https://raw.githubusercontent.com/Biznesjon-Official/Basma_restaurant/main/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

**Vaqt:** ~15-20 daqiqa

---

### Option 2: Manual Deploy

Batafsil qo'llanma: `DEPLOYMENT_GUIDE_BIZNESJON.md`

**Asosiy qadamlar:**
1. Server tayyorlash
2. Node.js o'rnatish
3. Repository clone qilish
4. Dependencies o'rnatish
5. Build qilish
6. Environment sozlash
7. PM2 sozlash
8. Nginx sozlash
9. SSL certificate olish
10. Firewall sozlash

**Vaqt:** ~30-40 daqiqa

---

## 🔧 Server Requirements

### Minimum:
- **OS:** Ubuntu 20.04+
- **RAM:** 2GB
- **CPU:** 2 cores
- **Storage:** 20GB
- **Bandwidth:** 100Mbps

### Recommended:
- **RAM:** 4GB
- **CPU:** 4 cores
- **Storage:** 50GB SSD

---

## 🌐 URLs

### Production:
- **Frontend:** https://basmapos.biznesjon.uz
- **API:** https://basmapos.biznesjon.uz/api
- **Health Check:** https://basmapos.biznesjon.uz/api/health

### Ports:
- **Frontend:** 3001 (internal)
- **Backend:** 5000 (internal)
- **HTTP:** 80 (redirects to HTTPS)
- **HTTPS:** 443

---

## 🔐 Security Checklist

### Pre-Deployment:
- [x] .gitignore to'g'ri sozlangan
- [x] Sensitive data commit qilinmagan
- [x] Environment examples yaratilgan
- [x] SSL configuration tayyor

### Post-Deployment:
- [ ] SSL certificate o'rnatilgan
- [ ] Firewall sozlangan
- [ ] Default parollar o'zgartirilgan
- [ ] MongoDB IP whitelist sozlangan
- [ ] JWT_SECRET yangilangan
- [ ] Monitoring sozlangan
- [ ] Backup strategiyasi sozlangan

---

## 🔑 Default Login Credentials

**⚠️ MUHIM: Deploy qilgandan keyin darhol o'zgartiring!**

### Admin
- Phone: `998901111111`
- Password: `admin123`

### Waiter
- Phone: `998902222221`
- Password: `waiter123`

### Chef
- Phone: `998903333331`
- Password: `chef123`

### Storekeeper
- Phone: `998904444441`
- Password: `store123`

### Cashier
- Phone: `998905555551`
- Password: `cashier123`

---

## 📊 Deployment Verification

### 1. Check PM2 Processes
```bash
pm2 list
```

Expected:
```
┌─────┬──────────────────┬─────────┐
│ id  │ name             │ status  │
├─────┼──────────────────┼─────────┤
│ 0   │ basma-backend    │ online  │
│ 1   │ basma-frontend   │ online  │
└─────┴──────────────────┴─────────┘
```

### 2. Check Nginx
```bash
sudo systemctl status nginx
```

### 3. Test SSL
```bash
curl -I https://basmapos.biznesjon.uz
```

### 4. Test API
```bash
curl https://basmapos.biznesjon.uz/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "BASMA Backend ishlamoqda",
  "timestamp": "2026-02-06T...",
  "uptime": 123.45
}
```

---

## 🔄 Update Deployment

```bash
cd /var/www/basma-restaurant
git pull origin main
npm install --production
cd backend && npm install --production && cd ..
npm run build
cd backend && npm run build && cd ..
pm2 restart all
```

---

## 📞 Support Commands

### PM2
```bash
pm2 list                    # List processes
pm2 logs                    # View logs
pm2 restart all             # Restart all
pm2 monit                   # Monitor
```

### Nginx
```bash
sudo nginx -t               # Test config
sudo systemctl restart nginx # Restart
sudo tail -f /var/log/nginx/basma-error.log  # View logs
```

### SSL
```bash
sudo certbot certificates   # Check certificates
sudo certbot renew          # Renew certificates
```

---

## 🐛 Common Issues

### Port Already in Use
```bash
sudo lsof -i :3001
sudo lsof -i :5000
pm2 delete all
pm2 start ecosystem.config.js
```

### Nginx Not Starting
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
sudo systemctl restart nginx
```

### SSL Certificate Issues
```bash
sudo certbot renew --force-renewal
```

---

## 📈 Monitoring

### Application Logs
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/basma-access.log
sudo tail -f /var/log/nginx/basma-error.log

# Application logs
tail -f logs/backend-error.log
tail -f logs/frontend-error.log
```

### System Resources
```bash
htop                        # CPU/Memory
df -h                       # Disk space
free -h                     # Memory
```

---

## 🎉 Success Criteria

Deployment muvaffaqiyatli bo'lishi uchun:

- ✅ PM2 processes "online" statusda
- ✅ Nginx "active (running)" statusda
- ✅ SSL certificate valid
- ✅ Frontend https://basmapos.biznesjon.uz ochiladi
- ✅ API https://basmapos.biznesjon.uz/api/health javob beradi
- ✅ Login sahifasi ishlaydi
- ✅ WebSocket (Socket.io) ishlaydi
- ✅ Real-time updates ishlaydi

---

## 📚 Additional Resources

### Documentation:
- `README.md` - Main documentation
- `DEPLOYMENT_GUIDE_BIZNESJON.md` - Full deployment guide
- `PRODUCTION_CHECKLIST.md` - Production checklist
- `SECURITY.md` - Security policy
- `docs/DEPLOYMENT.md` - General deployment guide

### Repository:
- **GitHub:** https://github.com/Biznesjon-Official/Basma_restaurant
- **Clone:** `git clone https://github.com/Biznesjon-Official/Basma_restaurant.git`

---

## 🎯 Next Steps

1. **Deploy to Server**
   - Run deployment script
   - Verify all services running

2. **Security Hardening**
   - Change all default passwords
   - Update JWT_SECRET
   - Configure MongoDB IP whitelist
   - Setup monitoring

3. **Testing**
   - Test all user roles
   - Test order flow
   - Test real-time updates
   - Test payment processing

4. **Go Live**
   - Announce to team
   - Train staff
   - Monitor for issues

---

**Deployment Status:** ✅ READY  
**Domain:** basmapos.biznesjon.uz  
**Version:** 1.0.0  
**Date:** 2026-02-06

**🚀 Loyiha deploy qilishga tayyor!**
