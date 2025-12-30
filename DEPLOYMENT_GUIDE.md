# 🚀 Deployment Guide: Netlify + Render

This guide will help you deploy your Kitenge Bora website for free using **Netlify** (frontend) and **Render** (backend + database).

---

## 📋 Prerequisites

1. **GitHub Account** - You need to push your code to GitHub
2. **Netlify Account** - Sign up at https://www.netlify.com (free)
3. **Render Account** - Sign up at https://render.com (free)

---

## 🎯 Step 1: Push Code to GitHub

### 1.1 Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `kitengebora` (or any name you prefer)
3. **Don't** initialize with README, .gitignore, or license
4. Click **Create repository**

### 1.2 Push Your Code

Open your terminal/command prompt in the `kitengebora` folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Add your GitHub repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/kitengebora.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🎨 Step 2: Deploy Frontend to Netlify

### 2.1 Connect to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select your `kitengebora` repository

### 2.2 Configure Build Settings

Netlify should auto-detect these settings, but verify:

- **Base directory:** `kitenge-frontend`
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### 2.3 Set Environment Variable

**IMPORTANT:** Before deploying, you need to set the API URL.

1. Click **"Show advanced"** → **"New variable"**
2. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** Leave empty for now (we'll set it after backend is deployed)
3. Click **"Deploy site"**

### 2.4 Get Your Netlify URL

After deployment completes, you'll get a URL like:
- `https://kitengebora-test.netlify.app`

**Save this URL** - you'll need it for the backend configuration!

---

## ⚙️ Step 3: Deploy Backend to Render

### 3.1 Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `kitenge-db`
   - **Database:** `kitenge`
   - **User:** `kitenge_user`
   - **Plan:** **Free**
4. Click **"Create Database"**
5. **Wait for it to be ready** (takes 1-2 minutes)
6. Copy the **"Internal Database URL"** - you'll need it!

### 3.2 Create Web Service (Backend)

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub account if not already connected
3. Select your `kitengebora` repository
4. Configure the service:

   **Basic Settings:**
   - **Name:** `kitenge-backend`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `kitenge-backend`
   - **Runtime:** `Java`
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar target/*.jar`

   **Environment Variables:**
   Click **"Add Environment Variable"** and add:

   ```
   SPRING_DATASOURCE_URL = [Your PostgreSQL Internal Database URL from step 3.1]
   SPRING_DATASOURCE_USERNAME = [Database user from step 3.1]
   SPRING_DATASOURCE_PASSWORD = [Database password from step 3.1]
   SPRING_DATASOURCE_DRIVER_CLASS_NAME = org.postgresql.Driver
   SPRING_JPA_HIBERNATE_DDL_AUTO = update
   JWT_SECRET = [Generate a random string - use https://randomkeygen.com/]
   PORT = 8082
   APP_CORS_ALLOWED_ORIGINS = https://your-site.netlify.app
   ```

   **Important:** Replace `https://your-site.netlify.app` with your actual Netlify URL from Step 2.4!

5. Click **"Create Web Service"**
6. Wait for build to complete (5-10 minutes)

### 3.3 Get Your Backend URL

After deployment, Render will give you a URL like:
- `https://kitenge-backend.onrender.com`

**Save this URL!**

---

## 🔗 Step 4: Connect Frontend to Backend

### 4.1 Update Netlify Environment Variable

1. Go back to Netlify dashboard
2. Go to your site → **Site settings** → **Environment variables**
3. Find `VITE_API_URL` and click **Edit**
4. Set value to: `https://kitenge-backend.onrender.com/api`
   (Replace with your actual Render backend URL + `/api`)
5. Click **Save**

### 4.2 Trigger New Deployment

1. In Netlify, go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for rebuild to complete

---

## ✅ Step 5: Test Your Deployment

1. Open your Netlify URL in a browser
2. Try these:
   - ✅ View products
   - ✅ Register a new account
   - ✅ Login
   - ✅ Add products to cart
   - ✅ Place an order
   - ✅ View your account

---

## 🐛 Troubleshooting

### CORS Errors

If you see CORS errors in browser console:

1. Go to Render dashboard → Your backend service → **Environment**
2. Check `APP_CORS_ALLOWED_ORIGINS` includes your Netlify URL
3. Make sure it's exactly: `https://your-site.netlify.app` (no trailing slash)
4. Click **"Save Changes"** → Render will restart automatically

### Database Connection Errors

1. Check Render database is running (green status)
2. Verify `SPRING_DATASOURCE_URL` uses the **Internal Database URL** (not External)
3. Check username and password match your database

### Build Failures

**Frontend (Netlify):**
- Check Node version is 18+ in Netlify settings
- Verify `package.json` has all dependencies

**Backend (Render):**
- Check Java version (should be 17)
- Check Maven wrapper exists (`mvnw` file)
- Check build logs in Render dashboard

### Backend Not Starting

1. Check Render logs for errors
2. Verify `PORT` environment variable is set
3. Check `application.properties` uses `${PORT:8082}`

---

## 📝 Important Notes

1. **Free Tier Limitations:**
   - Render free tier **sleeps after 15 minutes** of inactivity
   - First request after sleep takes ~30 seconds to wake up
   - This is normal for free tier!

2. **Database:**
   - Render PostgreSQL free tier is perfect for testing
   - Data persists even when backend sleeps

3. **Environment Variables:**
   - Never commit `.env` files with real credentials
   - Always use environment variables in production

4. **Automatic Updates (FREE!):**
   - ✅ **Push to GitHub → Both Netlify and Render auto-deploy**
   - ✅ **Netlify rebuilds frontend automatically** (2-3 minutes)
   - ✅ **Render rebuilds backend automatically** (5-10 minutes)
   - ✅ **No manual steps needed!** Just commit and push.
   - 📖 **See `AUTOMATIC_DEPLOYMENTS.md` for detailed workflow**

---

## 🎉 You're Done!

Your website is now live! Share your Netlify URL with others to test.

**Next Steps:**
- Test on mobile devices (Android & iPhone)
- Create an admin account
- Add some products
- Test the full order flow

---

## 📞 Need Help?

If you encounter issues:
1. Check Render logs (backend)
2. Check Netlify build logs (frontend)
3. Check browser console for errors
4. Verify all environment variables are set correctly

