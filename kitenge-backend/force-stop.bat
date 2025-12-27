@echo off
echo ========================================
echo Force Stopping All Java Processes
echo ========================================
echo.

echo Stopping all Java processes...
taskkill /F /IM java.exe >nul 2>&1
if errorlevel 1 (
    echo No Java processes found or already stopped.
) else (
    echo Successfully stopped all Java processes.
)

echo.
echo Waiting 3 seconds for ports to release...
timeout /t 3 /nobreak >nul

echo.
echo Checking port 8080...
netstat -ano | findstr :8080 | findstr LISTENING
if errorlevel 1 (
    echo Port 8080 is now free!
) else (
    echo Port 8080 is still in use. Trying again...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
        echo Stopping process %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo Done!
pause

