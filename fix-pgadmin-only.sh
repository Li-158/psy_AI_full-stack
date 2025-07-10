#!/bin/bash

echo "🔧 Fixing pgAdmin connection to PostgreSQL..."

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 1. 停止 Adminer（釋放 8080 端口）
echo "1. Stopping Adminer to free port 8080..."
docker stop adminer 2>/dev/null || true
docker rm adminer 2>/dev/null || true

# 2. 確保 PostgreSQL 運行
echo "2. Ensuring PostgreSQL is running..."
docker-compose up -d postgres
sleep 10

# 3. 重新啟動 pgAdmin
echo "3. Restarting pgAdmin..."
docker-compose stop pgadmin
docker-compose rm -f pgadmin
docker volume rm psychology-lab-pgadmin-data 2>/dev/null || true

# 使用開發模式啟動 pgAdmin
docker-compose --profile dev up -d pgadmin
sleep 15

# 4. 檢查容器狀態
echo "4. Checking container status..."
docker-compose ps

# 5. 檢查 pgAdmin 日誌
echo "5. Checking pgAdmin logs..."
docker-compose logs --tail=20 pgadmin

# 6. 測試網路連接
echo "6. Testing network connectivity..."
if docker exec psychology_lab_pgadmin ping -c 2 postgres >/dev/null 2>&1; then
    echo "✅ pgAdmin can reach 'postgres'"
    SERVER_NAME="postgres"
elif docker exec psychology_lab_pgadmin ping -c 2 psychology_lab_db >/dev/null 2>&1; then
    echo "✅ pgAdmin can reach 'psychology_lab_db'"
    SERVER_NAME="psychology_lab_db"
else
    echo "❌ pgAdmin cannot reach PostgreSQL by hostname"
    # 獲取 PostgreSQL 的實際 IP
    SERVER_NAME=$(docker inspect psychology_lab_db --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
    echo "🔧 Using IP address: $SERVER_NAME"
fi

# 7. 測試端口連接
echo "7. Testing port connectivity..."
if docker exec psychology_lab_pgadmin nc -zv $SERVER_NAME 5432 2>&1 | grep -q "succeeded"; then
    echo "✅ Port 5432 is accessible"
else
    echo "❌ Port 5432 is not accessible"
fi

echo ""
echo "🎯 pgAdmin 連接資訊："
echo "==================="
echo "URL: http://localhost:8080"
echo ""
echo "pgAdmin 登入："
echo "Email: admin@psychologylab.com"
echo "Password: admin123"
echo ""
echo "在 pgAdmin 中添加伺服器："
echo "Name: Psychology Lab Database"
echo "Host: $SERVER_NAME"
echo "Port: 5432"
echo "Database: psychologylab"
echo "Username: psychologylab"
echo "Password: your-secure-database-password-123"
echo ""
echo "✅ pgAdmin should be ready now!"
