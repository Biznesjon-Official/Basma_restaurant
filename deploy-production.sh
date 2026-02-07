#!/bin/bash

# BASMA Restaurant - Production Deployment Script
# Bu script loyihani production serverga deploy qiladi

set -e  # Xatolik bo'lsa to'xtatish

echo "🚀 BASMA Restaurant - Production Deployment"
echo "============================================"

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Environment tekshirish
echo -e "\n${YELLOW}1. Environment tekshirilmoqda...${NC}"

if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production fayli topilmadi!${NC}"
    echo "Iltimos .env.production faylini yarating"
    exit 1
fi

if [ ! -f "backend/.env.production" ]; then
    echo -e "${RED}❌ backend/.env.production fayli topilmadi!${NC}"
    echo "Iltimos backend/.env.production faylini yarating"
    exit 1
fi

echo -e "${GREEN}✅ Environment fayllar topildi${NC}"

# 2. Dependencies o'rnatish
echo -e "\n${YELLOW}2. Dependencies o'rnatilmoqda...${NC}"

echo "Frontend dependencies..."
npm install --production

echo "Backend dependencies..."
cd backend
npm install --production
cd ..

echo -e "${GREEN}✅ Dependencies o'rnatildi${NC}"

# 3. TypeScript build
echo -e "\n${YELLOW}3. Backend build qilinmoqda...${NC}"
cd backend
npm run build
cd ..
echo -e "${GREEN}✅ Backend build tayyor${NC}"

# 4. Frontend build
echo -e "\n${YELLOW}4. Frontend build qilinmoqda...${NC}"
cp .env.production .env.local
npm run build
echo -e "${GREEN}✅ Frontend build tayyor${NC}"

# 5. PM2 restart
echo -e "\n${YELLOW}5. PM2 bilan ishga tushirilmoqda...${NC}"

# PM2 o'rnatilganligini tekshirish
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 o'rnatilmagan!${NC}"
    echo "PM2 ni o'rnatish: npm install -g pm2"
    exit 1
fi

# Eski jarayonlarni to'xtatish
pm2 delete basma-backend basma-frontend 2>/dev/null || true

# Yangi jarayonlarni ishga tushirish
pm2 start ecosystem.config.js

# PM2 ni saqlash
pm2 save

echo -e "${GREEN}✅ PM2 ishga tushdi${NC}"

# 6. Health check
echo -e "\n${YELLOW}6. Health check...${NC}"
sleep 5

# Backend health check
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend ishlayapti${NC}"
else
    echo -e "${RED}❌ Backend ishlamayapti!${NC}"
    pm2 logs basma-backend --lines 50
    exit 1
fi

# Frontend health check
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend ishlayapti${NC}"
else
    echo -e "${RED}❌ Frontend ishlamayapti!${NC}"
    pm2 logs basma-frontend --lines 50
    exit 1
fi

# 7. Yakuniy ma'lumotlar
echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}🎉 Deployment muvaffaqiyatli tugadi!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📝 Keyingi qadamlar:"
echo "1. Nginx sozlang (agar sozlanmagan bo'lsa)"
echo "2. SSL certificate o'rnating (Let's Encrypt)"
echo "3. Domain DNS sozlamalarini tekshiring"
echo "4. Firewall sozlamalarini tekshiring"
echo ""
echo "🔍 Monitoring:"
echo "  pm2 logs              - Barcha loglar"
echo "  pm2 logs basma-backend   - Backend loglar"
echo "  pm2 logs basma-frontend  - Frontend loglar"
echo "  pm2 monit             - Real-time monitoring"
echo ""
echo "🔄 Restart:"
echo "  pm2 restart all       - Hammasini restart"
echo "  pm2 restart basma-backend  - Faqat backend"
echo ""
