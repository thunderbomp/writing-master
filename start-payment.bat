@echo off
chcp 65001 >nul
REM 写作大师 - 支付服务启动脚本 (Windows)

echo ======================================
echo 🚀 写作大师 - 支付服务启动
echo ======================================
echo.

REM 进入后端目录
cd payment-backend

REM 检查 node_modules 是否存在
if not exist "node_modules" (
    echo 📦 正在安装依赖...
    call npm install
)

REM 检查 .env 文件是否存在
if not exist ".env" (
    echo ⚠️  .env 文件不存在，正在创建...
    copy .env.example .env
    echo ✅ 已创建 .env 文件，请根据需要修改配置
)

REM 启动服务
echo 🎯 正在启动支付服务...
echo.
call npm run dev

pause
