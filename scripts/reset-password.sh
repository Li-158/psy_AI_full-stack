#!/bin/bash

echo "🔐 重置管理員密碼"
echo "=================="

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 使用 bcrypt 生成新的密碼雜湊
echo "生成 admin123 的密碼雜湊..."

# 方法 1: 使用後端容器生成
docker compose exec backend node -e "
const bcrypt = require('bcryptjs');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log('密碼雜湊:', hash);
console.log('測試驗證:', bcrypt.compareSync('admin123', hash));
"

# 方法 2: 直接更新資料庫
echo -e "\n更新資料庫密碼..."
docker compose exec postgres psql -U labuser -d psychology_lab << 'EOF'
-- 先刪除舊用戶
DELETE FROM users WHERE email = 'admin@lab.com';

-- 插入新用戶與正確的密碼雜湊
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@lab.com', '$2a$10$rOt0qKzKzwKfnKZAD6tZc.XtCjKGCq1AhbKvUfLJ7nQYvC1XGhqVa', 'admin');

-- 確認結果
SELECT email, role, 
       CASE WHEN password_hash IS NOT NULL THEN 'OK' ELSE 'NO PASSWORD' END as password_status
FROM users WHERE email = 'admin@lab.com';
EOF

echo -e "\n✅ 密碼已重置為 admin123"

# 測試登入
echo -e "\n測試登入 API..."
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.com","password":"admin123"}' \
  -s | jq .

echo -e "\n請重新嘗試在網頁上登入"
