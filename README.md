<<<<<<< HEAD
# 🎉 Kitenge Bora - Full Stack E-Commerce Application

Modern React frontend + Spring Boot backend for a beautiful e-commerce experience.

## 🚀 Quick Start

### 1. Fix PowerShell (One Time)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Install Frontend Dependencies
```bash
cd kitenge-frontend
npm install
```

### 3. Start Backend
```bash
cd kitenge-backend
mvn spring-boot:run
```

### 4. Start Frontend
```bash
cd kitenge-frontend
npm run dev
```

### 5. Open Browser
http://localhost:3000

---

## 📁 Project Structure

```
bora - demo/
├── kitenge-backend/      # Spring Boot Backend (Port 8080)
│   ├── src/main/java/   # Java source code
│   └── README.md         # Backend documentation
│
└── kitenge-frontend/     # React Frontend (Port 3000)
    ├── src/              # React source code
    └── README.md         # Frontend documentation
=======

# Kitenge Bora Demo (Node + PostgreSQL)

This zip contains a **very simple store + admin panel** that share the same PostgreSQL database.

## Contents

- `server.js` – Node + Express API and static file server
- `public/admin.html` – Admin panel (add / edit / delete products)
- `public/store.html` – Simple store UI that lists products from the DB
- `setup_kitenge.sql` – SQL script to create the `kitenge` database and `products` table

---

## 1. Requirements

- Node.js (LTS) installed
- PostgreSQL installed and running

---

## 2. Database setup

1. Open a terminal / CMD.
2. Enter the PostgreSQL shell:

   ```bash
   psql -U postgres
   ```

   (Use your own username if different.)

3. Run the SQL script:

   ```sql
   \i /path/to/setup_kitenge.sql
   ```

   Or copy–paste the content of `setup_kitenge.sql` into `psql`.

This will:

- create the database `kitenge`
- connect to it
- create the `products` table
- insert a couple of demo rows

---

## 3. Configure the connection string

Open `server.js` and update:

```js
"postgres://your_user:your_password@localhost:5432/kitenge"
```

Replace:

- `your_user` with your PostgreSQL user
- `your_password` with your PostgreSQL password

Example:

```js
"postgres://postgres:admin123@localhost:5432/kitenge"
```

If you already set `DATABASE_URL` as an environment variable, you can leave this as-is.

---

## 4. Install dependencies

In the folder where `server.js` is:

```bash
npm init -y
npm install express cors pg
```

---

## 5. Run the server

```bash
node server.js
```

You should see:

```bash
Server running at http://localhost:4000
>>>>>>> d50abbfe4ab69a2adbf7f2f50f9b43b04acc90e9
```

---

<<<<<<< HEAD
## ✨ Features

### Customer Features
- Browse products with search & filters
- Shopping cart
- Wishlist
- User authentication
- Order history
- WhatsApp checkout

### Admin Features
- Dashboard with metrics
- Product management (CRUD)
- Image uploads
- Order management

---

## 📚 Documentation

- **`START_HERE.md`** - Quick start guide
- **`SETUP_INSTRUCTIONS.md`** - Detailed setup
- **`PROJECT_STATUS.md`** - Current status
- **`README_COMPLETE.md`** - Complete overview
- **`CLEANUP_SUMMARY.md`** - What was cleaned up

---

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Spring Boot
- PostgreSQL
- JWT Authentication
- Spring Security

---

## ✅ Status

- ✅ Backend: Complete
- ✅ Frontend: Complete
- ✅ Database: Configured
- ✅ Authentication: JWT
- ✅ All Features: Working

**Ready to run!** 🚀

=======
## 6. Use in the browser

- Store: open  
  **http://localhost:4000/**  
  (shows the simple store UI, products loaded from PostgreSQL)

- Admin: open  
  **http://localhost:4000/admin.html**

  For demo:

  - Enter any **valid email** (e.g. `client@example.com`)
  - Click **Login**
  - You can now:
    - Add products
    - Edit products
    - Delete products

All changes are stored in the `kitenge.products` table and will be visible both in the admin panel and in the store.

---

## 7. Connecting your existing design

If you already have another HTML file (your original design), you can:

- Place it inside `public/` (for example as `store-custom.html`)
- Or replace `public/store.html` content with your own layout
- As long as your custom JS fetches from `/api/products`, it will show live data from PostgreSQL.

Basic example:

```js
fetch("/api/products")
  .then(res => res.json())
  .then(products => {
    // render them into your UI
  });
```

That's it. 🚀
>>>>>>> d50abbfe4ab69a2adbf7f2f50f9b43b04acc90e9
