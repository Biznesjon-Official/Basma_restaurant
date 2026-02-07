#!/bin/bash

# BASMA Restaurant Deployment Script
# Domain: basmapos.biznesjon.uz

set -e  # Exit on error

echo "🚀 Starting BASMA Restaurant Deployment..."
echo "Domain: basmapos.biznesjon.uz"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="basmapos.biznesjon.uz"
APP_DIR="/var/www/basma-restaurant"
FRONTEND_PORT=3001
BACKEND_PORT=5000

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Step 1: Updating system packages...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}📦 Step 2: Installing required packages...${NC}"
apt install -y nginx certbot python3-certbot-nginx git curl

echo -e "${YELLOW}📦 Step 3: Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"
echo -e "${GREEN}✅ NPM version: $(npm --version)${NC}"

echo -e "${YELLOW}📦 Step 4: Installing PM2...${NC}"
npm install -g pm2

echo -e "${YELLOW}📂 Step 5: Setting up application directory...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

# If git repo exists, pull latest changes
if [ -d ".git" ]; then
    echo -e "${YELLOW}🔄 Pulling latest changes...${NC}"
    git pull origin main
else
    echo -e "${YELLOW}📥 Cloning repository...${NC}"
    git clone https://github.com/Biznesjon-Official/Basma_restaurant.git .
fi

echo -e "${YELLOW}📦 Step 6: Installing dependencies...${NC}"

# Frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install --production

# Backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm install --production
cd ..

echo -e "${YELLOW}🔧 Step 7: Setting up environment variables...${NC}"

# Frontend .env.local
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating frontend .env.local...${NC}"
    cat > .env.local << EOF
MONGODB_URI=mongodb+srv://basmaprox:basmaprox2026@cluster0.1rfwets.mongodb.net/basma_production?retryWrites=true&w=majority&appName=Cluster0
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
EOF
else
    echo -e "${GREEN}✅ Frontend .env.local already exists${NC}"
fi

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend .env...${NC}"
    cat > backend/.env << EOF
PORT=$BACKEND_PORT
NODE_ENV=production
MONGODB_URI=mongodb+srv://basmaprox:basmaprox2026@cluster0.1rfwets.mongodb.net/basma_production?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_EXPIRE=7d
FRONTEND_URL=https://$DOMAIN
CUSTOMER_API_URL=https://$DOMAIN/api/orders
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
EOF
    echo -e "${GREEN}✅ Generated secure JWT_SECRET${NC}"
else
    echo -e "${GREEN}✅ Backend .env already exists${NC}"
fi

echo -e "${YELLOW}🏗️  Step 8: Building applications...${NC}"

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
npm run build

# Build backend
echo -e "${YELLOW}Building backend...${NC}"
cd backend
npm run build
cd ..

echo -e "${YELLOW}📊 Step 9: Setting up database...${NC}"
echo -e "${YELLOW}Do you want to seed the database? (y/n)${NC}"
read -p "Seed database? " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd backend
    npm run seed:users
    echo -e "${GREEN}✅ Database seeded${NC}"
    cd ..
fi

echo -e "${YELLOW}🔄 Step 10: Setting up PM2...${NC}"

# Stop existing processes
pm2 delete all 2>/dev/null || true

# Start applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup systemd -u root --hp /root

echo -e "${GREEN}✅ PM2 processes started${NC}"
pm2 list

echo -e "${YELLOW}🌐 Step 11: Configuring Nginx...${NC}"

# Copy nginx configuration
cp nginx.conf /etc/nginx/sites-available/basma

# Create symbolic link
ln -sf /etc/nginx/sites-available/basma /etc/nginx/sites-enabled/

# Remove default nginx site
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}✅ Nginx configured and restarted${NC}"

echo -e "${YELLOW}🔒 Step 12: Setting up SSL certificate...${NC}"
echo -e "${YELLOW}Obtaining SSL certificate from Let's Encrypt...${NC}"

# Stop nginx temporarily for certbot
systemctl stop nginx

# Obtain certificate
certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@biznesjon.uz

# Start nginx
systemctl start nginx

# Setup auto-renewal
systemctl enable certbot.timer

echo -e "${GREEN}✅ SSL certificate obtained${NC}"

echo -e "${YELLOW}🔥 Step 13: Configuring firewall...${NC}"

# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo -e "${GREEN}✅ Firewall configured${NC}"

echo -e "${YELLOW}📝 Step 14: Creating logs directory...${NC}"
mkdir -p logs
chmod 755 logs

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${GREEN}✅ Application URL: https://$DOMAIN${NC}"
echo -e "${GREEN}✅ API URL: https://$DOMAIN/api${NC}"
echo -e "${GREEN}✅ Frontend Port: $FRONTEND_PORT${NC}"
echo -e "${GREEN}✅ Backend Port: $BACKEND_PORT${NC}"
echo ""
echo -e "${YELLOW}📊 Useful Commands:${NC}"
echo -e "  pm2 list              - List all processes"
echo -e "  pm2 logs              - View logs"
echo -e "  pm2 restart all       - Restart all processes"
echo -e "  pm2 monit             - Monitor processes"
echo -e "  nginx -t              - Test nginx config"
echo -e "  systemctl status nginx - Check nginx status"
echo ""
echo -e "${YELLOW}🔐 Default Login Credentials:${NC}"
echo -e "  Admin: 998901111111 / admin123"
echo -e "  ${RED}⚠️  CHANGE PASSWORDS IMMEDIATELY!${NC}"
echo ""
echo -e "${GREEN}Deployment completed successfully! 🚀${NC}"
