#!/bin/bash

# Psychology Lab System 整合啟動腳本
# Psychology Lab System Integrated Startup Script

set -e

echo "🚀 Psychology Lab System - Integrated Startup"
echo "=============================================="

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# 檢查 docker compose 是否可用
if ! command -v docker compose > /dev/null 2>&1; then
    echo "❌ docker compose is not installed. Please install it first."
    exit 1
fi

# 顯示菜單
echo ""
echo "請選擇啟動模式 / Please select startup mode:"
echo "1. 🔧 開發模式 (Development) - 包含 pgAdmin"
echo "2. 🚀 生產模式 (Production) - 包含 Nginx"
echo "3. 📦 基本模式 (Basic) - 僅基本服務"
echo "4. 🗑️  清理並重新啟動 (Clean & Restart)"
echo "5. 🛑 停止所有服務 (Stop All Services)"
echo ""

read -p "選擇 (1-5): " choice

case $choice in
    1)
        echo "🔧 Starting in Development Mode..."
        echo "Services: PostgreSQL + Python Backend + React Frontend + pgAdmin"
        docker compose --profile dev up -d
        ;;
    2)
        echo "🚀 Starting in Production Mode..."
        echo "Services: PostgreSQL + Python Backend + React Frontend + Nginx"
        docker compose --profile production up -d
        ;;
    3)
        echo "📦 Starting in Basic Mode..."
        echo "Services: PostgreSQL + Python Backend + React Frontend"
        docker compose up -d postgres backend frontend
        ;;
    4)
        echo "🗑️  Cleaning up and restarting..."
        docker compose down --volumes
        docker system prune -f
        echo "🔧 Restarting in Development Mode..."
        docker compose --profile dev up -d
        ;;
    5)
        echo "🛑 Stopping all services..."
        docker compose down
        echo "✅ All services stopped."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# 檢查服務狀態
echo ""
echo "📊 Service Status:"
echo "=================="

# 檢查 PostgreSQL
if docker compose ps postgres | grep -q "Up"; then
    echo "✅ PostgreSQL: Running"
else
    echo "❌ PostgreSQL: Not running"
fi

# 檢查 Backend
if docker compose ps backend | grep -q "Up"; then
    echo "✅ Backend API: Running"
    # 檢查健康狀態
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Backend Health: OK"
    else
        echo "⚠️  Backend Health: Checking..."
    fi
else
    echo "❌ Backend API: Not running"
fi

# 檢查 Frontend
if docker compose ps frontend | grep -q "Up"; then
    echo "✅ Frontend: Running"
else
    echo "❌ Frontend: Not running"
fi

# 檢查 pgAdmin (如果在開發模式)
if [ "$choice" = "1" ]; then
    if docker compose ps pgadmin | grep -q "Up"; then
        echo "✅ pgAdmin: Running"
    else
        echo "❌ pgAdmin: Not running"
    fi
fi

echo ""
echo "🌐 Access URLs:"
echo "=============="
echo "📱 Frontend:        http://localhost:3000"
echo "🔌 Backend API:     http://localhost:3001"
echo "📖 API Docs:        http://localhost:3001/docs"
echo "🔍 Health Check:    http://localhost:3001/health"

if [ "$choice" = "1" ]; then
    echo "🛠️  pgAdmin:        http://localhost:8080"
    echo "   Username: admin@psychologylab.com"
    echo "   Password: admin123"
fi

echo ""
echo "🔑 Default Login:"
echo "================"
echo "👨‍💼 Admin:    admin@psychologylab.com / admin123"
echo "👨‍🔬 Researcher: researcher1@psychologylab.com / researcher123"

echo ""
echo "📝 Useful Commands:"
echo "==================="
echo "docker compose logs -f          # 查看日誌"
echo "docker compose ps              # 查看服務狀態"
echo "docker compose down            # 停止服務"
echo "docker compose restart backend # 重啟後端"

echo ""
echo "✅ Psychology Lab System is ready!"
echo "🎉 Happy researching!"
