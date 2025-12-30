# 🎉 Kitenge Bora - Full Stack E-Commerce Application

Modern React frontend + Spring Boot backend for a beautiful e-commerce experience.

## 🚀 Quick Start

### 1. Fix PowerShell (One Time)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Install Frontend Dependencies
```bash
cd kitenge-frontend
npm install
```

### 3. Start Backend
```bash
cd kitenge-backend
mvn spring-boot:run
```

### 4. Start Frontend
```bash
cd kitenge-frontend
npm run dev
```

### 5. Open Browser
http://localhost:3000

---

## 📁 Project Structure

```
kitengebora/
├── kitenge-backend/      # Spring Boot Backend (Port 8082)
│   ├── src/main/java/   # Java source code
│   └── render.yaml       # Render deployment config
│
└── kitenge-frontend/     # React Frontend (Port 3000)
    ├── src/              # React source code
    └── netlify.toml      # Netlify deployment config
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

---

## 🚀 Deployment

### Free Hosting Setup

This project is configured for **free hosting** using:
- **Frontend:** Netlify
- **Backend + Database:** Render

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for detailed step-by-step instructions.

**Quick Start:** See **[QUICK_START.md](./QUICK_START.md)** for a deployment checklist.

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

## ✅ Status

- ✅ Backend: Complete
- ✅ Frontend: Complete
- ✅ Database: Configured
- ✅ Authentication: JWT
- ✅ All Features: Working
- ✅ Mobile Optimized: Android & iOS
- ✅ Deployment Ready: Netlify + Render

**Ready to deploy!** 🚀

---

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[QUICK_START.md](./QUICK_START.md)** - Quick deployment checklist
- **[IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md)** - All improvements made

---

## 📝 License

This project is private and proprietary.
