#!/bin/bash

# 檢查 Docker 網路和容器連接
echo "🔍 Checking Docker network and container connections..."

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

echo "1. 檢查容器狀態:"
docker-compose ps

echo ""
echo "2. 檢查網路:"
docker network ls | grep psychology

echo ""
echo "3. 檢查 PostgreSQL 容器詳細資訊:"
docker inspect psychology_lab_db | grep -A 10 -B 5 "NetworkMode\|IPAddress\|Gateway"

echo ""
echo "4. 檢查 pgAdmin 容器詳細資訊:"
docker inspect psychology_lab_pgadmin | grep -A 10 -B 5 "NetworkMode\|IPAddress\|Gateway"

echo ""
echo "5. 測試 pgAdmin 容器到 PostgreSQL 的連接:"
docker exec psychology_lab_pgadmin ping -c 3 psychology_lab_db 2>/dev/null || echo "Ping failed"

echo ""
echo "6. 測試 PostgreSQL 端口:"
docker exec psychology_lab_pgadmin nc -zv psychology_lab_db 5432 2>&1 || echo "Port test failed"

echo ""
echo "7. 在 pgAdmin 中使用以下連接資訊:"
echo "=================================="
echo "Host name/address: psychology_lab_db"
echo "Port: 5432"
echo "Maintenance database: psychologylab"
echo "Username: psychologylab"
echo "Password: your-secure-database-password-123"
echo ""
echo "如果 psychology_lab_db 不行，請嘗試:"
echo "Host name/address: localhost"
echo "或"
echo "Host name/address: 127.0.0.1"
