import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DATABASE_URL = process.env.DATABASE_URL;


console.log('🚀 Starting server...');
console.log('PORT:', PORT);
console.log('DATABASE_URL:', DATABASE_URL ? 'Set' : 'Not set');

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is required');
  process.exit(1);
}

// 建立資料庫連線池 - 修改配置
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false, // 確保不使用 SSL
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// 測試資料庫連接
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

// 立即測試連接
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Initial database connection successful');
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database query test successful:', result.rows[0]);
    client.release();
  } catch (error) {
    console.error('❌ Initial database connection failed:', error);
  }
})();

const app = express();

// 中間件
app.use(helmet());
// 更寬鬆的 CORS 設定（生產環境請修改）
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// API 請求頻率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// 型別定義
interface User {
  id: string;
  email: string;
  role: 'admin' | 'researcher';
  researcherId?: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

// 錯誤處理函數
const handleDatabaseError = (error: unknown) => {
  console.error('Database error:', error);
  return { status: 500, message: 'Database error: ' + (error as Error).message };
};

// JWT 驗證中間件
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const userQuery = `
      SELECT u.id, u.email, u.role, r.id as researcher_id
      FROM users u
      LEFT JOIN researchers r ON u.id = r.user_id
      WHERE u.id = $1
    `;
    
    const userResult = await pool.query(userQuery, [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = {
      id: userResult.rows[0].id,
      email: userResult.rows[0].email,
      role: userResult.rows[0].role,
      researcherId: userResult.rows[0].researcher_id,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
};

// 健康檢查 - 改善的版本
app.get('/api/health', async (req: Request, res: Response) => {
  console.log('🏥 Health check requested');
  
  try {
    // 測試資料庫連接
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, version() as version');
    client.release();
    
    console.log('✅ Health check: Database connected');
    
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString(),
      database_time: result.rows[0].time,
      server_info: 'Psychology Lab API v1.0'
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

// 登入
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', email);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const userQuery = `
      SELECT u.id, u.email, u.password_hash, u.role, r.id as researcher_id
      FROM users u
      LEFT JOIN researchers r ON u.id = r.user_id
      WHERE u.email = $1
    `;
    
    const result = await pool.query(userQuery, [email.toLowerCase()]);
    
    console.log('📊 User found:', result.rows.length > 0 ? 'Yes' : 'No');
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log('🔒 Password hash exists:', !!user.password_hash);
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('✅ Password valid:', isValid);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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
        role: user.role,
        researcherId: user.researcher_id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    const errorInfo = handleDatabaseError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// 獲取個人資料
app.get('/api/auth/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// 獲取參與者列表
app.get('/api/participants', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = 'SELECT * FROM participants ORDER BY created_at DESC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get participants error:', error);
    const errorInfo = handleDatabaseError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// 新增參與者
app.post('/api/participants', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { name, gender, email, phone, birthDate, address, status } = req.body;

  if (!name || !gender || !phone || !birthDate) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const query = `
      INSERT INTO participants (name, gender, email, phone, birth_date, address, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, gender, email || null, phone, birthDate, address || null, status || 'active'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create participant error:', error);
    const errorInfo = handleDatabaseError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// 🆕 公開端點 - 新增參與者
app.post('/api/participants/public', async (req: Request, res: Response) => {
  const { name, gender, email, phone, birth_date, birthDate, address, status } = req.body;
  const actualBirthDate = birth_date || birthDate;

  if (!name || !gender || !phone || !actualBirthDate) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const query = `
      INSERT INTO participants (name, gender, email, phone, birth_date, address, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, gender, email || null, phone, actualBirthDate, address || null, status || 'active'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create participant error:', error);
    const errorInfo = handleDatabaseError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// 獲取計畫列表
app.get('/api/projects', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = 'SELECT * FROM projects ORDER BY created_at DESC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    const errorInfo = handleDatabaseError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// 🆕 公開端點 - 獲取計畫列表
app.get('/api/projects/public', async (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM projects ORDER BY created_at DESC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    const errorInfo = handleDatabaseError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// 🆕 公開端點 - 新增計畫
app.post('/api/projects/public', async (req: Request, res: Response) => {
  const { project_number, title, description, status } = req.body;

  if (!project_number || !title) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const query = `
      INSERT INTO projects (project_number, title, description, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      project_number, title, description || null, status || 'active'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    const errorInfo = handleDatabaseError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// 🆕 公開端點 - 刪除參與者
app.delete('/api/participants/public/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM participants WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    res.json({ message: 'Participant deleted successfully' });
  } catch (error) {
    console.error('Delete participant error:', error);
    const errorInfo = handleDatabaseError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// 🆕 公開端點 - 獲取子計畫列表
app.get('/api/subprojects/public', async (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM subprojects ORDER BY created_at DESC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get subprojects error:', error);
    const errorInfo = handleDatabaseError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// 🆕 公開端點 - 新增子計畫
app.post('/api/subprojects/public', async (req: Request, res: Response) => {
  const { project_id, subproject_number, title, description, status } = req.body;

  if (!project_id || !subproject_number || !title) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const query = `
      INSERT INTO subprojects (project_id, subproject_number, title, description, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      project_id, subproject_number, title, description || null, status || 'active'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create subproject error:', error);
    const errorInfo = handleDatabaseError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// 錯誤處理
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 處理
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// 啟動伺服器
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

// 優雅關閉
const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down server...');
  server.close(async () => {
    try {
      await pool.end();
      console.log('✅ Server closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Shutdown error:', error);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
