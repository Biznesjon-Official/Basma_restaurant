# 🚀 BASMA Restaurant - Deployment Guide
## Domain: basmapos.biznesjon.uz

---

## 📋 Pre-Deployment Checklist

### Server Requirements
- **OS:** Ubuntu 20.04+ or similar
- **RAM:** Minimum 2GB (4GB recommended)
- **CPU:** 2 cores minimum
- **Storage:** 20GB minimum
- **Domain:** basmapos.biznesjon.uz (DNS configured)

### Required Access
- SSH access to server
- Root or sudo privileges
- Domain DNS access

---

## 🔧 Quick Deployment (Automated)

### Option 1: One-Command Deploy

```bash
# SSH into your server
ssh root@your-server-ip

# Download and run deployment script
curl -o deploy.sh https://raw.githubusercontent.com/Biznesjon-Official/Basma_restaurant/main/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

This script will:
1. ✅ Install Node.js, Nginx, PM2, Certbot
2. ✅ Clone repository
3. ✅ Install dependencies
4. ✅ Build applications
5. ✅ Configure environment variables
6. ✅ Setup PM2 processes
7. ✅ Configure Nginx
8. ✅ Obtain SSL certificate
9. ✅ Configure firewall

---

## 📝 Manual Deployment (Step by Step)

### Step 1: Connect to Server

```bash
ssh root@your-server-ip
```

### Step 2: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 3: Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x.x
npm --version
```

### Step 4: Install Required Packages

```bash
# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

### Step 5: Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www/basma-restaurant
cd /var/www/basma-restaurant

# Clone repository
git clone https://github.com/Biznesjon-Official/Basma_restaurant.git .
```

### Step 6: Install Dependencies

```bash
# Frontend dependencies
npm install --production

# Backend dependencies
cd backend
npm install --production
cd ..
```

### Step 7: Configure Environment Variables

#### Frontend (.env.local)
```bash
nano .env.local
```

Add:
```env
MONGODB_URI=mongodb+srv://basmaprox:basmaprox2026@cluster0.1rfwets.mongodb.net/basma_production?retryWrites=true&w=majority&appName=Cluster0
NEXT_PUBLIC_APP_URL=https://basmapos.biznesjon.uz
NEXT_PUBLIC_API_URL=https://basmapos.biznesjon.uz/api
```

#### Backend (.env)
```bash
nano backend/.env
```

Add:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://basmaprox:basmaprox2026@cluster0.1rfwets.mongodb.net/basma_production?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=<generate-with-openssl-rand-base64-64>
JWT_EXPIRE=7d
FRONTEND_URL=https://basmapos.biznesjon.uz
CUSTOMER_API_URL=https://basmapos.biznesjon.uz/api/orders
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

**Generate secure JWT_SECRET:**
```bash
openssl rand -base64 64
```

### Step 8: Build Applications

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build
cd ..
```

### Step 9: Setup Database

```bash
cd backend

# Create all users
npm run seed:users

# Optional: Seed menu items
npm run seed:menu

cd ..
```

### Step 10: Configure PM2

```bash
# Create logs directory
mkdir -p logs

# Start applications with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Follow the command it shows

# Check status
pm2 list
pm2 logs
```

### Step 11: Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/basma

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/basma /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 12: Obtain SSL Certificate

```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d basmapos.biznesjon.uz --non-interactive --agree-tos --email admin@biznesjon.uz

# Start nginx
sudo systemctl start nginx

# Setup auto-renewal
sudo systemctl enable certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

### Step 13: Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## ✅ Verify Deployment

### 1. Check PM2 Processes
```bash
pm2 list
pm2 logs
```

Expected output:
```
┌─────┬──────────────────┬─────────┬─────────┬─────────┐
│ id  │ name             │ status  │ cpu     │ memory  │
├─────┼──────────────────┼─────────┼─────────┼─────────┤
│ 0   │ basma-backend    │ online  │ 0%      │ 50 MB   │
│ 1   │ basma-frontend   │ online  │ 0%      │ 100 MB  │
└─────┴──────────────────┴─────────┴─────────┴─────────┘
```

### 2. Check Nginx Status
```bash
sudo systemctl status nginx
```

### 3. Test Application
```bash
# Test frontend
curl -I https://basmapos.biznesjon.uz

# Test backend API
curl https://basmapos.biznesjon.uz/api/health
```

### 4. Check SSL Certificate
```bash
sudo certbot certificates
```

### 5. Open in Browser
- **Frontend:** https://basmapos.biznesjon.uz
- **API:** https://basmapos.biznesjon.uz/api/health

---

## 🔐 Post-Deployment Security

### 1. Change Default Passwords

Login to admin panel and change all default passwords:
- Admin: 998901111111 / admin123
- Waiter: 998902222221 / waiter123
- Chef: 998903333331 / chef123
- Storekeeper: 998904444441 / store123
- Cashier: 998905555551 / cashier123

### 2. Update MongoDB IP Whitelist

Go to MongoDB Atlas:
1. Network Access
2. Add server IP address
3. Remove 0.0.0.0/0 if present

### 3. Setup Monitoring

```bash
# Install monitoring tools
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔄 Update Deployment

### Pull Latest Changes

```bash
cd /var/www/basma-restaurant

# Pull latest code
git pull origin main

# Install dependencies
npm install --production
cd backend && npm install --production && cd ..

# Build applications
npm run build
cd backend && npm run build && cd ..

# Restart PM2
pm2 restart all

# Check status
pm2 list
pm2 logs
```

---

## 📊 Useful Commands

### PM2 Commands
```bash
pm2 list                    # List all processes
pm2 logs                    # View all logs
pm2 logs basma-backend      # View backend logs
pm2 logs basma-frontend     # View frontend logs
pm2 restart all             # Restart all processes
pm2 restart basma-backend   # Restart backend only
pm2 stop all                # Stop all processes
pm2 delete all              # Delete all processes
pm2 monit                   # Monitor processes
pm2 save                    # Save current process list
```

### Nginx Commands
```bash
sudo nginx -t                      # Test configuration
sudo systemctl status nginx        # Check status
sudo systemctl restart nginx       # Restart
sudo systemctl reload nginx        # Reload config
sudo tail -f /var/log/nginx/basma-access.log   # View access logs
sudo tail -f /var/log/nginx/basma-error.log    # View error logs
```

### SSL Commands
```bash
sudo certbot certificates          # List certificates
sudo certbot renew                 # Renew certificates
sudo certbot renew --dry-run       # Test renewal
```

### System Commands
```bash
df -h                              # Check disk space
free -h                            # Check memory
htop                               # Monitor resources
sudo ufw status                    # Check firewall
```

---

## 🐛 Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs

# Check if ports are in use
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :5000

# Restart PM2
pm2 restart all
```

### Nginx Errors

```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/basma-error.log

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --force-renewal

# Check certificate expiry
echo | openssl s_client -servername basmapos.biznesjon.uz -connect basmapos.biznesjon.uz:443 2>/dev/null | openssl x509 -noout -dates
```

### Database Connection Issues

```bash
# Check MongoDB Atlas IP whitelist
# Check connection string in .env files
# Test connection from server
```

### Port Already in Use

```bash
# Find process using port 3001
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>

# Or use PM2
pm2 delete all
pm2 start ecosystem.config.js
```

---

## 📞 Support

### Logs Location
- **PM2 Logs:** `/var/www/basma-restaurant/logs/`
- **Nginx Logs:** `/var/log/nginx/`
- **System Logs:** `/var/log/syslog`

### Important Files
- **Nginx Config:** `/etc/nginx/sites-available/basma`
- **SSL Certificates:** `/etc/letsencrypt/live/basmapos.biznesjon.uz/`
- **Application:** `/var/www/basma-restaurant/`

---

## 🎉 Success!

Your BASMA Restaurant application is now live at:

**🌐 https://basmapos.biznesjon.uz**

### Default Login:
- **Phone:** 998901111111
- **Password:** admin123

**⚠️ IMPORTANT: Change all default passwords immediately!**

---

**Deployment Date:** 2026-02-06  
**Domain:** basmapos.biznesjon.uz  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
