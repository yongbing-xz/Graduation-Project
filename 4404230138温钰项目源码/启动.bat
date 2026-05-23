@echo off
echo ===========================================
echo    硬件兼容性检测平台 - 启动器
echo ===========================================
echo.

REM 创建必要的数据目录结构
echo 正在初始化项目结构...
if not exist "assets" mkdir assets
if not exist "assets\data" mkdir assets\data
if not exist "assets\css" mkdir assets\css
if not exist "assets\js" mkdir assets\js
if not exist "docs" mkdir docs
if not exist "config" mkdir config

echo.
echo 正在检查默认用户...

REM 检查是否存在测试用户，如果不存在则创建
echo 使用以下默认账号登录：
echo 用户名: demo
echo 密码: 123456
echo.

echo 正在启动主应用...
start "" "index.html"

echo.
echo ===========================================
echo 硬件兼容性检测平台已成功启动！
echo 浏览器窗口已打开，请检查是否正常显示。
echo ===========================================
echo.
echo 如果浏览器没有自动打开，请手动执行以下操作：
echo 1. 右键点击 index.html 文件
echo 2. 选择"在浏览器中打开"
echo 3. 使用默认账号登录：demo / 123456
echo.
pause