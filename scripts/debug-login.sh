#!/bin/bash

echo "🔧 臨時修改後端以調試登入問題"
echo "============================"

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 創建一個簡單的測試路由
cat > /tmp/test-route.ts << 'EOF'
// 添加測試路由 - 僅用於調試
app.post('/api/auth/test-login', async (req: Request, res: Response) => {
  console.log('🧪 測試登入路由');
  
  try {
    // 直接查詢用戶
    const result = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@lab.com']);
    
    if (result.rows.length === 0) {
      // 創建測試用戶
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync('admin123', 10);
      
      await pool.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password_hash = $2',
        ['admin@lab.com', hash, 'admin']
      );
      
      return res.json({ message: '已創建測試用戶，請重新登入' });
    }
    
    // 生成 token
    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      debug: '測試登入成功'
    });
  } catch (error) {
    console.error('測試登入錯誤:', error);
    res.status(500).json({ error: error.message });
  }
});
EOF

echo "測試步驟："
echo "1. 重啟後端服務"
echo "2. 使用測試 API：curl -X POST http://localhost:3002/api/auth/test-login"
echo "3. 如果成功，說明是密碼驗證的問題"

# 查看後端日誌
echo -e "\n查看後端最新日誌："
docker compose logs --tail=50 backend | grep -E "(Login attempt|User found|Password|error)"

echo -e "\n✅ 完成"
