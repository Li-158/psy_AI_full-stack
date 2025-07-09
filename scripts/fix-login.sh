#!/bin/bash

echo "🔍 診斷登入問題"
echo "==============="

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

echo -e "\n1️⃣ 檢查容器狀態："
docker compose ps

echo -e "\n2️⃣ 測試後端 API 健康檢查："
curl -s http://localhost:3002/api/health | jq . || echo "❌ API 無法訪問"

echo -e "\n3️⃣ 檢查資料庫中的用戶："
docker compose exec postgres psql -U labuser -d psychology_lab -c "
SELECT email, role, CASE WHEN password_hash IS NOT NULL THEN '有密碼' ELSE '無密碼' END as password_status 
FROM users;"

echo -e "\n4️⃣ 測試登入 API："
echo "測試帳號: admin@lab.com / admin123"
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.com","password":"admin123"}' \
  -v

echo -e "\n5️⃣ 查看後端最新日誌："
docker compose logs --tail=30 backend | grep -E "(error|Error|login|Login|auth)"

echo -e "\n6️⃣ 重置管理員密碼為 admin123："
docker compose exec postgres psql -U labuser -d psychology_lab -c "
UPDATE users 
SET password_hash = '\$2a\$10\$rOt0qKzKzwKfnKZAD6tZc.XtCjKGCq1AhbKvUfLJ7nQYvC1XGhqVa'
WHERE email = 'admin@lab.com';
SELECT '密碼已重置為 admin123' as message;"

echo -e "\n✅ 診斷完成"
