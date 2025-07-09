#!/bin/bash

echo "🔍 完整診斷前後端連接問題"
echo "========================="

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 步驟 1: 檢查服務狀態
echo -e "\n1️⃣ 檢查 Docker 服務狀態："
docker compose ps

# 步驟 2: 測試後端健康檢查
echo -e "\n2️⃣ 測試後端 API 健康檢查："
curl -s http://localhost:3002/api/health | jq . || echo "❌ 後端 API 無法訪問"

# 步驟 3: 直接測試登入 API
echo -e "\n3️⃣ 直接測試登入 API："
echo "發送登入請求到 http://localhost:3002/api/auth/login"
LOGIN_RESPONSE=$(curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.com","password":"admin123"}' \
  -w "\nHTTP Status: %{http_code}" \
  -s)
echo "$LOGIN_RESPONSE"

# 步驟 4: 檢查資料庫用戶
echo -e "\n4️⃣ 檢查資料庫中的管理員用戶："
docker compose exec postgres psql -U labuser -d psychology_lab -c "
SELECT email, role, 
       CASE WHEN password_hash IS NOT NULL THEN '有密碼' ELSE '無密碼' END as has_password,
       created_at
FROM users 
WHERE email = 'admin@lab.com';"

# 步驟 5: 重置管理員密碼
echo -e "\n5️⃣ 重置管理員密碼為 admin123："
docker compose exec postgres psql -U labuser -d psychology_lab -c "
UPDATE users 
SET password_hash = '\$2a\$10\$rOt0qKzKzwKfnKZAD6tZc.XtCjKGCq1AhbKvUfLJ7nQYvC1XGhqVa'
WHERE email = 'admin@lab.com';
SELECT '✅ 密碼已重置' as status;"

# 步驟 6: 再次測試登入
echo -e "\n6️⃣ 再次測試登入 API："
LOGIN_TEST=$(curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.com","password":"admin123"}' \
  -s)
echo "$LOGIN_TEST" | jq . || echo "$LOGIN_TEST"

# 步驟 7: 檢查後端日誌
echo -e "\n7️⃣ 檢查後端最近的日誌："
docker compose logs --tail=20 backend | grep -E "(Starting|PORT|DATABASE|Error|error|login)"

# 步驟 8: 重建服務
echo -e "\n8️⃣ 重建前後端服務..."
docker compose build backend frontend
docker compose up -d

echo -e "\n✅ 診斷完成！"
echo "========================="
echo "請訪問 http://localhost:3000"
echo "使用 admin@lab.com / admin123 登入"
echo ""
echo "如果還是無法登入，請檢查瀏覽器控制台的錯誤信息"
