#!/bin/bash

echo "🔍 調試後端啟動問題..."

# 顯示環境變數（隱藏敏感信息）
echo -e "\n📋 環境變數檢查："
echo "DATABASE_URL 格式: postgresql://labuser:***@postgres:5432/psychology_lab"
echo "JWT_SECRET: 已設置"
echo "NODE_ENV: production"
echo "PORT: 3001"

# 檢查容器狀態
echo -e "\n📊 容器狀態："
docker-compose ps

# 詳細的後端錯誤日誌
echo -e "\n❌ 後端錯誤日誌："
docker-compose logs --no-color backend | grep -E "(error|Error|ERROR|failed|Failed|FAILED|npm ERR|Cannot|ECONNREFUSED)" | tail -50

# 檢查資料庫連接
echo -e "\n🗄️ 測試資料庫連接："
docker-compose exec -T postgres psql -U labuser -d psychology_lab -c "SELECT version();" 2>&1 || echo "資料庫連接失敗"

# 檢查網路
echo -e "\n🌐 Docker 網路檢查："
docker network inspect psychology-lab-system_lab_network | grep -A 5 "Containers" || echo "網路未找到"

# 嘗試直接運行後端看錯誤
echo -e "\n🧪 嘗試手動啟動後端容器："
docker-compose run --rm backend sh -c "npm run build && node dist/server.js" 2>&1 | head -50

echo -e "\n✅ 調試完成"
