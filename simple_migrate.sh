#!/bin/bash

# 簡單直接的遷移腳本

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

echo "=== 執行同意書版本資料庫遷移 ==="

# 使用正確的使用者名稱執行 SQL
docker exec -i psychology_lab_db psql -U psychologylab -d psychologylab << 'EOF'
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
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_consent_versions_updated_at') THEN
        CREATE TRIGGER update_consent_versions_updated_at BEFORE UPDATE ON consent_versions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_participants_updated_at') THEN
        CREATE TRIGGER update_project_participants_updated_at BEFORE UPDATE ON project_participants
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_participant_consent_versions_updated_at') THEN
        CREATE TRIGGER update_participant_consent_versions_updated_at BEFORE UPDATE ON participant_consent_versions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 顯示成功訊息
SELECT 'Migration completed successfully!' as message;
EOF

if [ $? -eq 0 ]; then
    echo "✅ 資料庫遷移成功！"
    echo "正在重啟後端服務..."
    docker restart psychology_lab_backend
    echo "✅ 完成！您現在可以使用同意書版本管理功能了。"
else
    echo "❌ 遷移失敗"
fi
