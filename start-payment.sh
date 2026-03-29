#!/bin/bash

# 写作大师 - 支付服务启动脚本

echo "======================================"
echo "🚀 写作大师 - 支付服务启动"
echo "======================================"
echo ""

# 进入后端目录
cd payment-backend

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
fi

# 检查 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo "⚠️  .env 文件不存在，正在创建..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请根据需要修改配置"
fi

# 启动服务
echo "🎯 正在启动支付服务..."
echo ""
npm run dev
