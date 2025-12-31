# 🚀 Render Backend Deployment - Step by Step

Follow these steps to deploy your backend to Render (FREE hosting).

## ✅ Prerequisites
- ✅ Code is pushed to GitHub (we just did this!)
- ✅ You have a Render account (sign up at https://render.com - it's free!)

---

## Step 1: Create PostgreSQL Database (3 minutes)

1. Go to **https://dashboard.render.com**
2. Click **"New +"** button (top right)
3. Select **"PostgreSQL"**
4. Fill in the form:
   - **Name:** `kitenge-db`
   - **Database:** `kitenge`
   - **User:** `kitenge_user`
   - **Region:** Choose closest to you (e.g., "Oregon (US West)")
   - **PostgreSQL Version:** Latest (default)
   - **Plan:** Select **"Free"**
5. Click **"Create Database"**
6. ⏳ **Wait 1-2 minutes** for database to be ready
7. Once ready, click on the database name
8. **IMPORTANT:** Copy the **"Internal Database URL"** - you'll need this!
   - It looks like: `postgresql://kitenge_user:password@dpg-xxxxx-a/kitenge`
   - Also copy the **Username** and **Password** separately

---

## Step 2: Create Web Service (Backend) (10 minutes)

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. **Connect GitHub FIRST** (this is required before language can be selected):
   - Click **"Connect GitHub"** or **"Connect account"**
   - Authorize Render to access your repositories
   - Select your `kitengebora` repository
   - Click **"Connect"**
3. **After connecting GitHub, configure the service:**

   **Basic Settings:**
   - **Name:** `kitenge-backend`
   - **Region:** Same as database (e.g., "Oregon (US West)" or "Frankfurt")
   - **Branch:** `main`
   - **Root Directory:** `kitenge-backend` ⚠️ **IMPORTANT!** (This tells Render where your Java code is)
   - **Language/Runtime:** After setting Root Directory, Render should auto-detect **"Java"**. If not, select **"Java"** from the dropdown
   - **Build Command:** `mvn clean package -DskipTests` ⚠️ **Note:** Make sure it says `-DskipTests` (with an 's' at the end)
   - **Start Command:** `java -jar target/*.jar`
   
   ⚠️ **Important:** 
   - The language dropdown will be enabled AFTER you connect your GitHub repository
   - Make sure Root Directory is set to `kitenge-backend` (not `kitenge-backend/`)
   - The build command should be: `mvn clean package -DskipTests` (not `DskipTest`)

4. **Environment Variables:**
   Click **"Add Environment Variable"** and add these one by one:

   ```
   SPRING_DATASOURCE_URL = [Paste the Internal Database URL from Step 1]
   SPRING_DATASOURCE_USERNAME = kitenge_user
   SPRING_DATASOURCE_PASSWORD = [Paste the password from Step 1]
   SPRING_DATASOURCE_DRIVER_CLASS_NAME = org.postgresql.Driver
   SPRING_JPA_HIBERNATE_DDL_AUTO = update
   JWT_SECRET = [Generate a random string - go to https://randomkeygen.com/ and copy a random string]
   PORT = 8082
   SPRING_PROFILES_ACTIVE = production
   APP_CORS_ALLOWED_ORIGINS = https://your-netlify-site.netlify.app
   ```

   ⚠️ **Important Notes:**
   - Replace `https://your-netlify-site.netlify.app` with your actual Netlify URL
   - For JWT_SECRET, use a long random string (at least 32 characters)
   - You can find your Netlify URL in your Netlify dashboard

5. Click **"Create Web Service"**
6. ⏳ **Wait 5-10 minutes** for the build to complete
   - You'll see build logs in real-time
   - First build takes longer (downloading dependencies)

7. Once deployment is complete:
   - You'll see **"Live"** status
   - **Copy your Render URL** (e.g., `https://kitenge-backend.onrender.com`)
   - Save this URL! You'll need it for the next step

---

## Step 3: Update Netlify with Backend URL (2 minutes)

1. Go to **https://app.netlify.com**
2. Click on your site
3. Go to **Site settings** → **Environment variables**
4. Find `VITE_API_URL` (or add it if it doesn't exist)
5. Set the value to: `https://kitenge-backend.onrender.com/api`
   - Replace with your actual Render URL + `/api`
6. Click **"Save"**
7. Go to **Deploys** tab
8. Click **"Trigger deploy"** → **"Deploy site"**
9. ⏳ Wait 2-3 minutes for rebuild

---

## Step 4: Update CORS in Render (1 minute)

1. Go back to Render dashboard
2. Click on your `kitenge-backend` service
3. Go to **Environment** tab
4. Find `APP_CORS_ALLOWED_ORIGINS`
5. Make sure it's set to your Netlify URL (with https://)
6. Click **"Save Changes"**
7. Render will automatically restart the service

---

## ✅ Test Your Deployment

1. Open your Netlify site
2. Check browser console (F12) for any errors
3. Try to:
   - ✅ View products (images should load now!)
   - ✅ Register a new account
   - ✅ Login
   - ✅ Add products to cart

---

## 🐛 Troubleshooting

### Build Fails?
- Check build logs in Render dashboard
- Make sure Root Directory is `kitenge-backend` (not just `kitenge-backend/`)
- Verify Java version (should be 17+)

### Database Connection Error?
- Check that you used the **Internal Database URL** (not External)
- Verify username and password are correct
- Make sure database is in "Available" status

### Images Still Not Loading?
- Verify `VITE_API_URL` is set correctly in Netlify
- Check that backend URL is accessible (try opening it in browser)
- Make sure CORS is configured with your Netlify URL

### Backend Not Starting?
- Check Render logs for errors
- Verify PORT environment variable is set
- Check that JWT_SECRET is set

---

## 📝 Important Notes

1. **Free Tier Limitations:**
   - Render free tier **sleeps after 15 minutes** of inactivity
   - First request after sleep takes ~30 seconds to wake up
   - This is normal for free tier!

2. **Database:**
   - Data persists even when backend sleeps
   - Database is always available (doesn't sleep)

3. **Automatic Updates:**
   - When you push to GitHub, Render will automatically rebuild
   - No manual steps needed!

---

## 🎉 You're Done!

Your backend is now live on Render! Images should load correctly now.

**Your URLs:**
- Frontend: `https://your-site.netlify.app`
- Backend: `https://kitenge-backend.onrender.com`
- API: `https://kitenge-backend.onrender.com/api`
