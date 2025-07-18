-- Add consent versions table and update related tables
-- 新增同意書版本表和更新相關表

-- 創建同意書版本表
CREATE TABLE IF NOT EXISTS consent_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, version_name)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_consent_versions_project_id ON consent_versions (project_id);
CREATE INDEX IF NOT EXISTS idx_consent_versions_active ON consent_versions (is_active);

-- 創建專案參與者表（用於儲存參與者在專案中的狀態）
CREATE TABLE IF NOT EXISTS project_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    participant_project_id VARCHAR(100),
    participant_subproject_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
    join_date DATE,
    termination_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, participant_id)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_project_participants_project_id ON project_participants (project_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_participant_id ON project_participants (participant_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_status ON project_participants (status);

-- 創建參與者同意書版本關聯表
CREATE TABLE IF NOT EXISTS participant_consent_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_participant_id UUID NOT NULL REFERENCES project_participants(id) ON DELETE CASCADE,
    consent_version_id UUID NOT NULL REFERENCES consent_versions(id) ON DELETE CASCADE,
    signed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_participant_id, consent_version_id)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_participant_consent_versions_pp_id ON participant_consent_versions (project_participant_id);
CREATE INDEX IF NOT EXISTS idx_participant_consent_versions_cv_id ON participant_consent_versions (consent_version_id);

-- 為新表創建更新時間觸發器
CREATE TRIGGER update_consent_versions_updated_at BEFORE UPDATE ON consent_versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_participants_updated_at BEFORE UPDATE ON project_participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participant_consent_versions_updated_at BEFORE UPDATE ON participant_consent_versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入一些預設的同意書版本作為示例（可選）
-- INSERT INTO consent_versions (project_id, version_name, description) 
-- SELECT id, 'v1.0', '初始版本' FROM projects WHERE project_number = 'YOUR_PROJECT_NUMBER';
