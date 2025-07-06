-- 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 創建使用者表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'researcher')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建實驗人員表
CREATE TABLE IF NOT EXISTS researchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(20),
    profile_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建參與者表
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    address TEXT,
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'withdrawn')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建計畫表
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) CHECK (status IN ('planning', 'active', 'completed', 'suspended')) DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建子計畫表
CREATE TABLE IF NOT EXISTS subprojects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    subproject_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) CHECK (status IN ('planning', 'active', 'completed', 'suspended')) DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, subproject_number)
);

-- 創建實驗人員-子計畫關聯表
CREATE TABLE IF NOT EXISTS researcher_subprojects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    researcher_id UUID REFERENCES researchers(id) ON DELETE CASCADE,
    subproject_id UUID REFERENCES subprojects(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'researcher',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(researcher_id, subproject_id)
);

-- 創建參與紀錄表
CREATE TABLE IF NOT EXISTS participation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    subproject_id UUID REFERENCES subprojects(id) ON DELETE CASCADE,
    participation_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'no_show', 'cancelled')) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_subprojects_project_id ON subprojects(project_id);
CREATE INDEX IF NOT EXISTS idx_participation_history_participant_id ON participation_history(participant_id);
CREATE INDEX IF NOT EXISTS idx_participation_history_subproject_id ON participation_history(subproject_id);
CREATE INDEX IF NOT EXISTS idx_researcher_subprojects_researcher_id ON researcher_subprojects(researcher_id);

-- 創建更新時間戳觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為表添加更新時間戳觸發器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_researchers_updated_at BEFORE UPDATE ON researchers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subprojects_updated_at BEFORE UPDATE ON subprojects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默認管理員帳號
-- 密碼: admin123 (已雜湊)
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@lab.com', '$2a$10$rOt0qKzKzwKfnKZAD6tZc.XtCjKGCq1AhbKvUfLJ7nQYvC1XGhqVa', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 插入示例計畫資料
INSERT INTO projects (project_number, title, description, status) VALUES
('PROJ001', '認知行為研究計畫', '探討人類認知行為的神經機制', 'active'),
('PROJ002', '兒童發展追蹤研究', '長期追蹤兒童認知發展軌跡', 'active')
ON CONFLICT (project_number) DO NOTHING;

-- 插入示例子計畫
INSERT INTO subprojects (project_id, subproject_number, title, description) 
SELECT p.id, '空間距離判斷', '空間距離判斷實驗', '研究空間認知能力'
FROM projects p WHERE p.project_number = 'PROJ001'
ON CONFLICT (project_id, subproject_number) DO NOTHING;

INSERT INTO subprojects (project_id, subproject_number, title, description) 
SELECT p.id, '臉孔辨識', '臉孔辨識實驗', '研究人臉辨識的神經機制'
FROM projects p WHERE p.project_number = 'PROJ001'
ON CONFLICT (project_id, subproject_number) DO NOTHING;

INSERT INTO subprojects (project_id, subproject_number, title, description) 
SELECT p.id, '語言發展評估', '語言發展評估實驗', '評估兒童語言發展能力'
FROM projects p WHERE p.project_number = 'PROJ002'
ON CONFLICT (project_id, subproject_number) DO NOTHING;

-- 顯示創建結果
\echo '✅ 資料庫初始化完成！'
\echo '📊 已創建的表格：'
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
