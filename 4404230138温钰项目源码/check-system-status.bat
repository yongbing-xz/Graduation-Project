@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                   🔍 系统状态检查工具                          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 正在检查系统各组件状态...
echo.

REM 检查后端服务
echo 📦 后端服务状态：
echo ────────────────────────────────────────────────────────────────
curl -s -w "%%{http_code}" http://localhost:8080/actuator/health > backend_status.txt 2>&1
set /p backend_code=<backend_status.txt
if "%backend_code%"=="200" (
    echo ✅ 后端服务 - 正常运行
    echo 📊 API地址: http://localhost:8080
    echo 📋 监控面板: http://localhost:8080/api/monitoring/dashboard
    echo 📝 日志分析: http://localhost:8080/api/logs/dashboard
    echo 🔍 健康检查: http://localhost:8080/actuator/health
) else (
    echo ❌ 后端服务 - 未运行 (状态码: %backend_code%)
    echo 💡 解决方法: 运行 start-full-system.bat 启动
)
echo.

REM 检查前端服务  
echo 🌐 前端服务状态：
echo ────────────────────────────────────────────────────────────────
curl -s -w "%%{http_code}" http://localhost:5173 > frontend_status.txt 2>&1
set /p frontend_code=<frontend_status.txt
if "%frontend_code%"=="200" (
    echo ✅ 前端服务 - 正常运行
    echo 📱 访问地址: http://localhost:5173
) else (
    echo ❌ 前端服务 - 未运行 (状态码: %frontend_code%)
    echo 💡 解决方法: 检查端口5173是否被占用
)
echo.

REM 检查文件完整性
echo 📁 文件完整性检查：
echo ────────────────────────────────────────────────────────────────
if exist "backend\src\main\resources\logback-spring.xml" (
    echo ✅ 日志配置文件
) else (
    echo ❌ 日志配置文件 - 缺失
)

if exist "backend\src\main\java\com\hardware\compatibility\service\impl\MonitoringServiceImpl.java" (
    echo ✅ 监控服务实现
) else (
    echo ❌ 监控服务实现 - 缺失
)

if exist "frontend\src\utils\errorHandler.js" (
    echo ✅ 前端错误处理器
) else (
    echo ❌ 前端错误处理器 - 缺失
)

if exist "frontend-simple\assets\js\error-handler.js" (
    echo ✅ 简单版错误处理器
) else (
    echo ❌ 简单版错误处理器 - 缺失
)
echo.

REM 检查端口占用
echo 🔌 端口占用检查：
echo ────────────────────────────────────────────────────────────────
netstat -an | findstr ":8080" >nul 2>&1
if %errorlevel%==0 (
    echo ✅ 端口8080 - 被占用 (后端服务)
) else (
    echo ❌ 端口8080 - 空闲
)

netstat -an | findstr ":5173" >nul 2>&1
if %errorlevel%==0 (
    echo ✅ 端口5173 - 被占用 (前端服务)
) else (
    echo ❌ 端口5173 - 空闲
)
echo.

REM 检查日志目录
echo 📋 日志系统状态：
echo ────────────────────────────────────────────────────────────────
if exist "backend\logs" (
    echo ✅ 日志目录存在
    dir "backend\logs\*.log" >nul 2>&1
    if %errorlevel%==0 (
        echo 📄 发现日志文件:
        for %%f in (backend\logs\*.log) do (
            echo    • %%f (大小: %%~zf 字节)
        )
    ) else (
        echo ⚠️  日志目录存在但无日志文件 (服务可能刚启动)
    )
) else (
    echo ❌ 日志目录 - 不存在
)
echo.

REM 清理临时文件
if exist backend_status.txt del backend_status.txt
if exist frontend_status.txt del frontend_status.txt

echo ═════════════════════════════════════════════════════════════
echo.
echo 🎯 快速操作建议：
echo.
echo 1️⃣  启动完整系统: start-full-system.bat
echo 2️⃣  快速选择启动: quick-start.bat  
echo 3️⃣  打开简单版本: frontend-simple\index.html
echo 4️⃣  查看使用文档: ERROR_MONITORING_GUIDE.md
echo 5️⃣  查看检查报告: FINAL_SYSTEM_CHECK_REPORT.md
echo.
echo 🔐 默认登录账号: demo / 123456
echo.
echo ═════════════════════════════════════════════════════════════
echo.
pause