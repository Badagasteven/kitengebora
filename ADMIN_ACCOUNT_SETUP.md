# 👤 Admin Account Setup

## ✅ Admin Account Created

An admin account has been automatically created with:
- **Email:** `badagaclass@gmail.com`
- **Password:** `1234`

## 🔧 How It Works

The system uses a `DataInitializer` component that:
1. Runs automatically when the Spring Boot application starts
2. Checks if the admin email exists in the database
3. Creates the admin account if it doesn't exist
4. Updates the password if the account already exists

## 🔐 Admin Status

Admin status is determined by matching the email with `app.admin.email` in `application.properties`:
```properties
app.admin.email=badagaclass@gmail.com
```

When you login with `badagaclass@gmail.com`, the system automatically:
- Sets `isAdmin: true` in the JWT token
- Grants access to admin-only endpoints
- Shows admin dashboard in the frontend

## 🚀 Login Instructions

1. Go to the login page
2. Enter:
   - **Email:** `badagaclass@gmail.com`
   - **Password:** `1234`
3. Click "Login"
4. You'll be redirected to the admin dashboard

## 📝 Changing Admin Email

To change the admin email, edit:
`kitenge-backend/src/main/resources/application.properties`

```properties
app.admin.email=your-new-email@gmail.com
```

Then restart the backend. The DataInitializer will create/update the account.

## 🔄 Resetting Admin Password

The admin password is automatically set to `1234` every time the backend starts.

To change it permanently, edit:
`kitenge-backend/src/main/java/com/kitenge/config/DataInitializer.java`

Line 25: Change `passwordEncoder.encode("1234")` to your desired password.

## ✅ Status

- ✅ Admin account auto-created on startup
- ✅ Admin email configured: `badagaclass@gmail.com`
- ✅ Admin password: `1234`
- ✅ Admin access working

**You can now login as admin!** 🎉

