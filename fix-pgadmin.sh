#!/bin/bash

# pgAdmin 故障排除腳本
# pgAdmin Troubleshooting Script

echo "🔧 pgAdmin Troubleshooting Script"
echo "================================="

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

echo "1. 檢查 pgAdmin 容器狀態..."
docker-compose ps pgadmin

echo ""
echo "2. 檢查 pgAdmin 日誌（最近 50 行）..."
docker-compose logs --tail=50 pgadmin

echo ""
echo "3. 檢查網路連接..."
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ pgAdmin 網頁可以訪問"
else
    echo "❌ pgAdmin 網頁無法訪問"
fi

echo ""
echo "4. 重置 pgAdmin..."
read -p "是否要重置 pgAdmin？這將刪除所有 pgAdmin 設定 (y/N): " reset_choice

if [[ $reset_choice =~ ^[Yy]$ ]]; then
    echo "🗑️  停止 pgAdmin..."
    docker-compose stop pgadmin
    
    echo "🗑️  刪除 pgAdmin 容器..."
    docker-compose rm -f pgadmin
    
    echo "🗑️  刪除 pgAdmin 資料..."
    docker volume rm psychology-lab-pgadmin-data 2>/dev/null || echo "Volume not found"
    
    echo "🚀 重新啟動 pgAdmin..."
    docker-compose --profile dev up -d pgadmin
    
    echo "⏳ 等待 pgAdmin 啟動..."
    sleep 15
    
    echo "✅ pgAdmin 已重置並重新啟動"
else
    echo "跳過重置"
fi

echo ""
echo "5. 最終狀態檢查..."
docker-compose ps pgadmin

echo ""
echo "📝 pgAdmin 登入資訊："
echo "==================="
echo "URL: http://localhost:8080"
echo "Email: admin@psychologylab.com" 
echo "Password: admin123"

echo ""
echo "🔗 資料庫連接資訊（在 pgAdmin 中使用）："
echo "======================================="
echo "Host: postgres"
echo "Port: 5432"
echo "Database: psychologylab"
echo "Username: psychologylab"
echo "Password: your-secure-database-password-123"

echo ""
echo "💡 如果仍然無法登入，請嘗試："
echo "1. 清除瀏覽器快取和 cookies"
echo "2. 使用無痕/私人瀏覽模式"
echo "3. 嘗試不同的瀏覽器"
echo "4. 檢查防火牆設定"
