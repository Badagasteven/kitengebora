# 🛒 Cart & Orders Guide

## ✅ What's Working

### Cart Functionality
- ✅ **Add to Cart** - Click "Add to cart" on any product
- ✅ **View Cart** - Cart icon in header shows item count
- ✅ **Update Quantities** - Increase/decrease items in cart
- ✅ **Remove Items** - Delete items from cart
- ✅ **Cart Persistence** - Cart saved in browser localStorage

### Order Functionality
- ✅ **Checkout** - Click "Checkout via WhatsApp" in cart
- ✅ **Order Saved** - Orders are saved to database
- ✅ **WhatsApp Integration** - Opens WhatsApp with order details
- ✅ **Admin Notification** - Order logged in backend console

## 🚀 How to Use

### 1. Add Products to Cart
1. Browse products on the home page
2. Click **"Add to cart"** on any product
3. Cart drawer opens automatically
4. Cart icon in header shows item count

### 2. Manage Cart
- **Increase quantity:** Click `+` button
- **Decrease quantity:** Click `-` button
- **Remove item:** Click trash icon
- **Clear cart:** Click "Clear" button

### 3. Place Order
1. Open cart drawer (click cart icon)
2. Select delivery option:
   - **Pick up** (0 RWF)
   - **Kigali** (2,000 RWF)
   - **Upcountry** (3,500 RWF)
3. Enter your name (optional)
4. Enter your WhatsApp number (required)
5. Click **"Checkout via WhatsApp"**
6. Order is saved to database
7. WhatsApp opens with order details
8. Send the message to admin

## 📱 WhatsApp Integration

### For Customers
When you checkout:
- Order is saved to database
- WhatsApp opens with formatted order message
- Send the message to admin's WhatsApp
- Admin receives notification

### For Admin
Orders are:
- Saved to database (viewable in admin dashboard)
- Logged in backend console with WhatsApp URL
- Can be viewed at `/api/orders` endpoint

## ⚙️ Configuration

### Admin WhatsApp Number
Edit `kitenge-backend/src/main/resources/application.properties`:

```properties
# Admin WhatsApp Number (format: country code + number)
app.admin.whatsapp=250788883986
```

Or set environment variable:
```bash
ADMIN_WHATSAPP=250788883986
```

## 🎯 Order Flow

```
Customer adds items to cart
    ↓
Customer clicks "Checkout via WhatsApp"
    ↓
Order saved to database (POST /api/orders)
    ↓
WhatsApp URL generated with order details
    ↓
WhatsApp opens in new tab
    ↓
Customer sends message to admin
    ↓
Admin receives order notification
```

## 📊 Order Details Saved

Each order includes:
- Customer name (optional)
- Customer phone (required)
- Order items (product ID, quantity, price)
- Subtotal
- Delivery option
- Delivery fee
- Total amount
- Order timestamp

## 🔍 Viewing Orders

### Admin Dashboard
- Login as admin
- Go to Admin → Orders
- View all orders with details

### API Endpoint
```bash
GET http://localhost:8080/api/orders
```

Requires admin authentication.

## ✅ Testing

1. **Add to Cart:**
   - Click "Add to cart" on a product
   - Verify cart icon shows count
   - Open cart drawer

2. **Place Order:**
   - Add items to cart
   - Enter phone number
   - Click "Checkout via WhatsApp"
   - Verify order saved (check backend logs)
   - Verify WhatsApp opens

3. **View Orders:**
   - Login as admin
   - Check admin dashboard
   - Verify order appears

## 🐛 Troubleshooting

### Cart not opening?
- Check browser console for errors
- Verify CartContext is provided in App.jsx

### Order not saving?
- Check backend is running
- Check database connection
- Verify API endpoint is accessible
- Check browser console for errors

### WhatsApp not opening?
- Check phone number format
- Verify browser allows popups
- Try manually: `https://wa.me/250788883986`

## 🎉 Everything is Ready!

Your cart and order system is fully functional:
- ✅ Add to cart works
- ✅ Orders are saved to database
- ✅ WhatsApp integration works
- ✅ Admin notifications work

**Start adding products to cart and placing orders!** 🚀

