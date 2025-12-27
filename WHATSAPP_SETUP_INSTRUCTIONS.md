# 📱 WhatsApp Notification Setup - Quick Guide

## Current Status
✅ WhatsApp notification code is implemented and ready
⚠️ **You need to configure the API key to enable automatic sending**

## Quick Setup (2 minutes) - CallMeBot (FREE)

### Step 1: Register Your Phone
1. Go to: https://www.callmebot.com/whatsapp-api.php
2. Click "Get Started" or "Register"
3. Enter your WhatsApp number: **250788883986** (or your admin number)
4. Follow the instructions to verify your phone
5. You'll receive an API key

### Step 2: Add API Key to Backend

**Option A: Add to application.properties** (Recommended)
1. Open: `kitenge-backend/src/main/resources/application.properties`
2. Find the line: `app.whatsapp.callmebot.apikey=`
3. Add your API key: `app.whatsapp.callmebot.apikey=YOUR_API_KEY_HERE`
4. Save the file
5. Restart the backend server

**Option B: Use Environment Variable**
```bash
export CALLMEBOT_API_KEY=YOUR_API_KEY_HERE
```
Then restart the backend server.

### Step 3: Test It
1. Place a test order from the frontend
2. Check your WhatsApp - you should receive the notification automatically!
3. Check the backend console - you should see: "✅ WhatsApp message sent successfully via CallMeBot API"

## What Happens Now?

### Without API Key (Current State):
- ✅ Order is saved to database
- ✅ WhatsApp URL is generated and logged in console
- ⚠️ You need to manually click the URL to open WhatsApp
- 📋 Check backend console logs for the WhatsApp URL

### With API Key (After Setup):
- ✅ Order is saved to database  
- ✅ WhatsApp message is **automatically sent** to your phone
- ✅ You receive notification instantly on WhatsApp
- ✅ No manual clicking needed!

## Troubleshooting

### Not receiving messages?
1. Check backend console logs for errors
2. Verify API key is correct in `application.properties`
3. Make sure backend server was restarted after adding API key
4. Check CallMeBot website to verify your phone is registered

### Still seeing URL in console instead of "sent successfully"?
- The API key might not be configured correctly
- Check the console for error messages
- Verify the API key format is correct (no extra spaces)

## Alternative Solutions

If CallMeBot doesn't work for you, you can integrate:
- **Twilio WhatsApp API** (paid, more reliable)
- **WhatsApp Business API** (requires Meta Business account)
- **Green API** (free tier available)

## Need Help?
Check the backend console logs when placing an order. The system will show:
- ✅ Success message if API is configured
- 📱 WhatsApp URL if API is not configured
- ⚠️ Error messages if something goes wrong

