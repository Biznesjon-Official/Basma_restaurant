# BASMA Restaurant - Production Deployment Script (Windows PowerShell)
# Bu script loyihani production serverga deploy qiladi

$ErrorActionPreference = "Stop"

Write-Host "🚀 BASMA Restaurant - Production Deployment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# 1. Environment tekshirish
Write-Host "`n1. Environment tekshirilmoqda..." -ForegroundColor Yellow

if (-not (Test-Path ".env.production")) {
    Write-Host "❌ .env.production fayli topilmadi!" -ForegroundColor Red
    Write-Host "Iltimos .env.production faylini yarating" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "backend\.env.production")) {
    Write-Host "❌ backend\.env.production fayli topilmadi!" -ForegroundColor Red
    Write-Host "Iltimos backend\.env.production faylini yarating" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment fayllar topildi" -ForegroundColor Green

# 2. Dependencies o'rnatish
Write-Host "`n2. Dependencies o'rnatilmoqda..." -ForegroundColor Yellow

Write-Host "Frontend dependencies..."
npm install --production

Write-Host "Backend dependencies..."
Set-Location backend
npm install --production
Set-Location ..

Write-Host "✅ Dependencies o'rnatildi" -ForegroundColor Green

# 3. TypeScript build
Write-Host "`n3. Backend build qilinmoqda..." -ForegroundColor Yellow
Set-Location backend
npm run build
Set-Location ..
Write-Host "✅ Backend build tayyor" -ForegroundColor Green

# 4. Frontend build
Write-Host "`n4. Frontend build qilinmoqda..." -ForegroundColor Yellow
Copy-Item .env.production .env.local -Force
npm run build
Write-Host "✅ Frontend build tayyor" -ForegroundColor Green

# 5. PM2 restart
Write-Host "`n5. PM2 bilan ishga tushirilmoqda..." -ForegroundColor Yellow

# PM2 o'rnatilganligini tekshirish
$pm2Installed = Get-Command pm2 -ErrorAction SilentlyContinue
if (-not $pm2Installed) {
    Write-Host "❌ PM2 o'rnatilmagan!" -ForegroundColor Red
    Write-Host "PM2 ni o'rnatish: npm install -g pm2" -ForegroundColor Yellow
    exit 1
}

# Eski jarayonlarni to'xtatish
pm2 delete basma-backend 2>$null
pm2 delete basma-frontend 2>$null

# Yangi jarayonlarni ishga tushirish
pm2 start ecosystem.config.js

# PM2 ni saqlash
pm2 save

Write-Host "✅ PM2 ishga tushdi" -ForegroundColor Green

# 6. Health check
Write-Host "`n6. Health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Backend health check
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend ishlayapti" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend ishlamayapti!" -ForegroundColor Red
    pm2 logs basma-backend --lines 50
    exit 1
}

# Frontend health check
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend ishlayapti" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend ishlamayapti!" -ForegroundColor Red
    pm2 logs basma-frontend --lines 50
    exit 1
}

# 7. Yakuniy ma'lumotlar
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "🎉 Deployment muvaffaqiyatli tugadi!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 PM2 Status:"
pm2 status

Write-Host ""
Write-Host "📝 Keyingi qadamlar:"
Write-Host "1. Nginx sozlang (agar sozlanmagan bo'lsa)"
Write-Host "2. SSL certificate o'rnating (Let's Encrypt)"
Write-Host "3. Domain DNS sozlamalarini tekshiring"
Write-Host "4. Firewall sozlamalarini tekshiring"
Write-Host ""
Write-Host "🔍 Monitoring:"
Write-Host "  pm2 logs              - Barcha loglar"
Write-Host "  pm2 logs basma-backend   - Backend loglar"
Write-Host "  pm2 logs basma-frontend  - Frontend loglar"
Write-Host "  pm2 monit             - Real-time monitoring"
Write-Host ""
Write-Host "🔄 Restart:"
Write-Host "  pm2 restart all       - Hammasini restart"
Write-Host "  pm2 restart basma-backend  - Faqat backend"
Write-Host ""
