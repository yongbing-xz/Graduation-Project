@echo off
REM Ensure UTF-8 encoding
chcp 65001 >nul

echo.
echo ============================
echo Hardware Compatibility Platform - Starter
echo ============================
echo.

REM Create necessary directories
echo Initializing project structure...
if not exist "logs" mkdir logs
if not exist "frontend-simple\assets\data" mkdir frontend-simple\assets\data
if not exist "frontend-simple\assets\css" mkdir frontend-simple\assets\css
if not exist "frontend-simple\assets\js" mkdir frontend-simple\assets\js
echo Directory structure initialized

echo.
echo ============================
echo Starting full system...
echo ============================

REM Start backend service
echo.
echo [1/3] Starting backend service (Spring Boot)...
cd backend
start "Backend Service" cmd /c "mvn spring-boot:run"
cd ..
echo Backend service start command executed

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Check frontend dependencies
echo.
echo [2/3] Checking frontend dependencies...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
) else (
    echo Frontend dependencies already exist
)
cd ..

REM Start simple frontend
echo.
echo [3/3] Starting simple frontend (frontend-simple)...
echo Starting simple frontend...
start "" "frontend-simple\index.html"
echo Simple frontend start command executed

echo.
echo ============================
echo System started successfully!
echo ============================
echo.
echo Access addresses:
echo   Backend API:     http://localhost:8080
echo   Simple frontend: frontend-simple/index.html
echo.
echo Default login credentials:
echo   Username: demo
echo   Password:   123456
echo.
echo Tips:
echo   Backend startup takes 1-2 minutes, please wait patiently
echo   If ports are occupied, close related services and try again
echo   Simple frontend: Double-click frontend-simple/index.html
echo   Error history: Press Ctrl+Shift+E in frontend
echo.
echo ============================
echo.
echo Press any key to close this window...
pause >nul