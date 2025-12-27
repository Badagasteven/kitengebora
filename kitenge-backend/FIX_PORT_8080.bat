@echo off
echo ========================================
echo Fixing Port 8080 Issue
echo ========================================
echo.

echo Step 1: Stopping all Java processes...
taskkill /F /IM java.exe >nul 2>&1
if errorlevel 1 (
    echo No Java processes found.
) else (
    echo Java processes stopped.
)

echo.
echo Step 2: Waiting for ports to release...
timeout /t 5 /nobreak >nul

echo.
echo Step 3: Checking port 8080...
netstat -ano | findstr :8080 | findstr LISTENING
if errorlevel 1 (
    echo Port 8080 is FREE! You can start the server now.
) else (
    echo Port 8080 is still in use. Finding and stopping the process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
        echo Stopping process %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo Done!
)

echo.
echo ========================================
echo Now you can run: mvn spring-boot:run
echo ========================================
pause

