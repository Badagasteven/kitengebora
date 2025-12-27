# 🎯 START HERE - Complete Setup

## ⚡ Quick Start (3 Steps)

### 1️⃣ Fix PowerShell (One Time Only)

Open PowerShell as **Administrator** and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Close and reopen PowerShell** after this.

---

### 2️⃣ Install Frontend Dependencies

```bash
cd "C:\Users\Badaga\Desktop\bora - demo\kitenge-frontend"
npm install
```

⏱️ Takes 2-5 minutes. Wait for it to finish.

---

### 3️⃣ Start Both Servers

**Terminal 1 - Backend:**
```bash
cd "C:\Users\Badaga\Desktop\bora - demo\kitenge-backend"
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd "C:\Users\Badaga\Desktop\bora - demo\kitenge-frontend"
npm run dev
```

---

## 🌐 Open Browser

Go to: **http://localhost:3000**

---

## ✅ That's It!

Your complete React + Spring Boot application is now running!

---

## 📚 Need More Help?

- See `SETUP_INSTRUCTIONS.md` for detailed steps
- See `FULL_STACK_GUIDE.md` for complete guide
- See `kitenge-frontend/README.md` for frontend docs
- See `kitenge-backend/README.md` for backend docs

---

**🎉 Enjoy your beautiful new application!**

