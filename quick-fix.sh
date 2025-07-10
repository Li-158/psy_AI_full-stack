#!/bin/bash

echo "🚀 Quick fix for Adminer connection..."

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 方案 1: 重啟所有服務確保網路正常
echo "=== 方案 1: 重啟所有服務 ==="
docker-compose down
sleep 5
docker-compose --profile dev up -d
sleep 15

echo "檢查服務狀態："
docker-compose ps

# 檢查網路連接
echo ""
echo "=== 檢查網路連接 ==="
if docker exec psychology_lab_pgadmin ping -c 1 postgres >/dev/null 2>&1; then
    echo "✅ pgAdmin 可以連接到 postgres"
    echo "在 pgAdmin 中使用伺服器名稱: postgres"
else
    echo "❌ pgAdmin 無法連接到 postgres"
fi

# 如果 pgAdmin 不行，嘗試主機網路模式的 Adminer
echo ""
echo "=== 方案 2: 主機網路模式的 Adminer ==="
docker stop adminer 2>/dev/null || true
docker rm adminer 2>/dev/null || true

docker run -d \
  --name adminer \
  --network host \
  adminer:latest

echo "✅ Adminer 已啟動（主機網路模式）"

echo ""
echo "🎯 連接選項："
echo "============"
echo ""
echo "選項 1 - pgAdmin (http://localhost:8080):"
echo "Email: admin@psychologylab.com"
echo "Password: admin123"
echo "然後添加伺服器："
echo "- Host: postgres"
echo "- Port: 5432"
echo "- Database: psychologylab"
echo "- Username: psychologylab"
echo "- Password: your-secure-database-password-123"
echo ""
echo "選項 2 - Adminer (http://localhost:8080):"
echo "- System: PostgreSQL"
echo "- Server: localhost"
echo "- Username: psychologylab"
echo "- Password: your-secure-database-password-123"
echo "- Database: psychologylab"
echo ""
echo "💡 兩個工具都在 8080 端口，一次只能用一個"
