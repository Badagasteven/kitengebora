# Setup Guide - React Frontend

## 🚀 Quick Start

### 1. Install Dependencies

Open PowerShell/Command Prompt and run:

```powershell
cd "C:\Users\Badaga\Desktop\bora - demo\kitenge-frontend"
npm install
```

**Note:** If you get execution policy errors, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Start Development Server

```powershell
npm run dev
```

The app will start at **http://localhost:3000**

### 3. Start Backend (Separate Terminal)

Make sure the Spring Boot backend is running:

```powershell
cd "C:\Users\Badaga\Desktop\bora - demo\kitenge-backend"
mvn spring-boot:run
```

Backend runs at **http://localhost:8080**

## ✅ What's Included

### Frontend Features
- ✅ Modern React + Vite setup
- ✅ Tailwind CSS for styling
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Product browsing with search/filters
- ✅ Shopping cart
- ✅ User authentication
- ✅ Wishlist
- ✅ Admin dashboard
- ✅ Order management

### Pages Created
- `/` - Home/Store page
- `/login` - Login page
- `/register` - Registration page
- `/account` - User account page
- `/wishlist` - Wishlist page
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management

## 🎨 Design Improvements

Based on your existing design, I've created:
- **Modern UI** with smooth animations
- **Better mobile experience** with responsive design
- **Improved cart** with slide-out drawer
- **Enhanced product cards** with hover effects
- **Better admin interface** with tables and modals
- **Dark mode** support throughout

## 🔧 Configuration

### Backend URL
The frontend connects to `http://localhost:8080/api` by default.

To change it, create `.env` file:
```
VITE_API_URL=http://your-backend-url/api
```

## 📝 Next Steps

1. **Install dependencies:** `npm install`
2. **Start frontend:** `npm run dev`
3. **Start backend:** `mvn spring-boot:run` (in backend folder)
4. **Open browser:** http://localhost:3000

## 🎉 You're Ready!

The React frontend is fully set up and ready to use. All components are created and connected to your Spring Boot backend.

