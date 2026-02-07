# 🚀 BASMA RESTAURANT - PRODUCTION CHECKLIST

## 📋 Loyiha Holati

**Hozirgi holat:** Development-ready ✅  
**Production holati:** Qisman tayyor ⚠️  
**Zarur ishlar:** 15+ muhim vazifa

---

## 🔴 KRITIK - Albatta bajarilishi kerak

### 1. Environment Variables & Security

#### Backend (.env)
```env
# ❌ XAVFLI - O'zgartirish SHART!
JWT_SECRET=basma_super_secret_key_2026_change_in_production
# ✅ Yangi qiymat: 64+ belgili random string
JWT_SECRET=<openssl rand -base64 64 bilan yarating>

# ❌ Production uchun o'zgartirish kerak
NODE_ENV=production
PORT=5000

# ✅ MongoDB - IP whitelist tekshiring
MONGODB_URI=mongodb+srv://basmaprox:basmaprox2026@cluster0...
# Tavsiya: Yangi production database yarating

# ✅ CORS - production domain
FRONTEND_URL=https://basma-restaurant.uz

# ✅ Rate limiting - qattiqroq qiling
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50  # 100 dan 50 ga tushiring
```

#### Frontend (.env.local)
```env
# ❌ Hardcoded localhost - o'zgartirish kerak
NEXT_PUBLIC_API_URL=https://api.basma-restaurant.uz
NEXT_PUBLIC_APP_URL=https://basma-restaurant.uz
```

**Xavf darajasi:** 🔴 KRITIK  
**Vaqt:** 30 daqiqa

---

### 2. Database Security

#### MongoDB Atlas sozlamalari:
- ✅ IP Whitelist: Faqat server IP ruxsat bering
- ❌ Database parol: `basmaprox2026` - juda oddiy!
- ✅ Yangi murakkab parol yarating
- ✅ Database Backup: Avtomatik kunlik backup yoqing
- ✅ Monitoring: Atlas monitoring yoqing

#### Tavsiyalar:
```bash
# Yangi production database yarating
Database: basma_production
User: basma_prod_user
Password: <32+ belgili murakkab parol>
```

**Xavf darajasi:** 🔴 KRITIK  
**Vaqt:** 1 soat

---

### 3. Admin Parollarini O'zgartirish

```typescript
// Hozirgi parollar - HAMMASI ODDIY!
Admin: admin123
Waiter: waiter123
Chef: chef123
Storekeeper: store123
Cashier: cashier123
```

**Hal qilish:**
```bash
cd "Basma restarant/backend"
npm run seed:users  # Yangi murakkab parollar bilan
```

Yoki manual:
```typescript
// backend/src/scripts/updatePasswords.ts yarating
import bcrypt from 'bcryptjs'
import User from '../models/User'

const newPasswords = {
  admin: 'Basma@Admin2026!Secure',
  waiter: 'Waiter@Secure2026!',
  chef: 'Chef@Secure2026!',
  // ...
}
```

**Xavf darajasi:** 🔴 KRITIK  
**Vaqt:** 30 daqiqa

---

### 4. HTTPS & SSL Certificate

```bash
# Production serverda HTTPS majburiy
# Nginx yoki Caddy ishlatish tavsiya etiladi

# Nginx misol:
server {
    listen 443 ssl http2;
    server_name basma-restaurant.uz;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3001;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

**Xavf darajasi:** 🔴 KRITIK  
**Vaqt:** 2 soat

---

## 🟡 MUHIM - Production uchun zarur

### 5. Logging System

**Hozirgi holat:** Faqat console.log ❌

**Kerak:**
```bash
npm install winston winston-daily-rotate-file
```

```typescript
// backend/src/utils/logger.ts
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d'
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d'
    })
  ]
})

export default logger
```

**Vaqt:** 2 soat

---

### 6. Error Monitoring

**Tavsiya:** Sentry.io yoki Rollbar

```bash
npm install @sentry/node @sentry/tracing
```

```typescript
// backend/src/app.ts
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})

app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.errorHandler())
```

**Vaqt:** 1 soat

---

### 7. Process Manager (PM2)

```bash
npm install -g pm2

# ecosystem.config.js yarating
module.exports = {
  apps: [
    {
      name: 'basma-backend',
      script: 'dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'basma-frontend',
      script: 'npm',
      args: 'start',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
}

# Ishga tushirish
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Vaqt:** 1 soat

---

### 8. Database Indexlar

**Tekshirish kerak:**
```typescript
// backend/src/models/Order.ts
orderSchema.index({ tableNumber: 1, status: 1 })
orderSchema.index({ createdAt: -1 })
orderSchema.index({ 'waiter': 1 })

// backend/src/models/MenuItem.ts
menuItemSchema.index({ category: 1, available: 1 })
menuItemSchema.index({ name: 'text' })

// backend/src/models/User.ts
userSchema.index({ phone: 1 }, { unique: true })
userSchema.index({ role: 1, isActive: 1 })
```

**Vaqt:** 30 daqiqa

---

### 9. API Rate Limiting

**Hozirgi:** 100 req/15min - juda yumshoq

```typescript
// backend/src/middlewares/rateLimiter.ts
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 50, // 50 ta request
  message: 'Juda ko\'p so\'rov yuborildi',
  standardHeaders: true,
  legacyHeaders: false,
})

// Login uchun qattiqroq
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 ta urinish
  skipSuccessfulRequests: true,
})
```

**Vaqt:** 30 daqiqa

---

### 10. Input Validation

**Hozirgi holat:** Minimal validation ⚠️

```bash
npm install joi
```

```typescript
// backend/src/validators/orderValidator.ts
import Joi from 'joi'

export const createOrderSchema = Joi.object({
  tableNumber: Joi.number().required().min(1).max(100),
  items: Joi.array().items(
    Joi.object({
      menuItem: Joi.string().required(),
      quantity: Joi.number().required().min(1).max(50),
      notes: Joi.string().max(200)
    })
  ).min(1).required(),
  customerName: Joi.string().max(100),
  customerPhone: Joi.string().pattern(/^998\d{9}$/)
})
```

**Vaqt:** 3 soat

---

## 🟢 TAVSIYA ETILADI - Yaxshilashlar

### 11. Caching (Redis)

```bash
npm install redis ioredis
```

```typescript
// backend/src/config/redis.ts
import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000)
})

// Menu cache
export async function getCachedMenu() {
  const cached = await redis.get('menu:all')
  if (cached) return JSON.parse(cached)
  
  const menu = await MenuItem.find({ available: true })
  await redis.setex('menu:all', 300, JSON.stringify(menu)) // 5 min
  return menu
}
```

**Foyda:** 10x tezroq API response  
**Vaqt:** 4 soat

---

### 12. Database Backup Strategy

```bash
# Kunlik backup script
#!/bin/bash
# backup.sh

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/backups/mongodb"

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$DATE"

# 30 kundan eski backuplarni o'chirish
find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} \;

# Cron job
# 0 2 * * * /path/to/backup.sh
```

**Vaqt:** 1 soat

---

### 13. Health Checks & Monitoring

```typescript
// backend/src/routes/healthRoutes.ts
import express from 'express'
import mongoose from 'mongoose'
import { getSocketIO } from '../config/socket'

const router = express.Router()

router.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    checks: {
      database: mongoose.connection.readyState === 1 ? 'OK' : 'ERROR',
      memory: process.memoryUsage(),
      socket: getSocketIO() ? 'OK' : 'ERROR'
    }
  }
  
  const status = health.checks.database === 'OK' ? 200 : 503
  res.status(status).json(health)
})

export default router
```

**Vaqt:** 1 soat

---

### 14. API Documentation

```bash
npm install swagger-jsdoc swagger-ui-express
```

```typescript
// backend/src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BASMA Restaurant API',
      version: '1.0.0',
      description: 'Restaurant Management System API'
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Development' },
      { url: 'https://api.basma-restaurant.uz', description: 'Production' }
    ]
  },
  apis: ['./src/routes/*.ts']
}

const specs = swaggerJsdoc(options)

export { specs, swaggerUi }

// app.ts da
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
```

**Vaqt:** 4 soat

---

### 15. Testing

```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

```typescript
// backend/src/__tests__/auth.test.ts
import request from 'supertest'
import app from '../app'

describe('Auth API', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        phone: '998901111111',
        password: 'admin123'
      })
    
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })
})
```

**Vaqt:** 8 soat (minimal testlar)

---

### 16. Frontend Optimizatsiya

```typescript
// next.config.mjs
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // ❌ Production da false bo'lishi kerak
  },
  images: {
    unoptimized: false, // ❌ Production da false
    domains: ['basma-restaurant.uz'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Production optimizatsiya
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

**Vaqt:** 1 soat

---

### 17. Keraksiz Fayllarni O'chirish

```bash
# Backend test fayllar - production da kerak emas
Basma restarant/backend/check-*.js
Basma restarant/backend/test-*.js
Basma restarant/backend/quick-test-*.js

# Markdown dokumentlar - .gitignore ga qo'shing
*.md (faqat README.md qoldiring)
```

**Vaqt:** 30 daqiqa

---

## 📊 DEPLOYMENT CHECKLIST

### Server Requirements

```yaml
Minimum:
  CPU: 2 cores
  RAM: 4GB
  Storage: 50GB SSD
  OS: Ubuntu 20.04+ / CentOS 8+

Recommended:
  CPU: 4 cores
  RAM: 8GB
  Storage: 100GB SSD
  Bandwidth: 100Mbps
```

### Software Stack

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2
npm install -g pm2

# Nginx
sudo apt install nginx

# MongoDB (agar local kerak bo'lsa)
# Yoki MongoDB Atlas ishlatish tavsiya etiladi

# Redis (optional)
sudo apt install redis-server

# SSL Certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d basma-restaurant.uz
```

---

## 🎯 DEPLOYMENT STEPS

### 1. Server Tayyorlash
```bash
# Server ga kirish
ssh user@your-server-ip

# Loyihani clone qilish
git clone <repository-url>
cd basma-restaurant
```

### 2. Backend Deploy
```bash
cd "Basma restarant/backend"

# Dependencies
npm install --production

# Build
npm run build

# Environment
cp .env.example .env
nano .env  # Production qiymatlarni kiriting

# PM2 bilan ishga tushirish
pm2 start dist/server.js --name basma-backend
pm2 save
```

### 3. Frontend Deploy
```bash
cd "Basma restarant"

# Dependencies
npm install --production

# Build
npm run build

# PM2 bilan ishga tushirish
pm2 start npm --name basma-frontend -- start
pm2 save
```

### 4. Nginx Sozlash
```nginx
# /etc/nginx/sites-available/basma
server {
    listen 80;
    server_name basma-restaurant.uz www.basma-restaurant.uz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name basma-restaurant.uz www.basma-restaurant.uz;
    
    ssl_certificate /etc/letsencrypt/live/basma-restaurant.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/basma-restaurant.uz/privkey.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/basma /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ✅ FINAL CHECKLIST

### Pre-deployment
- [ ] Barcha environment variables to'g'ri
- [ ] JWT_SECRET o'zgartirildi
- [ ] Database parollari murakkab
- [ ] Admin parollari o'zgartirildi
- [ ] HTTPS sozlandi
- [ ] Logging tizimi qo'shildi
- [ ] Error monitoring (Sentry) sozlandi
- [ ] PM2 sozlandi
- [ ] Database backup strategiyasi
- [ ] Rate limiting qattiqroq qilindi

### Post-deployment
- [ ] Health check ishlayapti
- [ ] SSL certificate valid
- [ ] Database connection ishlayapti
- [ ] Socket.io ishlayapti
- [ ] Real-time updates ishlayapti
- [ ] Login/Logout ishlayapti
- [ ] Barcha API endpoints test qilindi
- [ ] Mobile responsive
- [ ] Performance test (GTmetrix, Lighthouse)
- [ ] Security scan (OWASP ZAP)

### Monitoring
- [ ] PM2 monitoring
- [ ] Nginx access/error logs
- [ ] Application logs
- [ ] Database monitoring
- [ ] Disk space monitoring
- [ ] Memory usage monitoring
- [ ] CPU usage monitoring

---

## 📈 PERFORMANCE TARGETS

```yaml
API Response Time:
  Average: < 200ms
  95th percentile: < 500ms
  99th percentile: < 1000ms

Frontend Load Time:
  First Contentful Paint: < 1.5s
  Time to Interactive: < 3.5s
  Lighthouse Score: > 90

Database:
  Query time: < 100ms
  Connection pool: 10-50
  
Uptime:
  Target: 99.9% (8.76 hours downtime/year)
```

---

## 🚨 XAVFSIZLIK ESLATMALAR

### ❌ QILMANG:
1. Parollarni kodda hardcode qilmang
2. Sensitive ma'lumotlarni logga yozmang
3. Error messagelarda database strukturasini ko'rsatmang
4. Admin panelni public qilmang
5. CORS ni `*` ga qo'ymang
6. Rate limiting ni o'chirmang
7. HTTPS siz production ga chiqmang

### ✅ QILING:
1. Barcha inputlarni validate qiling
2. SQL/NoSQL injection dan himoyalaning
3. XSS dan himoyalaning
4. CSRF token ishlatish (agar kerak bo'lsa)
5. Helmet.js ishlatish
6. Regular security audit
7. Dependencies ni yangilab turing

---

## 📞 SUPPORT & MAINTENANCE

### Kunlik:
- Loglarni tekshirish
- Error monitoring
- Performance monitoring

### Haftalik:
- Database backup tekshirish
- Security updates
- Dependencies update

### Oylik:
- Full security audit
- Performance optimization
- Database cleanup

---

## 💰 TAXMINIY XARAJATLAR

```yaml
Server (VPS):
  DigitalOcean/Linode: $20-40/month
  AWS EC2: $30-60/month
  Hetzner: $10-20/month (Evropa)

Database:
  MongoDB Atlas: $0-57/month (M0-M10)
  
SSL Certificate:
  Let's Encrypt: FREE
  
Monitoring:
  Sentry: $0-26/month
  
Domain:
  .uz domain: ~$10/year
  
Total: $30-150/month
```

---

## 🎉 XULOSA

**Loyiha holati:** 70% Production Ready

**Kritik ishlar (1-4):** 4 soat  
**Muhim ishlar (5-10):** 12 soat  
**Tavsiya etiladigan (11-17):** 20 soat  

**JAMI:** ~36 soat (4-5 kun)

**Eng muhim 3 ta ish:**
1. Environment variables & JWT_SECRET o'zgartirish (30 min)
2. HTTPS sozlash (2 soat)
3. PM2 va deployment (2 soat)

**Minimal production:** 4-5 soat  
**To'liq professional:** 36 soat

---

**Oxirgi yangilanish:** 2026-02-06  
**Versiya:** 1.0  
**Muallif:** BASMA Development Team
