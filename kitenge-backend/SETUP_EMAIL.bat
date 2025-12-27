@echo off
echo ========================================
echo Email Configuration Setup for Kitenge Bora
echo ========================================
echo.
echo This script will help you set up email for password reset and notifications.
echo.
echo For Gmail:
echo 1. Enable 2-Step Verification on your Google account
echo 2. Generate an App Password at: https://myaccount.google.com/apppasswords
echo 3. Select "Mail" and "Other (Custom name)" - enter "Kitenge Bora"
echo 4. Copy the 16-character password
echo.
echo ========================================
echo.

set /p EMAIL_USER="Enter your email address (e.g., your-email@gmail.com): "
set /p EMAIL_PASS="Enter your App Password (16 characters for Gmail): "

echo.
echo Setting environment variables...
setx EMAIL_USER "%EMAIL_USER%"
setx EMAIL_PASS "%EMAIL_PASS%"

echo.
echo ========================================
echo Email configuration saved!
echo ========================================
echo.
echo IMPORTANT: You need to restart your Spring Boot application for the changes to take effect.
echo.
echo To test email:
echo 1. Restart the backend server
echo 2. Try requesting a password reset
echo 3. Check the console logs for email status
echo.
pause

