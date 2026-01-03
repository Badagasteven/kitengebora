# 🚨 URGENT: Fix Image Loading (ERR_CONNECTION_REFUSED)

## The Problem
Your console shows `ERR_CONNECTION_REFUSED` - this means **your backend is NOT running** or not accessible.

## ✅ IMMEDIATE FIX (Do This Now!)

### Step 1: Start Your Backend ⚡

**Open a NEW terminal window and run:**

```bash
cd kitenge-backend
mvn spring-boot:run
```

**Wait for this message:**
```
Started KitengeBoraApplication
Tomcat started on port(s): 8080
```

**⚠️ KEEP THIS TERMINAL OPEN!** The backend must stay running.

---

### Step 2: Verify Backend is Running ✅

**Test in browser:**
1. Open: `http://localhost:8080/api/public-products`
2. You should see JSON data (product list)
3. If you see an error → Backend not running correctly

---

### Step 3: Test Image URL Directly 🖼️

1. In browser console, find one of the image filenames (e.g., `1766596431129-739ef836.jpg`)
2. Try opening: `http://localhost:8080/uploads/1766596431129-739ef836.jpg`
3. **If image loads** → Backend is working! Refresh your frontend page.
4. **If 404** → Image file doesn't exist in `uploads` folder
5. **If connection refused** → Backend still not running

---

### Step 4: Check Your .env File 📝

**Make sure `kitenge-frontend/.env` exists with:**

```env
VITE_API_URL=http://localhost:8080/api
```

**If backend uses port 8082, change to:**
```env
VITE_API_URL=http://localhost:8082/api
```

**Then RESTART your frontend** (stop with Ctrl+C and run `npm run dev` again)

---

## 🔍 How to Check What Port Backend Uses

**Look at backend terminal output when starting:**
- Should say: `Tomcat started on port(s): 8080` 
- OR: `Tomcat started on port(s): 8082`

**Update `.env` file to match the port!**

---

## ✅ Quick Checklist

- [ ] Backend is running (check terminal)
- [ ] Backend shows "Started KitengeBoraApplication"
- [ ] Can access `http://localhost:8080/api/public-products` in browser
- [ ] `.env` file has correct port (8080 or 8082)
- [ ] Frontend restarted after creating/updating `.env`
- [ ] Images exist in `kitenge-backend/uploads/` folder

---

## 🎯 Most Common Issue

**Backend is not running!**

The `ERR_CONNECTION_REFUSED` error means your browser is trying to connect to `http://localhost:8080` but nothing is listening there.

**Solution:** Start the backend server!

---

## Still Not Working?

1. **Check if port 8080 is in use:**
   ```bash
   netstat -ano | findstr :8080
   ```
   If something else is using port 8080, either:
   - Stop that program, OR
   - Change backend to port 8082 and update `.env`

2. **Check backend logs** for errors when starting

3. **Verify images exist:**
   - Check `kitenge-backend/uploads/` folder
   - Files should match the filenames in database

4. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Clear cache
   - Hard refresh: Ctrl+F5
