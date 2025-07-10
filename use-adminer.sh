#!/bin/bash

# 切換到 Adminer 作為資料庫管理工具
echo "🔄 Switching to Adminer as database management tool..."

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 停止 pgAdmin
docker-compose stop pgadmin

# 啟動 Adminer
docker run -d \
  --name psychology_lab_adminer \
  --network psychology-lab-network \
  -p 8080:8080 \
  adminer:latest

echo "✅ Adminer started successfully!"
echo ""
echo "🌐 Access URL: http://localhost:8080"
echo ""
echo "🔑 Login credentials:"
echo "System: PostgreSQL"
echo "Server: postgres"
echo "Username: psychologylab"
echo "Password: your-secure-database-password-123"
echo "Database: psychologylab"
