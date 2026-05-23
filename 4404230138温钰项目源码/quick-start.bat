@echo off
echo 🚀 快速启动 - 硬件兼容性检测平台
echo.

echo 选择启动方式：
echo 1. 启动完整系统 (后端 + Vue.js前端)
echo 2. 仅启动后端服务  
echo 3. 仅启动前端服务
echo 4. 打开简单HTML版本
echo 5. 查看系统状态
echo.

set /p choice=请选择 (1-5): 

if "%choice%"=="1" goto full_system
if "%choice%"=="2" goto backend_only  
if "%choice%"=="3" goto frontend_only
if "%choice%"=="4" goto simple_version
if "%choice%"=="5" goto check_status
goto invalid

:full_system
echo 🔄 启动完整系统...
start "后端" cmd /k "cd backend && mvn spring-boot:run"
timeout /t 3 /nobreak >nul
cd frontend && if not exist node_modules npm install
start "前端" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul
start http://localhost:5173
goto end

:backend_only
echo 📦 启动后端服务...
start "后端" cmd /k "cd backend && mvn spring-boot:run"
timeout /t 2 /nobreak >nul
start http://localhost:8080/api/monitoring/health
goto end

:frontend_only
echo 🌐 启动前端服务...
cd frontend && if not exist node_modules npm install
start "前端" cmd /k "npm run dev"  
timeout /t 2 /nobreak >nul
start http://localhost:5173
goto end

:simple_version
echo 📱 打开简单版本...
start frontend-simple/index.html
goto end

:check_status
echo 🔍 检查系统状态...
echo.
echo 检查后端服务...
curl -s http://localhost:8080/actuator/health >nul 2>&1
if %errorlevel%==0 (
    echo ✅ 后端服务运行正常 (http://localhost:8080)
) else (
    echo ❌ 后端服务未运行
)

echo 检查前端服务...
curl -s http://localhost:5173 >nul 2>&1  
if %errorlevel%==0 (
    echo ✅ 前端服务运行正常 (http://localhost:5173)
) else (
    echo ❌ 前端服务未运行
)

echo.
echo 监控面板: http://localhost:8080/api/monitoring/dashboard
goto end

:invalid
echo ❌ 无效选择
goto end

:end
echo.
echo 🎉 操作完成！