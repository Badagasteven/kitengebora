# 🚀 Complete Setup Instructions

## ⚠️ Important: PowerShell Execution Policy

If you get npm errors, run this first in PowerShell (as Administrator):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then close and reopen PowerShell.

---

## 📋 Step-by-Step Setup

### Step 1: Install Frontend Dependencies

Open PowerShell/Command Prompt:

```bash
cd "C:\Users\Badaga\Desktop\bora - demo\kitenge-frontend"
npm install
```

**This will take 2-5 minutes** - it's downloading all React dependencies.

### Step 2: Start Backend Server

**Open a NEW Terminal/PowerShell window:**

```bash
cd "C:\Users\Badaga\Desktop\bora - demo\kitenge-backend"
mvn spring-boot:run
```

Wait for: `Started KitengeBoraApplication in X.XXX seconds`

### Step 3: Start Frontend Server

**Open ANOTHER Terminal/PowerShell window:**

```bash
cd "C:\Users\Badaga\Desktop\bora - demo\kitenge-frontend"
npm run dev
```

Wait for: `Local: http://localhost:3000`

### Step 4: Open Browser

Go to: **http://localhost:3000**

---

## 🎯 What You'll See

### Frontend (React) - http://localhost:3000
- Beautiful modern UI
- Product browsing
- Shopping cart
- User login/register
- Admin dashboard

### Backend (Spring Boot) - http://localhost:8080
- REST API
- Database connection
- Authentication
- File uploads

---

## ✅ Quick Commands Reference

### Backend
```bash
cd kitenge-backend
mvn spring-boot:run
```

### Frontend
```bash
cd kitenge-frontend
npm install        # First time only
npm run dev
```

---

## 🐛 Troubleshooting

### npm install fails?
1. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
2. Close and reopen PowerShell
3. Try again

### Backend won't start?
- Check PostgreSQL is running
- Verify database `kitenge` exists
- Check `application.properties` credentials

### Frontend won't start?
- Make sure you ran `npm install` first
- Check Node.js is installed: `node -v`
- Should be Node 18+

### Can't connect to backend?
- Make sure backend is running on port 8080
- Check backend logs for errors
- Verify CORS is configured

---

## 🎉 You're Ready!

Once both servers are running:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api

Enjoy your beautiful React application! 🚀

