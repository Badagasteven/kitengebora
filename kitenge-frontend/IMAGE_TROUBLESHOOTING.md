# 🖼️ Image Loading Troubleshooting

## Quick Fixes

### 1. Check Image URLs in Browser Console

Open browser DevTools (F12) and check Console tab. You should see:
```
🖼️ Image URL: http://localhost:8080/uploads/image.jpg from path: /uploads/image.jpg
```

If you see errors like:
```
❌ Image failed to load: ...
```

### 2. Test Image URL Directly

1. Check what image path is stored in database:
   - Should be like: `/uploads/filename.jpg` or `uploads/filename.jpg`

2. Test the full URL in browser:
   - If path is `/uploads/image.jpg`
   - Try: `http://localhost:8080/uploads/image.jpg`
   - (Or `http://localhost:8082/uploads/image.jpg` if backend uses port 8082)

3. **If image loads in browser** → Frontend URL construction issue
4. **If image doesn't load** → Backend not serving images or file doesn't exist

### 3. Check Backend Image Serving

Backend serves images from `/uploads/**` endpoint.

**Verify:**
1. Backend is running
2. Images exist in `kitenge-backend/uploads/` folder
3. Test: `http://localhost:8080/uploads/your-image.jpg`

### 4. Check Image Path Format

**In database, image path should be:**
- ✅ `/uploads/filename.jpg` (absolute path - preferred)
- ✅ `uploads/filename.jpg` (relative path - will be converted)
- ❌ `filename.jpg` (missing uploads folder - will be fixed automatically)

### 5. Common Issues

#### Issue: Images show as blank/white
**Cause:** Image URL is wrong or backend not serving images
**Fix:**
1. Check browser console for image URLs
2. Test URL directly in browser
3. Verify backend is running
4. Check `uploads` folder exists in backend

#### Issue: CORS errors for images
**Cause:** Backend CORS not allowing image requests
**Fix:** Already configured in `WebConfig.java` - images are public

#### Issue: 404 Not Found for images
**Cause:** Image file doesn't exist or wrong path
**Fix:**
1. Check if file exists in `kitenge-backend/uploads/`
2. Verify image path in database matches actual filename
3. Check file permissions

#### Issue: Images load slowly
**Cause:** Large file sizes or network issues
**Fix:**
- Images are lazy-loaded (load when visible)
- Check image file sizes (should be < 1MB each)

---

## Debugging Steps

### Step 1: Check Product Data
Open browser console and check what image paths products have:
```javascript
// In browser console
fetch('http://localhost:8080/api/public-products')
  .then(r => r.json())
  .then(data => console.log('Products:', data.map(p => ({name: p.name, image: p.image}))))
```

### Step 2: Test Image URL Construction
The frontend converts paths like:
- `/uploads/image.jpg` → `http://localhost:8080/uploads/image.jpg`
- `uploads/image.jpg` → `http://localhost:8080/uploads/image.jpg`
- `image.jpg` → `http://localhost:8080/uploads/image.jpg`

### Step 3: Verify Backend Serves Images
1. Check `WebConfig.java` - should have:
   ```java
   registry.addResourceHandler("/uploads/**")
   ```

2. Check `SecurityConfig.java` - should allow:
   ```java
   .requestMatchers("/uploads/**").permitAll()
   ```

### Step 4: Check Network Tab
1. Open DevTools → Network tab
2. Filter by "Img"
3. Look for failed image requests
4. Click on failed request to see:
   - Status code (404 = not found, CORS = blocked)
   - Request URL (check if correct)
   - Response (error message)

---

## Still Not Working?

1. **Check backend logs** for image serving errors
2. **Verify uploads folder exists** in backend directory
3. **Test with a known image** - upload a new product image via admin panel
4. **Check file permissions** - backend needs read access to uploads folder
5. **Clear browser cache** - Ctrl+Shift+Delete

---

## Example: Correct Setup

**Backend:**
- Images stored in: `kitenge-backend/uploads/product-123.jpg`
- Served at: `http://localhost:8080/uploads/product-123.jpg`

**Database:**
- Product image field: `/uploads/product-123.jpg`

**Frontend:**
- Converts to: `http://localhost:8080/uploads/product-123.jpg`
- Displays in: `<img src="http://localhost:8080/uploads/product-123.jpg">`
