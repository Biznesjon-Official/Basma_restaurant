# 🍽️ BASMA Osh Markazi - Restaurant Management System

Professional restaurant management system with real-time order tracking, kitchen display, inventory management, and multi-role access control.

![Status](https://img.shields.io/badge/status-production--ready-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

## 📋 Features

### 🔐 Multi-Role System
- **Admin** - Full system control, analytics, reports
- **Waiter** - Table management, order creation, marketplace orders
- **Chef** - Kitchen Display System (KDS), order status updates
- **Storekeeper** - Inventory management, stock tracking
- **Cashier** - Payment processing, receipt printing

### ⚡ Real-time Features
- Live order updates via Socket.io
- Kitchen display notifications
- Low stock alerts
- Marketplace order integration
- Waiter call system

### 📊 Management Tools
- Menu management with categories
- Table management with QR code generation
  - Automatic QR code creation for each table
  - Download QR codes (PNG/SVG)
  - Regenerate QR codes for security
  - Customer self-ordering via QR scan
- Inventory tracking with alerts
- Sales analytics and reports
- Activity logging
- Excel/PDF export

### 🔗 Integrations
- External marketplace webhook support
- Real-time order synchronization
- Customer order tracking

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Socket.io Client** - Real-time updates
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/basma-restaurant.git
cd basma-restaurant
```

### 2. Install Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 3. Environment Setup

#### Frontend (.env.local)
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_change_in_production
FRONTEND_URL=http://localhost:3001
```

### 4. Database Setup

Create users and seed data:
```bash
cd backend
npm run seed:users    # Create all users
npm run seed:menu     # Seed menu items
npm run seed:full     # Full database seed
```

### 5. Start Development Servers

#### Option 1: Start Both (Recommended)
```bash
# From root directory
npm run dev
```

#### Option 2: Start Separately
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev:frontend
```

## 🔑 Default Login Credentials

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

**⚠️ IMPORTANT:** Change all passwords in production!

## 🌐 Access URLs

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:5000/api
- **Socket.io:** ws://localhost:5000

## 📚 Documentation

- [Production Checklist](./PRODUCTION_CHECKLIST.md) - Deployment guide
- [Project Status](./PROJECT_STATUS.md) - Feature list
- [QR Code Guide](./docs/QR_CODE_GUIDE.md) - QR code system usage
- [MongoDB Structure](./docs/MONGODB_STRUCTURE.md) - Database structure and access
- [Backend API](./backend/API_DOCUMENTATION.md) - API reference
- [Seed Instructions](./backend/SEED_INSTRUCTIONS.md) - Database seeding

## 🏗️ Project Structure

```
basma-restaurant/
├── app/                    # Next.js pages
│   ├── admin/             # Admin dashboard
│   ├── waiter/            # Waiter interface
│   ├── kitchen/           # Kitchen display
│   ├── storekeeper/       # Inventory management
│   ├── cashier/           # Cashier interface
│   └── login/             # Authentication
├── components/            # React components
├── lib/                   # Utilities
├── hooks/                 # Custom hooks
├── public/                # Static assets
├── backend/               # Backend API
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Express middlewares
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities
│   │   ├── config/        # Configuration
│   │   └── scripts/       # Database scripts
│   └── dist/              # Compiled TypeScript
└── docs/                  # Documentation
```

## 🔧 Available Scripts

### Frontend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

### Backend
```bash
npm run dev              # Start development server
npm run build            # Compile TypeScript
npm start                # Start production server
npm run seed             # Seed test data
npm run seed:users       # Create all users
npm run seed:menu        # Seed menu items
npm run seed:full        # Full database seed
npm run clear            # Clear all data
```

## 🚀 Production Deployment

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for detailed deployment guide.

### Quick Deploy Steps

1. **Update Environment Variables**
   - Change JWT_SECRET
   - Update database credentials
   - Set production URLs

2. **Build Applications**
   ```bash
   # Frontend
   npm run build
   
   # Backend
   cd backend
   npm run build
   ```

3. **Use PM2 for Process Management**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Setup Nginx**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/basma
   sudo ln -s /etc/nginx/sites-available/basma /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Setup SSL**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

## 🔒 Security

- JWT authentication with bcrypt password hashing
- Role-based access control (RBAC)
- Rate limiting on API endpoints
- Helmet.js security headers
- CORS configuration
- Input validation
- MongoDB injection prevention

## 📊 Performance

- MongoDB indexing for fast queries
- Pagination on all list endpoints
- Connection pooling
- Response compression
- Async/await throughout
- Socket.io for real-time updates

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team** - BASMA Osh Markazi
- **Contact** - [Your Email]
- **Website** - [Your Website]

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Shadcn for the beautiful UI components
- MongoDB team for the robust database
- All contributors and testers

## 📞 Support

For support, email support@basma-restaurant.uz or open an issue on GitHub.

---

**Made with ❤️ by BASMA Team**

**Last Updated:** February 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
