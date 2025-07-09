#!/bin/bash

echo "🔍 深入診斷密碼驗證問題"
echo "====================="

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 1. 檢查用戶是否存在
echo "1️⃣ 檢查資料庫中的用戶："
docker compose exec postgres psql -U labuser -d psychology_lab -c "
SELECT id, email, password_hash, role 
FROM users 
WHERE email = 'admin@lab.com' OR email = 'admin@lab.com';"

# 2. 檢查所有用戶
echo -e "\n2️⃣ 列出所有用戶："
docker compose exec postgres psql -U labuser -d psychology_lab -c "
SELECT email, role FROM users;"

# 3. 創建測試腳本來驗證密碼
echo -e "\n3️⃣ 在後端容器中測試密碼驗證："
docker compose exec backend node -e "
const bcrypt = require('bcryptjs');

// 測試密碼
const password = 'admin123';
const hash = '\$2a\$10\$rOt0qKzKzwKfnKZAD6tZc.XtCjKGCq1AhbKvUfLJ7nQYvC1XGhqVa';

console.log('密碼:', password);
console.log('雜湊:', hash);
console.log('驗證結果:', bcrypt.compareSync(password, hash));

// 生成新的雜湊
const newHash = bcrypt.hashSync(password, 10);
console.log('新雜湊:', newHash);
console.log('新雜湊驗證:', bcrypt.compareSync(password, newHash));
"

# 4. 直接在資料庫中插入測試用戶
echo -e "\n4️⃣ 創建新的測試用戶："
NEW_HASH=$(docker compose exec backend node -e "
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('admin123', 10));
" | tail -1)

echo "生成的新雜湊: $NEW_HASH"

docker compose exec postgres psql -U labuser -d psychology_lab << EOF
-- 刪除所有 admin 用戶
DELETE FROM users WHERE email LIKE '%admin%';

-- 插入新用戶
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@lab.com', '$NEW_HASH', 'admin');

-- 確認
SELECT email, substring(password_hash, 1, 20) as hash_prefix, role 
FROM users WHERE email = 'admin@lab.com';
EOF

# 5. 測試新的登入
echo -e "\n5️⃣ 測試新的登入："
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.com","password":"admin123"}' \
  -s | jq . || curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.com","password":"admin123"}' -s

echo -e "\n✅ 診斷完成"
