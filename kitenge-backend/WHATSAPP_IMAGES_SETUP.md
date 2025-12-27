# 📸 WhatsApp Image Sending Setup

This guide explains how to configure WhatsApp API services to send actual product images (not just URLs) with order notifications.

## ✅ What's Implemented

The system now supports sending **actual product images** via WhatsApp when orders are placed. It automatically:
1. Collects product images from the order
2. Sends the order message with images via configured API
3. Falls back to URL-based messages if no API is configured

## 🔧 Supported Services

### Option 1: Green API (Recommended)
**Free tier available** - Supports images, videos, and files

1. **Sign up**: Go to https://green-api.com/
2. **Create instance**: Create a new WhatsApp instance
3. **Get credentials**:
   - Instance ID (e.g., `1234567890`)
   - API Token (e.g., `abc123def456...`)

4. **Configure in `application.properties`**:
```properties
app.whatsapp.greenapi.idinstance=YOUR_INSTANCE_ID
app.whatsapp.greenapi.apitoken=YOUR_API_TOKEN
```

**Or use environment variables**:
```bash
export GREEN_API_ID_INSTANCE=YOUR_INSTANCE_ID
export GREEN_API_TOKEN=YOUR_API_TOKEN
```

### Option 2: ChatAPI
**Free tier available** - Easy setup

1. **Sign up**: Go to https://www.chat-api.com/
2. **Create instance**: Get your instance ID and token
3. **Configure in `application.properties`**:
```properties
app.whatsapp.chatapi.instance=YOUR_INSTANCE_ID
app.whatsapp.chatapi.token=YOUR_API_TOKEN
```

**Or use environment variables**:
```bash
export CHATAPI_INSTANCE=YOUR_INSTANCE_ID
export CHATAPI_TOKEN=YOUR_API_TOKEN
```

## 📝 Configuration

### Base URL for Images
Make sure your images are accessible via HTTP/HTTPS. Update the base URL if needed:

```properties
app.base.url=http://localhost:8082
```

For production, use your actual domain:
```properties
app.base.url=https://yourdomain.com
```

### Complete Configuration Example

```properties
# Admin WhatsApp Number
app.admin.whatsapp=250788883986

# Green API (Option 1)
app.whatsapp.greenapi.idinstance=1234567890
app.whatsapp.greenapi.apitoken=abc123def456...

# OR ChatAPI (Option 2)
app.whatsapp.chatapi.instance=1234567890
app.whatsapp.chatapi.token=abc123def456...

# Base URL for images
app.base.url=http://localhost:8082
```

## 🚀 How It Works

1. **Order is placed** → System collects product images
2. **API Check** → Tries Green API first, then ChatAPI
3. **Send Message** → Sends text message with order details
4. **Send Images** → Sends each product image separately
5. **Fallback** → If no API configured, generates WhatsApp URL (clickable link)

## 📱 Message Format

The message sent will be:
```
🧵 *NEW ORDER #123*

👤 Customer Name
📱 250788123456

• *Product Name 1*
  2×25000 = 50000 RWF

• *Product Name 2*
  1×30000 = 30000 RWF

💵 *Total: 80000 RWF*
```

Followed by product images sent as separate media messages.

## ⚠️ Important Notes

1. **Image URLs must be publicly accessible** - The API services need to download images from URLs
2. **HTTPS recommended** - Some services require HTTPS URLs
3. **Image size limits** - Most services limit images to 5-10MB
4. **Rate limits** - Free tiers may have rate limits on messages/images

## 🔍 Testing

After configuring, test by placing an order:
1. Add products to cart
2. Checkout via WhatsApp
3. Check your WhatsApp for:
   - Text message with order details
   - Product images (if API configured)
   - Or clickable URL (if no API configured)

## 🐛 Troubleshooting

### Images not sending?
- Check API credentials are correct
- Verify images are accessible via HTTP/HTTPS
- Check API service status/dashboard
- Review backend logs for error messages

### Fallback to URL?
- If no API is configured, system automatically uses URL-based messages
- URLs are clickable and work in WhatsApp
- Admin can click URLs to view images in browser

## 📚 Additional Resources

- **Green API Docs**: https://green-api.com/docs/
- **ChatAPI Docs**: https://www.chat-api.com/docs/
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp

