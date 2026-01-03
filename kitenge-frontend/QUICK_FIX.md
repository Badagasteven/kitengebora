# 🚀 Quick Fix: Products Not Showing

## Immediate Steps (Do These First!)

### 1. ✅ Create `.env` File (Already Done!)
The `.env` file has been created in `kitenge-frontend/` folder with:
```
VITE_API_URL=http://localhost:8080/api
```

**⚠️ IMPORTANT:** Restart your frontend after creating `.env` file!

### 2. 🔍 Check Backend is Running

Open a new terminal and run:
```bash
cd kitenge-backend
mvn spring-boot:run
```

**Look for this message:**
```
Started KitengeBoraApplication
Tomcat started on port(s): 8080
```

### 3. 🧪 Test API Directly

Open in your browser:
```
http://localhost:8080/api/public-products
```

**Expected:** You should see JSON data like:
```json
[
  {
    "id": 1,
    "name": "Product Name",
    "price": 5000,
    ...
  }
]
```

**If you see:**
- ❌ **Connection refused** → Backend not running
- ❌ **404 Not Found** → Wrong port or endpoint
- ✅ **Empty array []** → No products in database or all inactive
- ✅ **JSON data** → API works! Check frontend

### 4. 🔄 Restart Frontend

**Stop frontend (Ctrl+C) and restart:**
```bash
cd kitenge-frontend
npm run dev
```

**Why?** Vite needs to restart to read the new `.env` file.

### 5. 🖥️ Check Browser Console

1. Open `http://localhost:3000`
2. Press **F12** (DevTools)
3. Check **Console** tab
4. Look for:
   - ✅ `🔗 API Base URL: http://localhost:8080/api`
   - ✅ `🔄 Loading products...`
   - ✅ `✅ Products loaded: X items`

**If you see errors:**
- ❌ `Network Error` → Backend not running
- ❌ `CORS policy` → CORS issue (see troubleshooting guide)
- ❌ `404` → Wrong API URL

### 6. 📊 Check Network Tab

1. In DevTools, go to **Network** tab
2. Refresh page (F5)
3. Look for request to `/api/public-products`
4. Click on it to see:
   - **Status:** Should be `200 OK`
   - **Response:** Should show product data

---

## Common Issues

### Issue: Backend runs on port 8082, not 8080

**Fix:** Update `kitenge-frontend/.env`:
```
VITE_API_URL=http://localhost:8082/api
```

Then restart frontend.

### Issue: Products exist but don't show

**Check database:**
```sql
-- Connect to PostgreSQL
psql -U postgres -d kitenge

-- Check products
SELECT id, name, price, active FROM products;

-- If active = false, update:
UPDATE products SET active = true WHERE id = 1;
```

### Issue: Still not working

1. **Check all services:**
   - ✅ PostgreSQL running
   - ✅ Backend running (port 8080 or 8082)
   - ✅ Frontend running (port 3000)

2. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Clear cache
   - Hard refresh: Ctrl+F5

3. **Check firewall:**
   - Temporarily disable Windows Firewall to test

---

## Still Need Help?

See `TROUBLESHOOTING.md` for detailed solutions.
