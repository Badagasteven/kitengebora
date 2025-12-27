@echo off
echo ========================================
echo Fixing Port 8082 and Cleaning Target
echo ========================================
echo.

echo [1/4] Stopping all Java processes...
taskkill /F /IM java.exe /T 2>nul
if %errorlevel% equ 0 (
    echo    Successfully stopped Java processes
) else (
    echo    No Java processes found (this is OK)
)
echo.

echo [2/4] Waiting for ports to release...
timeout /t 3 /nobreak >nul
echo.

echo [3/4] Checking port 8082...
netstat -ano | findstr :8082 >nul
if %errorlevel% equ 0 (
    echo    WARNING: Port 8082 is still in use!
    echo    Finding process using port 8082...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8082') do (
        echo    Killing process %%a...
        taskkill /F /PID %%a /T 2>nul
    )
    timeout /t 2 /nobreak >nul
) else (
    echo    Port 8082 is free
)
echo.

echo [4/4] Attempting to delete target directory...
if exist "target" (
    echo    Removing target directory...
    rmdir /s /q "target" 2>nul
    if exist "target" (
        echo    WARNING: Could not delete target directory
        echo    It may be locked by another process (IDE, antivirus, etc.)
        echo    Please close your IDE and try again, or delete it manually
    ) else (
        echo    Successfully deleted target directory
    )
) else (
    echo    Target directory does not exist (this is OK)
)
echo.

echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo You can now run:
echo   mvn clean install
echo   mvn spring-boot:run
echo.
pause

