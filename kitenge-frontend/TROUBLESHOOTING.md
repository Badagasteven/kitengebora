# 🔧 Troubleshooting: Products Not Showing

## Common Issues & Solutions

### Issue 1: Backend Not Running ⚠️

**Symptoms:**
- Products don't load
- Browser console shows: `Failed to fetch` or `Network Error`
- API calls fail with connection errors

**Solution:**
1. **Check if backend is running:**
   ```bash
   cd kitenge-backend
   mvn spring-boot:run
   ```

2. **Verify backend is accessible:**
   - Open browser: `http://localhost:8080/api/public-products`
   - You should see JSON data with products
   - If you see an error, the backend is not running correctly

3. **Check backend logs:**
   - Look for: `Started KitengeBoraApplication`
   - Look for: `Tomcat started on port(s): 8080`
   - If you see port conflicts, see Issue 2 below

---

### Issue 2: Port Mismatch 🔌

**Symptoms:**
- Backend runs on different port (e.g., 8082)
- Frontend tries to connect to 8080
- CORS errors in console

**Solution:**

**Option A: Create `.env` file in `kitenge-frontend/` folder:**
```env
VITE_API_URL=http://localhost:8080/api
```

**If your backend runs on 8082, use:**
```env
VITE_API_URL=http://localhost:8082/api
```

**Option B: Check what port your backend is actually using:**
1. Look at backend terminal output when starting
2. It should say: `Tomcat started on port(s): 8080` (or 8082)
3. Update `.env` file accordingly

**Option C: Change backend port to 8080:**
1. Edit `kitenge-backend/src/main/resources/application.properties`
2. Make sure it says: `server.port=${PORT:8080}`
3. Restart backend

---

### Issue 3: CORS Errors 🌐

**Symptoms:**
- Browser console shows: `CORS policy: No 'Access-Control-Allow-Origin' header`
- Network tab shows OPTIONS request failing

**Solution:**
1. **Check backend CORS configuration:**
   - File: `kitenge-backend/src/main/java/com/kitenge/config/WebConfig.java`
   - Should include: `http://localhost:3000`

2. **Verify frontend URL:**
   - Frontend should run on: `http://localhost:3000`
   - If using different port, update CORS config in backend

3. **Restart both frontend and backend** after changes

---

### Issue 4: Database Connection Issues 💾

**Symptoms:**
- Backend starts but products endpoint returns empty array
- Backend logs show database errors
- Products exist in database but don't show

**Solution:**
1. **Check PostgreSQL is running:**
   ```bash
   # Windows (PowerShell)
   Get-Service -Name postgresql*
   
   # Or check if port 5432 is listening
   netstat -ano | findstr :5432
   ```

2. **Verify database connection:**
   - Check `application.properties`:
     ```properties
     spring.datasource.url=jdbc:postgresql://localhost:5432/kitenge
     spring.datasource.username=postgres
     spring.datasource.password=your_password
     ```

3. **Check if products exist in database:**
   ```sql
   -- Connect to PostgreSQL
   psql -U postgres -d kitenge
   
   -- Check products
   SELECT id, name, price, active FROM products;
   ```

4. **Check if products are active:**
   - The `/api/public-products` endpoint only returns products where `active = true`
   - Make sure your products have `active = true` in the database

---

### Issue 5: API Endpoint Wrong 🎯

**Symptoms:**
- Network requests go to wrong URL
- 404 errors in network tab

**Solution:**
1. **Check browser Network tab:**
   - Open DevTools (F12)
   - Go to Network tab
   - Look for request to `/api/public-products`
   - Check the full URL (should be `http://localhost:8080/api/public-products`)

2. **Verify API configuration:**
   - File: `kitenge-frontend/src/services/api.js`
   - Should use: `import.meta.env.VITE_API_URL || 'http://localhost:8080/api'`

3. **Test API directly:**
   - Open: `http://localhost:8080/api/public-products`
   - Should return JSON array of products

---

### Issue 6: Frontend Not Loading Data 📦

**Symptoms:**
- No errors in console
- Loading spinner shows forever
- Products array is empty

**Solution:**
1. **Check browser console for errors:**
   - Open DevTools (F12)
   - Look for red error messages
   - Check Network tab for failed requests

2. **Add debug logging:**
   - Open `kitenge-frontend/src/pages/Home.jsx`
   - In `loadProducts()` function, add:
     ```javascript
     console.log('API URL:', API_BASE_URL)
     console.log('Response:', response.data)
     ```

3. **Check if response format is correct:**
   - API should return: `{ data: [...] }` or just `[...]`
   - Check `Home.jsx` line 35: `setProducts(response.data)`
   - If API returns `{ data: [...] }`, use `response.data.data`

---

## Quick Diagnostic Steps 🔍

### Step 1: Check Backend
```bash
# In kitenge-backend folder
mvn spring-boot:run

# Should see:
# "Started KitengeBoraApplication"
# "Tomcat started on port(s): 8080"
```

### Step 2: Test API Directly
Open in browser: `http://localhost:8080/api/public-products`

**Expected:** JSON array of products
**If empty:** Check database
**If error:** Backend not running or wrong port

### Step 3: Check Frontend
```bash
# In kitenge-frontend folder
npm run dev

# Should start on http://localhost:3000
```

### Step 4: Check Browser Console
1. Open `http://localhost:3000`
2. Press F12 (DevTools)
3. Check Console tab for errors
4. Check Network tab for failed requests

### Step 5: Verify Environment Variables
Create `kitenge-frontend/.env`:
```env
VITE_API_URL=http://localhost:8080/api
```

**Restart frontend** after creating `.env` file!

---

## Still Not Working? 🆘

1. **Check all services are running:**
   - ✅ PostgreSQL
   - ✅ Backend (port 8080)
   - ✅ Frontend (port 3000)

2. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Clear cache and cookies
   - Hard refresh: Ctrl+F5

3. **Check firewall:**
   - Windows Firewall might block connections
   - Temporarily disable to test

4. **Check for port conflicts:**
   ```bash
   # Check what's using port 8080
   netstat -ano | findstr :8080
   ```

5. **Restart everything:**
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Restart PostgreSQL service
   - Start backend
   - Start frontend

---

## Common Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Failed to fetch` | Backend not running | Start backend |
| `CORS policy` | CORS not configured | Update WebConfig.java |
| `404 Not Found` | Wrong API URL | Check `.env` file |
| `Empty array []` | No active products | Check database `active` column |
| `Network Error` | Port mismatch | Update `.env` with correct port |
| `Connection refused` | Backend not accessible | Check backend is running |

---

## Need More Help? 💬

1. Check backend logs for detailed errors
2. Check browser console for frontend errors
3. Verify database has products with `active = true`
4. Test API endpoint directly in browser
5. Check Network tab in DevTools for request/response details
