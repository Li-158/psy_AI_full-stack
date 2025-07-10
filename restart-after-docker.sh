#!/bin/bash

echo "🚀 Restarting Psychology Lab System after Docker restart..."

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 1. 檢查 Docker 是否運行
echo "1. Checking if Docker is running..."
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop or Docker service first."
    echo ""
    echo "Mac: Open Docker Desktop app"
    echo "Or run: open -a Docker"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Docker is running"

# 2. 清理所有停止的容器
echo "2. Cleaning up stopped containers..."
docker container prune -f

# 3. 清理未使用的網路
echo "3. Cleaning up unused networks..."
docker network prune -f

# 4. 檢查並清理我們的特定容器
echo "4. Cleaning up our specific containers..."
docker stop psychology_lab_db psychology_lab_api psychology_lab_frontend psychology_lab_pgadmin adminer 2>/dev/null || true
docker rm psychology_lab_db psychology_lab_api psychology_lab_frontend psychology_lab_pgadmin adminer 2>/dev/null || true

# 5. 重新創建並啟動服務
echo "5. Starting fresh services..."
docker compose down --volumes 2>/dev/null || true
sleep 5

# 啟動基本服務
echo "Starting PostgreSQL..."
docker compose up -d postgres
sleep 15

echo "Starting backend..."
docker compose up -d backend
sleep 10

echo "Starting frontend..."
docker compose up -d frontend
sleep 10

echo "Starting pgAdmin..."
docker compose --profile dev up -d pgadmin
sleep 15

# 6. 檢查服務狀態
echo "6. Checking service status..."
docker compose ps

# 7. 檢查服務健康狀態
echo ""
echo "7. Checking service health..."

# PostgreSQL
if docker compose ps postgres | grep -q "Up"; then
    echo "✅ PostgreSQL: Running"
else
    echo "❌ PostgreSQL: Not running"
fi

# Backend
if docker compose ps backend | grep -q "Up"; then
    echo "✅ Backend: Running"
    # 測試健康檢查
    sleep 5
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        echo "✅ Backend Health: OK"
    else
        echo "⚠️  Backend Health: Starting up..."
    fi
else
    echo "❌ Backend: Not running"
fi

# Frontend
if docker compose ps frontend | grep -q "Up"; then
    echo "✅ Frontend: Running"
else
    echo "❌ Frontend: Not running"
fi

# pgAdmin
if docker compose ps pgadmin | grep -q "Up"; then
    echo "✅ pgAdmin: Running"
else
    echo "❌ pgAdmin: Not running"
    echo "Checking pgAdmin logs..."
    docker compose logs --tail=10 pgadmin
fi

echo ""
echo "🌐 Access URLs:"
echo "=============="
echo "📱 Frontend:     http://localhost:3000"
echo "🔌 Backend:      http://localhost:3001"
echo "📖 API Docs:     http://localhost:3001/docs"
echo "🛠️  pgAdmin:     http://localhost:8080"
echo ""
echo "🔑 pgAdmin Login:"
echo "Email: admin@psychologylab.com"
echo "Password: admin123"
echo ""
echo "🔑 Default System Login:"
echo "Admin: admin@psychologylab.com / admin123"
echo "Researcher: researcher1@psychologylab.com / researcher123"
echo ""
echo "✅ System restart complete!"

# 8. 提供故障排除信息
echo ""
echo "💡 Troubleshooting:"
echo "==================="
echo "If pgAdmin connection fails, use these server settings:"
echo "Host: postgres (or psychology_lab_db)"
echo "Port: 5432"
echo "Database: psychologylab"
echo "Username: psychologylab"
echo "Password: your-secure-database-password-123"
