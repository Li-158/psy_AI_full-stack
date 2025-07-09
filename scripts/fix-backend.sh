#!/bin/bash

echo "🛑 停止所有容器..."
docker-compose down

echo "🧹 清理..."
docker system prune -f

echo "🔨 重新構建後端..."
docker-compose build backend

echo "🚀 啟動資料庫..."
docker-compose up -d postgres

echo "⏳ 等待資料庫啟動..."
sleep 10

echo "🔍 檢查資料庫狀態..."
docker-compose exec postgres pg_isready -U labuser -d psychology_lab

echo "🚀 啟動後端..."
docker-compose up -d backend

echo "⏳ 等待後端啟動..."
sleep 10

echo "🔍 檢查後端日誌..."
docker-compose logs --tail=30 backend

echo "🚀 啟動前端..."
docker-compose up -d frontend

echo "📊 檢查所有服務狀態..."
docker-compose ps

echo "✅ 完成！"
