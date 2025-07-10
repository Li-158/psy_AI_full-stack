#!/bin/bash

# 完整解決 Adminer 連接問題
echo "🔧 Fixing Adminer connection to PostgreSQL..."

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 1. 停止並清理現有的 Adminer
echo "1. Cleaning up existing Adminer..."
docker stop adminer 2>/dev/null || true
docker rm adminer 2>/dev/null || true

# 2. 確認 PostgreSQL 容器運行狀態
echo "2. Checking PostgreSQL container..."
if docker ps | grep -q "psychology_lab_db"; then
    echo "✅ PostgreSQL container is running"
else
    echo "❌ PostgreSQL container is not running. Starting it..."
    docker-compose up -d postgres
    sleep 10
fi

# 3. 重新啟動 Adminer 並連接到正確的網路
echo "3. Starting Adminer with correct network..."
docker run -d \
  --name adminer \
  --network psychology-lab-network \
  -p 8080:8080 \
  adminer:latest

echo "4. Waiting for Adminer to start..."
sleep 5

# 5. 驗證網路連接
echo "5. Verifying network connectivity..."
echo "Containers in psychology-lab-network:"
docker network inspect psychology-lab-network --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{"\n"}}{{end}}'

# 6. 測試連接
echo ""
echo "6. Testing connectivity..."
if docker exec adminer ping -c 1 psychology_lab_db >/dev/null 2>&1; then
    echo "✅ Adminer can reach PostgreSQL container"
    SERVER_NAME="psychology_lab_db"
else
    echo "❌ Direct container name failed, checking service name..."
    if docker exec adminer nslookup postgres >/dev/null 2>&1; then
        echo "✅ Service name 'postgres' resolves"
        SERVER_NAME="postgres"
    else
        echo "⚠️  Using IP address fallback"
        SERVER_NAME=$(docker network inspect psychology-lab-network --format '{{range .Containers}}{{if eq .Name "psychology_lab_db"}}{{.IPv4Address}}{{end}}{{end}}' | cut -d'/' -f1)
    fi
fi

echo ""
echo "🎯 Adminer 連接資訊："
echo "==================="
echo "URL: http://localhost:8080"
echo ""
echo "連接設定："
echo "資料庫系統: PostgreSQL"
echo "伺服器: $SERVER_NAME"
echo "帳號: psychologylab" 
echo "密碼: your-secure-database-password-123"
echo "資料庫: psychologylab"
echo ""
echo "✅ Setup complete! Try connecting now."
