#!/bin/bash

# 修正 Docker 網路連接問題
echo "🔧 Fixing Docker network connectivity issues..."

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

echo "1. 停止所有容器..."
docker-compose down

echo "2. 清理 Adminer 容器（如果存在）..."
docker stop adminer 2>/dev/null || true
docker rm adminer 2>/dev/null || true

echo "3. 清理網路..."
docker network prune -f

echo "4. 重新啟動服務..."
docker-compose --profile dev up -d

echo "5. 等待服務啟動..."
sleep 15

echo "6. 檢查容器狀態..."
docker-compose ps

echo "7. 檢查網路連接..."
echo "PostgreSQL 容器 IP:"
docker inspect psychology_lab_db | grep -A 1 '"IPAddress"' | grep -v null

echo ""
echo "pgAdmin 容器 IP:"
docker inspect psychology_lab_pgadmin | grep -A 1 '"IPAddress"' | grep -v null

echo ""
echo "8. 測試網路連接..."
docker exec psychology_lab_pgadmin ping -c 2 postgres 2>/dev/null && echo "✅ postgres 主機名可解析" || echo "❌ postgres 主機名無法解析"
docker exec psychology_lab_pgadmin ping -c 2 psychology_lab_db 2>/dev/null && echo "✅ psychology_lab_db 主機名可解析" || echo "❌ psychology_lab_db 主機名無法解析"

echo ""
echo "🎯 資料庫連接資訊："
echo "=================="
echo "嘗試以下主機名（按順序）："
echo "1. postgres"
echo "2. psychology_lab_db" 
echo "3. localhost"
echo "4. 127.0.0.1"
echo ""
echo "其他連接資訊："
echo "Port: 5432"
echo "Database: psychologylab"
echo "Username: psychologylab"
echo "Password: your-secure-database-password-123"
