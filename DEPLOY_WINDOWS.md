# 🚀 Windows uchun Deploy Qo'llanma

## Development (Windows)

### 1. Environment sozlash

```powershell
# Frontend
Copy-Item .env.local.example .env.local
# .env.local faylini ochib MongoDB URI ni kiriting

# Backend
cd backend
Copy-Item .env.example .env
# .env faylini ochib MongoDB URI ni kiriting
cd ..
```

### 2. Dependencies

```powershell
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Database seed

```powershell
cd backend
npm run seed:users
cd ..
```

### 4. Ishga tushirish

```powershell
# Ikkala serverni birga
npm run dev
```

## Production Deploy (Windows)

### 1. Environment sozlash

```powershell
# Frontend
Copy-Item .env.production .env.local

# Backend
cd backend
Copy-Item .env.production .env
cd ..

# JWT_SECRET yaratish (PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# Natijani backend\.env fayliga JWT_SECRET ga qo'ying
```

### 2. Build

```powershell
# Frontend
npm install --production
npm run build

# Backend
cd backend
npm install --production
npm run build
cd ..
```

### 3. PM2 o'rnatish

```powershell
# PM2 global o'rnatish
npm install -g pm2
npm install -g pm2-windows-startup

# Windows service sifatida sozlash
pm2-startup install
```

### 4. Ishga tushirish

```powershell
# Avtomatik script
.\deploy-production.ps1

# Yoki manual
pm2 start ecosystem.config.js
pm2 save
```

### 5. Windows Service

```powershell
# PM2 ni Windows service qilish
pm2 save
pm2-startup install

# Service status
Get-Service PM2*
```

## Nginx (Windows)

### O'rnatish

1. Nginx for Windows yuklab oling: http://nginx.org/en/download.html
2. Zip faylni ochib `C:\nginx` ga ko'chiring

### Sozlash

```powershell
# Config faylni ko'chirish
Copy-Item nginx-production.conf C:\nginx\conf\basma.conf

# nginx.conf ni tahrirlash
# C:\nginx\conf\nginx.conf faylini ochib quyidagini qo'shing:
# include basma.conf;
```

### Ishga tushirish

```powershell
# Nginx ishga tushirish
cd C:\nginx
start nginx

# Restart
nginx -s reload

# To'xtatish
nginx -s stop
```

## SSL Certificate (Windows)

Windows da SSL uchun:

1. **Cloudflare** ishlatish (eng oson)
   - Domain ni Cloudflare ga qo'shing
   - SSL/TLS -> Full yoqing
   - Automatic HTTPS Rewrites yoqing

2. **Win-ACME** (Let's Encrypt for Windows)
   ```powershell
   # Win-ACME yuklab oling
   # https://www.win-acme.com/
   
   # Ishga tushiring va ko'rsatmalarga amal qiling
   wacs.exe
   ```

## Firewall

```powershell
# Windows Firewall qoidalari
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Node Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Next Frontend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

## Monitoring

```powershell
# PM2 status
pm2 status

# Logs
pm2 logs

# Real-time monitoring
pm2 monit

# Restart
pm2 restart all
```

## Muammolarni Hal Qilish

### PM2 ishlamayapti

```powershell
# PM2 ni qayta o'rnatish
npm uninstall -g pm2
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
```

### Port band

```powershell
# Port ishlatayotgan jarayonni topish
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Jarayonni to'xtatish
taskkill /PID <PID> /F
```

### Node.js versiyasi

```powershell
# Node.js versiyasini tekshirish
node --version

# 18+ versiya kerak
# Yangilash: https://nodejs.org/
```

## Production Checklist

- [ ] Node.js 18+ o'rnatildi
- [ ] PM2 o'rnatildi va sozlandi
- [ ] Environment fayllar sozlandi
- [ ] JWT_SECRET o'zgartirildi
- [ ] Build muvaffaqiyatli
- [ ] PM2 ishga tushdi
- [ ] Health check ishlayapti
- [ ] Nginx sozlandi (ixtiyoriy)
- [ ] SSL sozlandi (ixtiyoriy)
- [ ] Firewall sozlandi
- [ ] Windows Service sozlandi

## Yordam

Muammo bo'lsa:

```powershell
# Loglarni ko'rish
pm2 logs --lines 100

# Backend health
Invoke-WebRequest http://localhost:5000/api/health

# Frontend
Invoke-WebRequest http://localhost:3001

# PM2 restart
pm2 restart all
```

---

**Windows uchun maxsus qo'llanma**  
**Versiya:** 1.0.0
