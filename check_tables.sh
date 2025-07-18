#!/bin/bash

# 檢查同意書版本相關資料表是否存在

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

echo "=== 檢查同意書版本資料表 ==="

docker exec -i psychology_lab_db psql -U psychologylab -d psychologylab << 'EOF'
-- 檢查資料表是否存在
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('consent_versions', 'project_participants', 'participant_consent_versions') 
        THEN '✅ 已創建'
        ELSE '❌ 未找到'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('consent_versions', 'project_participants', 'participant_consent_versions')
ORDER BY table_name;

-- 如果資料表存在，顯示結構
\d consent_versions
\d project_participants
\d participant_consent_versions
EOF
