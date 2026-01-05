# 🎉 Kitenge Bora - Full Stack E-Commerce Application

Modern React frontend + Spring Boot backend for a beautiful e-commerce experience.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Java** 17+
- **Maven** 3.6+
- **PostgreSQL** 12+

### 1. Database Setup

Create a PostgreSQL database:
```sql
CREATE DATABASE kitenge;
```

### 2. Backend Setup

```bash
cd kitenge-backend
```

Update `src/main/resources/application.properties` with your database credentials:
```properties
spring.datasource.username=postgres
spring.datasource.password=your_password
```

Start the backend:
```bash
# Windows
start-server.bat

# Or manually
mvn spring-boot:run
```

Backend will run on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd kitenge-frontend
npm install
```

Start the frontend:
```bash
# Windows
start-frontend.bat

# Or manually
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Open Browser

Visit: **http://localhost:3000**

---

## 📁 Project Structure

```
kitengebora/
├── kitenge-backend/      # Spring Boot Backend (Port 8080)
│   ├── src/main/java/    # Java source code
│   ├── src/main/resources/application.properties
│   └── start-server.bat   # Windows start script
│
└── kitenge-frontend/     # React Frontend (Port 3000)
    ├── src/              # React source code
    ├── public/           # Static assets
    └── start-frontend.bat # Windows start script
```

---

## ✨ Features

### Customer Features
- Browse products with search & filters
- Shopping cart
- Wishlist
- User authentication
- Order history
- WhatsApp checkout
- Mobile-optimized (Android & iOS)

### Admin Features
- Dashboard with metrics
- Product management (CRUD)
- Image uploads
- Order management
- Customer management

---

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Spring Boot 3.2.0
- PostgreSQL
- JWT Authentication
- Spring Security

---

## 🔧 Configuration

### Backend Configuration

Edit `kitenge-backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/kitenge
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT Secret (change in production!)
jwt.secret=your-secret-key-change-this-in-production

# Admin Email
app.admin.email=kitengeboraa@gmail.com

# Email (optional)
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### Frontend Configuration

Create `kitenge-frontend/.env` (optional):
```env
VITE_API_URL=http://localhost:8080/api
```

---

## 📚 Documentation

- **[kitenge-backend/README.md](./kitenge-backend/README.md)** - Backend documentation
- **[kitenge-frontend/README.md](./kitenge-frontend/README.md)** - Frontend documentation

---

## ✅ Status

- ✅ Backend: Complete
- ✅ Frontend: Complete
- ✅ Database: Configured
- ✅ Authentication: JWT
- ✅ All Features: Working
- ✅ Mobile Optimized: Android & iOS

---

## 📝 License

This project is private and proprietary.
