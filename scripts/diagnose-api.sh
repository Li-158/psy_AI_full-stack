#!/bin/bash

echo "🔍 診斷前後端連接問題"
echo "===================="

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

echo -e "\n📊 容器狀態："
docker compose ps

echo -e "\n🔗 測試 API 連接："
echo "1. 測試後端健康檢查："
curl -s http://localhost:3002/api/health | jq . || echo "❌ 後端 API 無法訪問"

echo -e "\n2. 測試前端是否可訪問："
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "❌ 前端無法訪問"

echo -e "\n3. 檢查前端是否能連到後端："
docker compose exec frontend wget -qO- http://backend:3001/api/health || echo "❌ 前端無法連接後端"

echo -e "\n📋 後端日誌（最後 20 行）："
docker compose logs --tail=20 backend

echo -e "\n📋 前端日誌（最後 20 行）："
docker compose logs --tail=20 frontend

echo -e "\n🗄️ 檢查資料庫中的數據："
docker compose exec postgres psql -U labuser -d psychology_lab -c "
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Projects:', COUNT(*) FROM projects
UNION ALL
SELECT 'Participants:', COUNT(*) FROM participants;"

echo -e "\n✅ 診斷完成"
