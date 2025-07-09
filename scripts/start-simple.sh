#!/bin/bash

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 檢測使用哪個命令
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ 找不到 docker-compose 或 docker compose 命令"
    exit 1
fi

echo "使用命令: $DOCKER_COMPOSE"

echo "🛑 停止所有服務..."
$DOCKER_COMPOSE down

echo "🔍 檢查端口..."
# 檢查 3001 端口
if lsof -i :3001 > /dev/null 2>&1; then
    echo "⚠️  端口 3001 被佔用，正在終止..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 檢查 3002 端口
if lsof -i :3002 > /dev/null 2>&1; then
    echo "⚠️  端口 3002 被佔用，正在終止..."
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "🚀 啟動服務..."
$DOCKER_COMPOSE up --build -d

echo "⏳ 等待服務啟動..."
sleep 15

echo "📊 服務狀態："
$DOCKER_COMPOSE ps

echo "🔍 測試連接..."
echo -e "\n測試後端 (端口 3002):"
curl -f http://localhost:3002/api/health 2>/dev/null && echo "✅ 後端正常" || echo "❌ 後端未就緒"

echo -e "\n測試前端 (端口 3000):"
curl -f http://localhost:3000 2>/dev/null > /dev/null && echo "✅ 前端正常" || echo "❌ 前端未就緒"

echo -e "\n📋 查看日誌提示："
echo "$DOCKER_COMPOSE logs -f backend  # 查看後端日誌"
echo "$DOCKER_COMPOSE logs -f frontend # 查看前端日誌"

echo -e "\n🌐 訪問地址："
echo "前端: http://localhost:3000"
echo "後端 API: http://localhost:3002/api/health"

echo -e "\n✅ 啟動完成！"
