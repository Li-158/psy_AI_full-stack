#!/bin/bash

echo "🚀 Simple pgAdmin restart..."

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 完全重啟系統
docker-compose down
sleep 5

# 只啟動必要的服務
docker-compose up -d postgres

# 等待 PostgreSQL 準備好
echo "Waiting for PostgreSQL..."
sleep 15

# 啟動 pgAdmin
docker-compose --profile dev up -d pgadmin

# 等待 pgAdmin 啟動
echo "Waiting for pgAdmin..."
sleep 20

# 檢查狀態
echo "Container status:"
docker-compose ps

echo ""
echo "🎯 Access pgAdmin at: http://localhost:8080"
echo "Login: admin@psychologylab.com / admin123"
echo ""
echo "When adding server in pgAdmin, try these hosts in order:"
echo "1. postgres"
echo "2. psychology_lab_db"
echo "3. localhost"
