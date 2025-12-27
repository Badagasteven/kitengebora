@echo off
echo ========================================
echo Starting Kitenge Bora - Full Stack
echo ========================================
echo.
echo This will start both backend and frontend
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
pause

echo.
echo Starting Spring Boot Backend...
start "Kitenge Backend" cmd /k "cd /d %~dp0kitenge-backend && mvn spring-boot:run"

echo.
echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo.
echo Starting React Frontend...
start "Kitenge Frontend" cmd /k "cd /d %~dp0kitenge-frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul

