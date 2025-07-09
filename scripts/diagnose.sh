#!/bin/bash

echo "🔍 診斷系統問題..."

# 檢查 Docker 狀態
echo "📦 Docker 狀態:"
docker --version
docker-compose --version

# 檢查端口佔用
echo -e "\n🔌 端口檢查:"
echo "Port 3000 (Frontend):"
lsof -i :3000 || echo "✅ 端口 3000 未被佔用"

echo -e "\nPort 3001 (Backend):"
lsof -i :3001 || echo "✅ 端口 3001 未被佔用"

echo -e "\nPort 5432 (PostgreSQL):"
lsof -i :5432 || echo "✅ 端口 5432 未被佔用"

# 檢查 Docker 容器狀態
echo -e "\n📊 Docker 容器狀態:"
docker-compose ps

# 檢查容器日誌
echo -e "\n📋 後端容器日誌 (最後 20 行):"
docker-compose logs --tail=20 backend

echo -e "\n📋 前端容器日誌 (最後 20 行):"
docker-compose logs --tail=20 frontend

echo -e "\n📋 資料庫容器日誌 (最後 20 行):"
docker-compose logs --tail=20 postgres

# 測試連接
echo -e "\n🧪 連接測試:"
echo "測試後端 API:"
curl -v http://localhost:3001/api/health 2>&1 | grep -E "(HTTP|Connected|Failed)"

echo -e "\n測試前端:"
curl -I http://localhost:3000 2>&1 | head -n 10

# 檢查網路
echo -e "\n🌐 Docker 網路:"
docker network ls
docker network inspect psychology-lab-system_lab_network 2>/dev/null || echo "網路未建立"

echo -e "\n✅ 診斷完成"
