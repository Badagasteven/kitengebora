# Image Loading Fix Guide

## The Problem
Images aren't showing because the frontend is trying to load them from `localhost:8080`, which doesn't work when viewing on Netlify.

## Solutions

### Option 1: View Locally (For Testing)
1. Make sure backend is running:
   ```bash
   cd kitenge-backend
   mvn spring-boot:run
   ```
2. Make sure frontend is running:
   ```bash
   cd kitenge-frontend
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser

### Option 2: Deploy Backend to Render (For Production)
1. Deploy backend to Render (see BACKEND_DEPLOYMENT.md)
2. Get your Render backend URL (e.g., `https://kitenge-backend.onrender.com`)
3. In Netlify dashboard:
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://kitenge-backend.onrender.com/api`
   - Redeploy your site

## Quick Check
- Are you viewing on Netlify? → You need to deploy backend and set VITE_API_URL
- Are you viewing locally? → Make sure backend is running on port 8080
