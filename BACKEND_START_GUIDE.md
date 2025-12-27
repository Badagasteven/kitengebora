# 🚀 Backend Start Guide

## ⚠️ Port 8080 Already in Use - Quick Fix

### Option 1: Use the Fix Script (Easiest)
Double-click: `kitenge-backend/FIX_PORT_8080.bat`

This will:
- Stop all Java processes
- Wait for ports to release
- Check if port 8080 is free
- Tell you when it's safe to start

### Option 2: Manual Fix

**Step 1: Stop Java Processes**
```bash
taskkill /F /IM java.exe
```

**Step 2: Wait 3-5 seconds**

**Step 3: Start Backend**
```bash
cd kitenge-backend
mvn spring-boot:run
```

### Option 3: Change Port (If 8080 keeps being used)

Edit `kitenge-backend/src/main/resources/application.properties`:
```properties
server.port=8081
```

Then update frontend `kitenge-frontend/src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
```

## ✅ Success Indicators

When backend starts successfully, you'll see:

```
✅ Admin account created: badagaclass@gmail.com
Started KitengeBoraApplication in X.XXX seconds
```

## 🔍 Troubleshooting

### Still Getting Port Error?

1. **Check what's using port 8080:**
   ```bash
   netstat -ano | findstr :8080
   ```

2. **Stop the specific process:**
   ```bash
   taskkill /F /PID <process_id>
   ```

3. **Use Task Manager:**
   - Open Task Manager (Ctrl+Shift+Esc)
   - Find `java.exe` process
   - End Task

### Backend Won't Start?

1. **Check PostgreSQL is running**
2. **Check database `kitenge` exists**
3. **Check `application.properties` credentials**
4. **Check Java version:** `java -version` (should be 17+)

## 📋 Quick Commands

```bash
# Stop all Java
taskkill /F /IM java.exe

# Start backend
cd kitenge-backend
mvn spring-boot:run

# Check port 8080
netstat -ano | findstr :8080
```

## ✅ Current Status

- ✅ All Java processes stopped
- ✅ Backend restarting in background
- ✅ Fix script created: `FIX_PORT_8080.bat`

**Wait for the backend to start and look for the success message!** 🎉

