# 🚀 BASMA Restaurant - Tezkor Boshlash

## Development (5 daqiqa)

### 1. Environment sozlash

```bash
# Frontend
cp .env.local.example .env.local
# .env.local faylini ochib MongoDB URI ni kiriting

# Backend
cd backend
cp .env.example .env
# .env faylini ochib MongoDB URI ni kiriting
cd ..
```

### 2. Dependencies o'rnatish

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Database seed

```bash
cd backend
npm run seed:users
cd ..
```

### 4. Ishga tushirish

```bash
# Ikkala serverni birga ishga tushirish
npm run dev
```

Yoki alohida:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev:frontend
```

### 5. Kirish

- Frontend: http://localhost:3001
- Backend: http://localhost:5000/api

**Login:**
- Admin: 998901111111 / admin123
- Waiter: 998902222221 / waiter123

---

## Production Deploy (30 daqiqa)

### 1. Environment sozlash

```bash
# Frontend
cp .env.production .env.local

# Backend
cd backend
cp .env.production .env

# JWT_SECRET ni o'zgartiring!
# Windows PowerShell:
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# Linux/Mac:
openssl rand -base64 64
```

### 2. Build

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
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Nginx sozlash

```bash
sudo apt install nginx
sudo cp nginx-production.conf /etc/nginx/sites-available/basma
sudo ln -s /etc/nginx/sites-available/basma /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d basma-restaurant.uz
```

---

## Avtomatik Deploy

```bash
# Deploy script ni executable qilish
chmod +x deploy-production.sh

# Ishga tushirish
./deploy-production.sh
```

---

## Yordam

- Development: `npm run dev`
- Build: `npm run build`
- Production: `pm2 start ecosystem.config.js`
- Logs: `pm2 logs`
- Status: `pm2 status`

**To'liq qo'llanma:** [PRODUCTION_DEPLOY_GUIDE.md](./PRODUCTION_DEPLOY_GUIDE.md)
