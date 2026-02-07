# 🚀 GitHub Setup Guide

Loyihani GitHub ga yuklash uchun qadamma-qadam qo'llanma.

## 📋 Tayyorgarlik

### 1. Git O'rnatish (agar o'rnatilmagan bo'lsa)

**Windows:**
```bash
# Git Bash yuklab oling: https://git-scm.com/download/win
```

**Tekshirish:**
```bash
git --version
```

### 2. Git Konfiguratsiya

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🔧 Loyihani Tayyorlash

### 1. Keraksiz Fayllarni Tekshirish

Quyidagi fayllar `.gitignore` da va commit qilinmaydi:
- ✅ `.env` va `.env.local` (sensitive data)
- ✅ `node_modules/` (dependencies)
- ✅ `.next/` va `dist/` (build files)
- ✅ `logs/` (log files)
- ✅ Test fayllar (`test-*.js`, `check-*.js`)

### 2. Environment Fayllarni Tekshirish

**MUHIM:** `.env` fayllarida sensitive ma'lumotlar bor!

```bash
# .env.example fayllar mavjudligini tekshiring
ls -la .env.example
ls -la backend/.env.example
```

Agar `.env` fayllaringizda haqiqiy parollar bo'lsa, ularni commit qilmang!

## 📦 GitHub Repository Yaratish

### 1. GitHub ga Kiring
- https://github.com ga kiring
- "New repository" tugmasini bosing

### 2. Repository Ma'lumotlari
```
Repository name: basma-restaurant
Description: Professional Restaurant Management System with Real-time Order Tracking
Visibility: Public yoki Private (tanlab oling)
```

**DIQQAT:** 
- ❌ "Initialize with README" ni belgilamang (bizda bor)
- ❌ ".gitignore" ni qo'shmang (bizda bor)
- ❌ "License" ni qo'shmang (bizda bor)

### 3. Repository Yarating
"Create repository" tugmasini bosing.

## 🚀 Loyihani GitHub ga Yuklash

### Variant 1: Yangi Repository (Tavsiya etiladi)

```bash
# 1. Loyiha papkasiga o'ting
cd "Basma restarant"

# 2. Git repository yarating
git init

# 3. Barcha fayllarni staging ga qo'shing
git add .

# 4. Birinchi commit
git commit -m "Initial commit: BASMA Restaurant Management System v1.0.0"

# 5. Main branch yarating
git branch -M main

# 6. Remote repository qo'shing (GitHub URL ni o'zgartiring!)
git remote add origin https://github.com/YOUR_USERNAME/basma-restaurant.git

# 7. GitHub ga push qiling
git push -u origin main
```

### Variant 2: Mavjud Git Repository

Agar loyihada allaqachon `.git` papka bo'lsa:

```bash
cd "Basma restarant"

# 1. Hozirgi remote ni tekshiring
git remote -v

# 2. Agar kerak bo'lsa, remote ni o'zgartiring
git remote set-url origin https://github.com/YOUR_USERNAME/basma-restaurant.git

# 3. Barcha o'zgarishlarni commit qiling
git add .
git commit -m "Prepare for GitHub: Add documentation and configuration"

# 4. Push qiling
git push -u origin main
```

## 🔐 Sensitive Ma'lumotlarni Tekshirish

### Push qilishdan OLDIN tekshiring:

```bash
# .env fayllar commit qilinmaganligini tekshiring
git status

# Agar .env ko'rinsa, uni o'chiring:
git rm --cached .env
git rm --cached backend/.env
git rm --cached .env.local

# .gitignore ga qo'shing (allaqachon qo'shilgan bo'lishi kerak)
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "backend/.env" >> .gitignore

# Commit qiling
git add .gitignore
git commit -m "Update .gitignore to exclude sensitive files"
```

### Agar xato qilib sensitive data commit qilgan bo'lsangiz:

```bash
# DIQQAT: Bu history ni o'zgartiradi!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env backend/.env .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (faqat private repo uchun!)
git push origin --force --all
```

## 📝 Keyingi Qadamlar

### 1. README ni Yangilang

```bash
# README.md da GitHub URL ni o'zgartiring
nano README.md

# Quyidagi qatorlarni toping va o'zgartiring:
# https://github.com/yourusername/basma-restaurant.git
# -> https://github.com/YOUR_ACTUAL_USERNAME/basma-restaurant.git
```

### 2. Repository Settings

GitHub da repository settings ga o'ting:

**About (Description):**
```
Professional Restaurant Management System with Real-time Order Tracking, Kitchen Display, Inventory Management, and Multi-role Access Control
```

**Topics (Tags):**
```
restaurant-management
pos-system
kitchen-display
inventory-management
nextjs
typescript
mongodb
socketio
express
nodejs
```

**Website:**
```
https://basma-restaurant.uz (agar bor bo'lsa)
```

### 3. Branch Protection (Optional)

Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging

### 4. GitHub Actions

CI/CD pipeline avtomatik ishga tushadi (`.github/workflows/ci.yml`):
- Har push da test va build
- Pull request larda tekshirish

## 🎯 Git Workflow

### Yangi Feature Qo'shish

```bash
# 1. Yangi branch yarating
git checkout -b feature/new-feature-name

# 2. O'zgarishlar qiling
# ... code changes ...

# 3. Commit qiling
git add .
git commit -m "feat: add new feature description"

# 4. Push qiling
git push origin feature/new-feature-name

# 5. GitHub da Pull Request yarating
```

### Bug Fix

```bash
git checkout -b fix/bug-description
# ... fix bug ...
git add .
git commit -m "fix: resolve bug description"
git push origin fix/bug-description
```

### Commit Message Format

```bash
# Feature
git commit -m "feat: add user authentication"

# Bug fix
git commit -m "fix: resolve order status update issue"

# Documentation
git commit -m "docs: update README with deployment guide"

# Style
git commit -m "style: format code with prettier"

# Refactor
git commit -m "refactor: optimize database queries"

# Performance
git commit -m "perf: improve API response time"

# Test
git commit -m "test: add unit tests for order controller"
```

## 🔄 Loyihani Yangilash

### Local dan GitHub ga

```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

### GitHub dan Local ga

```bash
git pull origin main
```

## 📊 Repository Statistics

GitHub da ko'rinadigan ma'lumotlar:
- ✅ Code statistics
- ✅ Commit history
- ✅ Contributors
- ✅ Languages used
- ✅ Dependencies
- ✅ Issues and PRs

## 🎉 Tayyor!

Loyihangiz endi GitHub da:
```
https://github.com/YOUR_USERNAME/basma-restaurant
```

### Keyingi Ishlar:

1. **README Badge qo'shing:**
   - Build status
   - License
   - Version
   - Stars

2. **GitHub Pages (optional):**
   - Documentation uchun

3. **Releases:**
   - v1.0.0 release yarating
   - Changelog qo'shing

4. **Collaborators:**
   - Jamoangizni qo'shing
   - Permissions sozlang

## 🚨 Muhim Eslatmalar

### ❌ QILMANG:
- Parollarni commit qilmang
- API key larni commit qilmang
- Database connection string ni commit qilmang
- `.env` fayllarni commit qilmang

### ✅ QILING:
- `.env.example` fayllarni commit qiling
- README ni to'liq yozing
- Documentation qo'shing
- License qo'shing
- .gitignore to'g'ri sozlang

## 📞 Yordam

Muammo bo'lsa:
```bash
# Git status tekshiring
git status

# Git log ko'ring
git log --oneline

# Remote tekshiring
git remote -v

# Branch larni ko'ring
git branch -a
```

---

**Muvaffaqiyatlar!** 🎉

Loyihangiz endi GitHub da va butun dunyo ko'rishi mumkin!
