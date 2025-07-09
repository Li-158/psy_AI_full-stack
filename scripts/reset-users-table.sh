#!/bin/bash

echo "🔄 完全重置用戶表"
echo "================"

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 重置用戶表
docker compose exec postgres psql -U labuser -d psychology_lab << 'EOF'
-- 刪除所有用戶
TRUNCATE TABLE users CASCADE;

-- 重新執行初始化腳本的用戶部分
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@lab.com', '$2a$10$rOt0qKzKzwKfnKZAD6tZc.XtCjKGCq1AhbKvUfLJ7nQYvC1XGhqVa', 'admin');

-- 確認結果
SELECT id, email, role, length(password_hash) as hash_length FROM users;
EOF

# 重啟後端
echo -e "\n重啟後端服務..."
docker compose restart backend

sleep 5

# 測試登入
echo -e "\n測試登入..."
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.com","password":"admin123"}' \
  -s | jq .

echo -e "\n如果還是失敗，請查看後端日誌："
echo "docker compose logs -f backend"
