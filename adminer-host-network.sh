#!/bin/bash

# 使用主機網路模式運行 Adminer
echo "🌐 Starting Adminer with host network mode..."

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 停止現有的 Adminer
docker stop adminer 2>/dev/null || true
docker rm adminer 2>/dev/null || true

# 停止 pgAdmin 以釋放 8080 端口
docker-compose stop pgadmin

# 使用主機網路模式運行 Adminer
docker run -d \
  --name adminer \
  --network host \
  -p 8080:8080 \
  adminer:latest

echo "✅ Adminer started with host network mode"
echo ""
echo "🌐 Access: http://localhost:8080"
echo ""
echo "🔑 Connection details:"
echo "System: PostgreSQL"
echo "Server: localhost (or 127.0.0.1)"
echo "Username: psychologylab"
echo "Password: your-secure-database-password-123"
echo "Database: psychologylab"
echo ""
echo "💡 In host network mode, use 'localhost' as the server address"
