# Email Configuration Guide

## Setting Up Email for Password Reset and Notifications

To enable email functionality (password reset, order notifications, etc.), you need to configure email credentials.

### Quick Setup (Recommended):

**Option 1: Edit application.properties directly**

1. Open `kitenge-backend/src/main/resources/application.properties`
2. Find the email configuration section
3. Set your email and password:
   ```properties
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password
   ```

**Option 2: Use Environment Variables**

Set these before running the application:

**Windows (PowerShell):**
```powershell
$env:EMAIL_USER="your-email@gmail.com"
$env:EMAIL_PASS="your-16-char-app-password"
```

**Windows (Command Prompt):**
```cmd
set EMAIL_USER=your-email@gmail.com
set EMAIL_PASS=your-16-char-app-password
```

### For Gmail (Required Steps):

1. **Enable 2-Step Verification** on your Google account
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Kitenge Bora" as the name
   - Copy the generated 16-character password
   - **Important**: Use this App Password, NOT your regular Gmail password

3. **Update application.properties**:
   ```properties
   spring.mail.username=your-email@gmail.com
   spring.mail.password=xxxx xxxx xxxx xxxx  # Your 16-char app password
   ```

4. **Restart the Spring Boot application**

### Testing Email

After configuration, test your email setup:

**Using the test endpoint:**
```bash
curl -X POST http://localhost:8082/api/test/email -H "Content-Type: application/json" -d "{\"email\":\"your-email@gmail.com\"}"
```

Or use Postman/Thunder Client to POST to `http://localhost:8082/api/test/email` with:
```json
{
  "email": "your-email@gmail.com"
}
```

### Troubleshooting

1. **Email not sending**: 
   - Check that `spring.mail.username` and `spring.mail.password` are set in `application.properties`
   - For Gmail, make sure you're using an App Password, not your regular password
   - Restart the application after changing properties

2. **Authentication failed**: 
   - Verify 2-Step Verification is enabled on your Google account
   - Generate a new App Password if needed
   - Make sure there are no spaces in the App Password when copying

3. **Connection timeout**: 
   - Check your firewall/network settings
   - Verify port 587 is not blocked

4. **Check logs**: 
   - Look for "Password reset email sent successfully" in console
   - If you see errors, they will show what's wrong

