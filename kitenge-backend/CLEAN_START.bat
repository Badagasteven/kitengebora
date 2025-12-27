@echo off
echo ========================================
echo CLEAN START - Stopping Everything
echo ========================================
echo.

echo Step 1: Stopping ALL Java processes...
taskkill /F /IM java.exe /T >nul 2>&1
taskkill /F /IM javaw.exe /T >nul 2>&1
if errorlevel 1 (
    echo No Java processes found.
) else (
    echo All Java processes stopped.
)

echo.
echo Step 2: Waiting for ports to release...
timeout /t 5 /nobreak >nul

echo.
echo Step 3: Checking ports...
netstat -ano | findstr ":8080\|:8081\|:8082" | findstr LISTENING
if errorlevel 1 (
    echo All ports are FREE!
) else (
    echo Some ports still in use. Killing processes...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080\|:8081\|:8082" ^| findstr LISTENING') do (
        echo Killing process %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 3 /nobreak >nul
)

echo.
echo ========================================
echo CLEAN! Now you can start the server:
echo ========================================
echo.
echo cd kitenge-backend
echo mvn spring-boot:run
echo.
pause

