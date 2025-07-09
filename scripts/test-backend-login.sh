#!/bin/bash

echo "🔍 檢查後端登入邏輯"
echo "=================="

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 創建測試登入腳本
cat > /tmp/test-login.js << 'EOF'
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function testLogin() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    // 查詢用戶
    const email = 'admin@lab.com';
    const password = 'admin123';
    
    console.log('\n查詢用戶:', email);
    const result = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    console.log('查詢結果數量:', result.rows.length);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('用戶 ID:', user.id);
      console.log('用戶 Email:', user.email);
      console.log('用戶角色:', user.role);
      console.log('密碼雜湊存在:', !!user.password_hash);
      console.log('密碼雜湊長度:', user.password_hash ? user.password_hash.length : 0);
      
      if (user.password_hash) {
        console.log('\n開始密碼驗證...');
        const isValid = await bcrypt.compare(password, user.password_hash);
        console.log('密碼驗證結果:', isValid);
        
        // 嘗試同步驗證
        const isValidSync = bcrypt.compareSync(password, user.password_hash);
        console.log('同步驗證結果:', isValidSync);
        
        // 測試生成新雜湊並驗證
        console.log('\n測試新雜湊...');
        const newHash = bcrypt.hashSync(password, 10);
        console.log('新雜湊:', newHash);
        console.log('新雜湊驗證:', bcrypt.compareSync(password, newHash));
      }
    } else {
      console.log('❌ 找不到用戶');
    }
  } catch (error) {
    console.error('錯誤:', error);
  } finally {
    await pool.end();
  }
}

testLogin();
EOF

# 在後端容器中執行測試
echo "在後端容器中執行測試..."
docker compose exec backend node /tmp/test-login.js

echo -e "\n✅ 測試完成"
