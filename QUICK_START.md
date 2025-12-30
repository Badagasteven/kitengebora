# ⚡ Quick Start Deployment Checklist

Follow these steps in order:

## ✅ Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] You have Netlify account
- [ ] You have Render account

---

## 🚀 Deployment Steps

### 1️⃣ Frontend (Netlify) - 5 minutes

1. Go to https://app.netlify.com
2. **Add new site** → **Import from Git** → **GitHub**
3. Select your repository
4. Settings:
   - Base directory: `kitenge-frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Add environment variable:**
   - Key: `VITE_API_URL`
   - Value: (leave empty for now)
6. Click **Deploy**
7. **Copy your Netlify URL** (e.g., `https://kitengebora-test.netlify.app`)

---

### 2️⃣ Backend Database (Render) - 3 minutes

1. Go to https://dashboard.render.com
2. **New +** → **PostgreSQL**
3. Name: `kitenge-db`
4. Plan: **Free**
5. Click **Create Database**
6. **Copy Internal Database URL** (you'll need this!)

---

### 3️⃣ Backend Service (Render) - 10 minutes

1. **New +** → **Web Service**
2. Connect GitHub → Select your repo
3. Settings:
   - Name: `kitenge-backend`
   - Root Directory: `kitenge-backend`
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -jar target/*.jar`
4. **Add Environment Variables:**
   ```
   SPRING_DATASOURCE_URL = [Internal Database URL from step 2]
   SPRING_DATASOURCE_USERNAME = [from database]
   SPRING_DATASOURCE_PASSWORD = [from database]
   SPRING_DATASOURCE_DRIVER_CLASS_NAME = org.postgresql.Driver
   SPRING_JPA_HIBERNATE_DDL_AUTO = update
   JWT_SECRET = [random string - use https://randomkeygen.com/]
   PORT = 8082
   APP_CORS_ALLOWED_ORIGINS = [Your Netlify URL from step 1]
   ```
5. Click **Create Web Service**
6. Wait for build (5-10 minutes)
7. **Copy your Render URL** (e.g., `https://kitenge-backend.onrender.com`)

---

### 4️⃣ Connect Frontend to Backend - 2 minutes

1. Go back to Netlify
2. **Site settings** → **Environment variables**
3. Edit `VITE_API_URL`
4. Set value: `https://kitenge-backend.onrender.com/api`
5. **Trigger deploy** → **Deploy site**

---

## 🎉 Done!

Open your Netlify URL and test!

---

## 📝 Important URLs to Save

- **Frontend:** `https://your-site.netlify.app`
- **Backend:** `https://your-backend.onrender.com`
- **Database:** (Internal URL from Render)

---

## ⚠️ Common Issues

**CORS Error?**
- Check `APP_CORS_ALLOWED_ORIGINS` in Render includes your Netlify URL

**Backend won't start?**
- Check Render logs
- Verify all environment variables are set

**Database connection failed?**
- Use **Internal Database URL** (not External)
- Check username/password match

---

For detailed instructions, see `DEPLOYMENT_GUIDE.md`

---

## 🔄 Automatic Deployments (FREE!)

**Both Netlify and Render support automatic deployments!**

After initial setup:
1. Make code changes locally
2. Push to GitHub: `git push origin main`
3. Wait 2-10 minutes
4. Changes are live automatically! 🎉

**No manual deployment needed!** See `AUTOMATIC_DEPLOYMENTS.md` for details.

