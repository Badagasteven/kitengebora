console.log("🔥 Kitenge Bora server starting...");

// ======================================================================
// DEPENDENCIES
// ======================================================================
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const nodemailer = require("nodemailer");

// ======================================================================
// ENV
// ======================================================================
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@kitenge.com";

// ======================================================================
// DATABASE (LOCAL + RAILWAY)
// ======================================================================
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: "postgres",
        host: "localhost",
        database: "kitenge",
        password: "1930",
        port: 5432,
      }
);

// ======================================================================
// EMAIL (OPTIONAL – SAFE)
// ======================================================================
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log("✉️ Email service enabled");
} else {
  console.log("✉️ Email disabled (missing EMAIL_USER / EMAIL_PASS)");
}

// ======================================================================
// APP SETUP
// ======================================================================
const app = express();
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

// ======================================================================
// SESSION SETUP (POSTGRES)
// ======================================================================
const sessionStore = new pgSession({
  pool,
  tableName: "session",
  createTableIfMissing: true,
});

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// ======================================================================
// STATIC FILES
// ======================================================================
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static(uploadDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "store.html"));
});

// ======================================================================
// MULTER (IMAGE UPLOAD)
// ======================================================================
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, name + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ======================================================================
// AUTH HELPERS
// ======================================================================
const ensureAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

const ensureAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
};

// ======================================================================
// AUTH
// ======================================================================
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email & password required" });

  try {
    const exists = await pool.query(
      "SELECT id FROM users WHERE email=$1",
      [email]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id,email",
      [email, hash]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const r = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = r.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    req.session.regenerate(() => {
      req.session.user = { id: user.id, email: user.email };
      res.json({ success: true, user: req.session.user });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

app.get("/api/check-auth", (req, res) => {
  if (req.session.user) {
    return res.json({
      isAuthenticated: true,
      isAdmin: req.session.user.email === ADMIN_EMAIL,
      user: req.session.user,
    });
  }
  res.json({ isAuthenticated: false, isAdmin: false });
});

// ======================================================================
// WISHLIST
// ======================================================================
app.get("/api/wishlist", ensureAuth, async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT product_id FROM wishlist WHERE user_id=$1",
      [req.session.user.id]
    );
    res.json(r.rows.map((x) => x.product_id));
  } catch (err) {
    if (err.code === "42P01") return res.json([]);
    res.status(500).json({ error: "Wishlist error" });
  }
});

app.post("/api/wishlist", ensureAuth, async (req, res) => {
  const { product_id, action } = req.body;
  try {
    if (action === "add") {
      await pool.query(
        "INSERT INTO wishlist (user_id, product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [req.session.user.id, product_id]
      );
    } else {
      await pool.query(
        "DELETE FROM wishlist WHERE user_id=$1 AND product_id=$2",
        [req.session.user.id, product_id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    if (err.code === "42P01") return res.json({ success: true });
    res.status(500).json({ error: "Wishlist error" });
  }
});

// ======================================================================
// IMAGE UPLOAD
// ======================================================================
app.post(
  "/api/upload-image",
  ensureAdmin,
  upload.single("image"),
  (req, res) => {
    if (!req.file)
      return res.status(400).json({ error: "No image uploaded" });
    res.json({ url: "/uploads/" + req.file.filename });
  }
);

// ======================================================================
// PRODUCTS
// ======================================================================
app.get("/api/products", ensureAdmin, async (req, res) => {
  const r = await pool.query(
    "SELECT * FROM products ORDER BY in_stock DESC, active DESC, id DESC"
  );
  res.json(r.rows);
});

app.get("/api/public-products", async (req, res) => {
  const r = await pool.query(
    "SELECT * FROM products WHERE active=true ORDER BY id DESC"
  );
  res.json(r.rows);
});

// ======================================================================
// ORDERS (EMAIL SAFE)
// ======================================================================
app.post("/api/orders", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      customer_name,
      customer_phone,
      channel,
      subtotal,
      items,
      deliveryOption,
      deliveryFee,
    } = req.body;

    const orderRes = await client.query(
      `INSERT INTO orders
       (customer_name, customer_phone, channel, subtotal,
        delivery_option, delivery_fee, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *`,
      [
        customer_name,
        customer_phone,
        channel || "store",
        subtotal,
        deliveryOption,
        deliveryFee,
      ]
    );

    const order = orderRes.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items
         (order_id, product_id, quantity, unit_price)
         VALUES ($1,$2,$3,$4)`,
        [order.id, item.product_id, item.quantity, item.unit_price]
      );
    }

    await client.query("COMMIT");

    if (transporter) {
      transporter.sendMail({
        from: `"Kitenge Bora" <${ADMIN_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject: `🧵 New Order #${order.id}`,
        text: `New order received`,
      });
    }

    res.json(order);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Order failed" });
  } finally {
    client.release();
  }
});

// ======================================================================
// START
// ======================================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
