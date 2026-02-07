# BASMA Osh Markazi - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 🔐 AUTH ENDPOINTS

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+998901234567",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "Admin BASMA",
      "phone": "+998901234567",
      "role": "admin"
    }
  }
}
```

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

---

## 🍽️ MENU ENDPOINTS

### Get Menu Items (Paginated)
```http
GET /api/menu?page=1&limit=20&category=Osh&available=true
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Samarqand oshi",
      "category": "Osh",
      "price": 45000,
      "cost": 22000,
      "available": true,
      "preparationTime": 25,
      "createdAt": "2026-01-30T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 19,
    "pages": 1
  }
}
```

### Create Menu Item (Admin only)
```http
POST /api/menu
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Yangi taom",
  "category": "Osh",
  "price": 50000,
  "cost": 25000,
  "available": true,
  "preparationTime": 30
}
```

### Update Menu Item (Admin only)
```http
PUT /api/menu/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 55000,
  "available": false
}
```

### Delete Menu Item (Admin only)
```http
DELETE /api/menu/:id
Authorization: Bearer <token>
```

---

## 📋 ORDER ENDPOINTS

### Get Orders (Paginated)
```http
GET /api/orders?page=1&limit=20&status=pending&tableNumber=3
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status: pending, preparing, ready, served, paid
- `tableNumber` - Filter by table number

### Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

### Create Order (Admin/Waiter only)
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "tableNumber": 3,
  "items": [
    {
      "menuItem": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "notes": "Achchiq bo'lmasin"
    }
  ],
  "waiter": "Akmal",
  "totalAmount": 90000
}
```

### Update Order Status
```http
PUT /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ready"
}
```

---

## 🪑 TABLE ENDPOINTS

### Get Tables
```http
GET /api/tables?status=available
Authorization: Bearer <token>
```

### Create Table (Admin only)
```http
POST /api/tables
Authorization: Bearer <token>
Content-Type: application/json

{
  "number": 13,
  "capacity": 4,
  "status": "available"
}
```

### Update Table (Admin/Waiter)
```http
PUT /api/tables/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "occupied",
  "currentOrder": "507f1f77bcf86cd799439011"
}
```

---

## 📦 INVENTORY ENDPOINTS

### Get Inventory (Paginated)
```http
GET /api/inventory?page=1&limit=20&lowStock=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `lowStock=true` - Show only low stock items

### Create Inventory Item (Admin/Storekeeper)
```http
POST /api/inventory
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Guruch",
  "unit": "kg",
  "quantity": 150,
  "minQuantity": 50,
  "price": 22000,
  "supplier": "Agro Markaz"
}
```

### Update Inventory Item (Admin/Storekeeper)
```http
PUT /api/inventory/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 200
}
```

---

## 🔒 ROLE-BASED ACCESS

| Endpoint | Admin | Waiter | Chef | Storekeeper |
|----------|-------|--------|------|-------------|
| GET /menu | ✅ | ✅ | ✅ | ✅ |
| POST /menu | ✅ | ❌ | ❌ | ❌ |
| DELETE /menu | ✅ | ❌ | ❌ | ❌ |
| GET /orders | ✅ | ✅ | ✅ | ❌ |
| POST /orders | ✅ | ✅ | ❌ | ❌ |
| GET /tables | ✅ | ✅ | ✅ | ❌ |
| POST /tables | ✅ | ❌ | ❌ | ❌ |
| GET /inventory | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /inventory | ✅ | ✅ | ❌ | ❌ | ✅ |

---

## 🔌 SOCKET.IO EVENTS

### Connection
```javascript
const socket = io('http://localhost:5000')
```

### Subscribe to Kitchen Updates
```javascript
socket.emit('kitchen:subscribe')

socket.on('order:new', (order) => {
  console.log('New order:', order)
})

socket.on('order:status', (order) => {
  console.log('Order status updated:', order)
})
```

### Subscribe to Table Updates
```javascript
socket.emit('order:subscribe', tableNumber)

socket.on('order:ready', (order) => {
  console.log('Order ready:', order)
})
```

---

## ⚡ PERFORMANCE FEATURES

1. **Pagination** - All list endpoints support pagination
2. **Database Indexing** - Optimized queries with indexes
3. **Connection Pooling** - MongoDB connection reuse
4. **Error Handling** - Centralized error handler
5. **Rate Limiting** - 100 requests per 15 minutes
6. **CORS** - Configured for frontend
7. **Compression** - Response compression enabled
8. **Security** - Helmet.js security headers

---

## 🧪 TESTING

### Test Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+998901234567","password":"admin123"}'
```

### Test Protected Endpoint
```bash
curl http://localhost:5000/api/menu \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📝 DEFAULT ADMIN CREDENTIALS

```
Phone: +998901234567
Password: admin123
Role: admin
```

**⚠️ IMPORTANT:** Change these credentials in production!
