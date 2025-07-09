#!/bin/bash

echo "🧹 清理舊的容器和映像..."

# 停止並移除現有容器
docker-compose down

# 清理未使用的映像
docker image prune -f

# 確保沒有佔用 3000 端口的進程
echo "🔍 檢查端口佔用..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  端口 3000 被佔用，嘗試終止..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if lsof -i :3001 > /dev/null 2>&1; then
    echo "⚠️  端口 3001 被佔用，嘗試終止..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "✅ 端口檢查完成"

# 重新構建並啟動
echo "🚀 重新構建並啟動服務..."
docker-compose up --build -d

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 10

# 檢查服務狀態
echo "📊 檢查服務狀態..."
docker-compose ps

# 檢查後端健康狀態
echo "🏥 檢查後端 API..."
curl -f http://localhost:3001/api/health || echo "❌ 後端 API 尚未就緒"

# 檢查前端
echo "🌐 檢查前端..."
curl -f http://localhost:3000 || echo "❌ 前端尚未就緒"

echo "📋 查看後端日誌..."
docker-compose logs --tail=20 backend

echo "📋 查看前端日誌..."
docker-compose logs --tail=20 frontend

echo "✅ 部署完成！"
echo "🌐 前端: http://localhost:3000"
echo "🔌 後端 API: http://localhost:3001"
echo "🗄️ Adminer: http://localhost:8080"
