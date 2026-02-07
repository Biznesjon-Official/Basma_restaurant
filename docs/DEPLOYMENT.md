# 🚀 Deployment Guide

Complete guide for deploying BASMA Restaurant to production.

## 📋 Prerequisites

- Ubuntu 20.04+ or similar Linux server
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## 🔧 Server Setup

### 1. Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should be 20.x
```

### 3. Install PM2
```bash
sudo npm install -g pm2
```

### 4. Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Install Certbot (for SSL)
```bash
sudo apt install certbot python3-certbot-nginx -y
```

## 📦 Application Deployment

### 1. Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/yourusername/basma-restaurant.git
cd basma-restaurant
```

### 2. Install Dependencies

#### Frontend
```bash
npm install --production
```

#### Backend
```bash
cd backend
npm install --production
cd ..
```

### 3. Configure Environment

#### Frontend (.env.local)
```bash
cp .env.example .env.local
nano .env.local
```

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/basma_production
NEXT_PUBLIC_APP_URL=https://basma-restaurant.uz
NEXT_PUBLIC_API_URL=https://api.basma-restaurant.uz
```

#### Backend (.env)
```bash
cd backend
cp .env.example .env
nano .env
```

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/basma_production
JWT_SECRET=<generate-strong-secret-here>
FRONTEND_URL=https://basma-restaurant.uz
RATE_LIMIT_MAX_REQUESTS=50
```

**Generate strong JWT secret:**
```bash
openssl rand -base64 64
```

### 4. Build Applications

#### Frontend
```bash
npm run build
```

#### Backend
```bash
cd backend
npm run build
cd ..
```

### 5. Setup Database

```bash
cd backend
npm run seed:users  # Create users
npm run seed:menu   # Seed menu (optional)
cd ..
```

## 🔄 PM2 Configuration

### 1. Create PM2 Config
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'basma-backend',
      script: './backend/dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M'
    },
    {
      name: 'basma-frontend',
      script: 'npm',
      args: 'start',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}
```

### 2. Start Applications
```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown
```

### 3. PM2 Commands
```bash
pm2 list                    # List all processes
pm2 logs                    # View logs
pm2 logs basma-backend      # View backend logs
pm2 logs basma-frontend     # View frontend logs
pm2 restart all             # Restart all
pm2 stop all                # Stop all
pm2 delete all              # Delete all
pm2 monit                   # Monitor
```

## 🌐 Nginx Configuration

### 1. Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/basma
```

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name basma-restaurant.uz www.basma-restaurant.uz;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name basma-restaurant.uz www.basma-restaurant.uz;

    # SSL Configuration (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/basma-restaurant.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/basma-restaurant.uz/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3001;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/basma /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Setup SSL
```bash
sudo certbot --nginx -d basma-restaurant.uz -d www.basma-restaurant.uz
```

Follow the prompts and choose to redirect HTTP to HTTPS.

### 4. Auto-renew SSL
```bash
sudo certbot renew --dry-run
```

Certbot will automatically renew certificates.

## 🔥 Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

## 📊 Monitoring

### 1. PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 2. System Monitoring
```bash
# Install htop
sudo apt install htop

# Monitor resources
htop
```

### 3. Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Updates and Maintenance

### Update Application
```bash
cd /var/www/basma-restaurant

# Pull latest changes
git pull origin main

# Install dependencies
npm install --production
cd backend && npm install --production && cd ..

# Build
npm run build
cd backend && npm run build && cd ..

# Restart
pm2 restart all
```

### Database Backup
```bash
# Create backup script
nano /home/user/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/backups/mongodb"
mkdir -p $BACKUP_DIR

# Backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$DATE"

# Delete old backups (30 days)
find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} \;

echo "Backup completed: $DATE"
```

```bash
chmod +x /home/user/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/user/backup.sh
```

## ✅ Post-Deployment Checklist

- [ ] Applications running (pm2 list)
- [ ] Nginx configured and running
- [ ] SSL certificate valid
- [ ] Firewall configured
- [ ] Database connection working
- [ ] Environment variables set correctly
- [ ] All default passwords changed
- [ ] Backup script configured
- [ ] Monitoring setup
- [ ] Logs rotating properly
- [ ] Health check endpoint working
- [ ] Socket.io connections working
- [ ] Test all user roles
- [ ] Test order flow
- [ ] Test real-time updates

## 🚨 Troubleshooting

### Application won't start
```bash
pm2 logs
# Check for errors in logs
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Database connection issues
```bash
# Check MongoDB Atlas IP whitelist
# Verify connection string
# Check network connectivity
```

### SSL issues
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
```

## 📞 Support

For deployment issues, check:
- Application logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/`
- System logs: `journalctl -xe`

---

**Last Updated:** February 6, 2026
