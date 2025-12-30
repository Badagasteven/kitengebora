# 🔄 Automatic Deployments Guide

## ✅ **YES! Both Netlify and Render Support Automatic Deployments (FREE)**

When you push code to GitHub, both services will **automatically rebuild and deploy** your changes. **This is completely free!**

---

## 🚀 How It Works

### **The Workflow:**

```
1. You make changes to your code locally
   ↓
2. You commit and push to GitHub
   git add .
   git commit -m "Your changes"
   git push origin main
   ↓
3. GitHub receives your push
   ↓
4. Netlify automatically detects the push
   → Rebuilds your frontend
   → Deploys new version (takes 2-3 minutes)
   ↓
5. Render automatically detects the push
   → Rebuilds your backend
   → Deploys new version (takes 5-10 minutes)
   ↓
6. Your live website is updated! 🎉
```

---

## 📋 Setup Instructions

### **Step 1: Connect GitHub to Netlify (Frontend)**

When you first deploy to Netlify:

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select your `kitengebora` repository
6. Configure:
   - **Base directory:** `kitenge-frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
7. Click **"Deploy site"**

**✅ That's it!** Now every time you push to GitHub, Netlify will automatically rebuild and deploy.

---

### **Step 2: Connect GitHub to Render (Backend)**

When you first deploy to Render:

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect GitHub"** (if not already connected)
4. Authorize Render to access your GitHub account
5. Select your `kitengebora` repository
6. Configure:
   - **Name:** `kitenge-backend`
   - **Root Directory:** `kitenge-backend`
   - **Branch:** `main`
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar target/*.jar`
7. Click **"Create Web Service"**

**✅ That's it!** Now every time you push to GitHub, Render will automatically rebuild and deploy.

---

## 🔍 How to Verify Automatic Deployments Are Working

### **Netlify:**

1. Go to your Netlify dashboard
2. Click on your site
3. Go to **"Deploys"** tab
4. You'll see a list of all deployments
5. Each push to GitHub will create a new deployment automatically

### **Render:**

1. Go to your Render dashboard
2. Click on your backend service
3. Go to **"Events"** or **"Logs"** tab
4. You'll see deployment events
5. Each push to GitHub will trigger a new build automatically

---

## 📝 Daily Workflow Example

### **Making Changes and Deploying:**

```bash
# 1. Make your code changes locally
# (Edit files in your code editor)

# 2. Test locally (optional but recommended)
cd kitenge-frontend
npm run dev
# Test your changes in browser

# 3. Commit your changes
cd ..  # Go back to root
git add .
git commit -m "Added new feature / Fixed bug / Updated styling"

# 4. Push to GitHub
git push origin main

# 5. Wait for automatic deployment:
#    - Netlify: 2-3 minutes
#    - Render: 5-10 minutes

# 6. Check your live site - changes are live! 🎉
```

---

## ⚙️ Advanced: Deployment Settings

### **Netlify Auto-Deploy Settings:**

1. Go to **Site settings** → **Build & deploy**
2. Under **"Continuous Deployment"**, you'll see:
   - ✅ **Auto-deploy:** Enabled (default)
   - **Branch:** `main` (or your default branch)
3. You can also set:
   - **Deploy hooks** (for manual triggers)
   - **Build notifications** (email/Slack)

### **Render Auto-Deploy Settings:**

1. Go to your service → **Settings**
2. Under **"Auto-Deploy"**, you'll see:
   - ✅ **Auto-Deploy:** Enabled (default)
   - **Branch:** `main`
3. You can also:
   - **Manual deploy** specific commits
   - **Rollback** to previous versions

---

## 🎯 What Gets Deployed Automatically?

### **Frontend (Netlify):**
- ✅ All code changes in `kitenge-frontend/`
- ✅ New components, pages, styles
- ✅ Updated images in `public/` folder
- ✅ Configuration changes (`netlify.toml`, `package.json`)

### **Backend (Render):**
- ✅ All code changes in `kitenge-backend/`
- ✅ New API endpoints, controllers, services
- ✅ Database schema changes (via JPA)
- ✅ Configuration changes (`application.properties`, `pom.xml`)

---

## ⚠️ Important Notes

### **Environment Variables:**
- Environment variables set in Netlify/Render dashboards **persist** across deployments
- You don't need to re-enter them after each push
- Only update them if you need to change values

### **Database:**
- Database data **persists** across deployments
- Schema changes are handled automatically by JPA (`spring.jpa.hibernate.ddl-auto=update`)
- No data loss when you deploy new code

### **Build Time:**
- **Netlify:** Usually 2-3 minutes
- **Render:** Usually 5-10 minutes (Java builds take longer)
- First deployment takes longer (downloading dependencies)

---

## 🐛 Troubleshooting

### **Deployment Not Triggering?**

1. **Check GitHub connection:**
   - Netlify: Site settings → Build & deploy → Continuous Deployment
   - Render: Service settings → Auto-Deploy

2. **Verify you pushed to the correct branch:**
   - Default is `main` branch
   - Check: `git branch` to see current branch

3. **Check deployment logs:**
   - Netlify: Deploys tab → Click on failed deployment
   - Render: Logs tab → Check for errors

### **Build Failing?**

1. **Check build logs** for error messages
2. **Test locally first:**
   ```bash
   # Frontend
   cd kitenge-frontend
   npm run build
   
   # Backend
   cd kitenge-backend
   mvn clean package -DskipTests
   ```

3. **Common issues:**
   - Missing dependencies → Check `package.json` or `pom.xml`
   - Syntax errors → Check build logs
   - Environment variables missing → Check dashboard settings

---

## 🎉 Benefits of Automatic Deployments

✅ **No manual steps** - Just push to GitHub  
✅ **Always up-to-date** - Live site matches your code  
✅ **Version history** - Can rollback to previous versions  
✅ **Free** - No additional cost  
✅ **Fast** - Deployments happen automatically  
✅ **Reliable** - Both services are battle-tested  

---

## 📞 Summary

**Both Netlify and Render support automatic deployments from GitHub - completely FREE!**

**Your workflow:**
1. Make changes locally
2. Push to GitHub
3. Wait 2-10 minutes
4. Changes are live! 🚀

**No manual deployment steps needed!**

