-- Psychology Lab System Seed Data
-- 心理學實驗室系統種子資料

-- 清除現有資料（開發環境使用）
-- TRUNCATE TABLE experiments, project_researchers, subprojects, projects, participants, researchers, users CASCADE;

-- 插入管理員用戶
-- 密碼：admin123 (需要使用實際加密後的密碼)
INSERT INTO users (id, email, password_hash, role) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@psychologylab.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtOuHqN2J.Gm8OuKZj5kXn6E7gSm', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 插入研究員用戶
-- 密碼：researcher123
INSERT INTO users (id, email, password_hash, role) VALUES 
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'researcher1@psychologylab.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtOuHqN2J.Gm8OuKZj5kXn6E7gSm', 'researcher'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'researcher2@psychologylab.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtOuHqN2J.Gm8OuKZj5kXn6E7gSm', 'researcher')
ON CONFLICT (email) DO NOTHING;

-- 插入研究員資料
INSERT INTO researchers (id, user_id, name, email, department, position, phone, bio) VALUES 
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Dr. Jane Smith', 'researcher1@psychologylab.com', 'Cognitive Psychology', 'Senior Researcher', '+1-555-0101', 'Specializes in cognitive behavioral research and experimental design.'),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Dr. John Doe', 'researcher2@psychologylab.com', 'Social Psychology', 'Research Associate', '+1-555-0102', 'Focuses on social cognition and group behavior studies.')
ON CONFLICT (user_id) DO NOTHING;

-- 插入示例參與者
INSERT INTO participants (id, name, gender, email, phone, birth_date, address, status) VALUES 
('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Alice Johnson', 'female', 'alice.johnson@example.com', '+1-555-1001', '1995-03-15', '123 Main St, City, State 12345', 'active'),
('05eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Bob Williams', 'male', 'bob.williams@example.com', '+1-555-1002', '1992-07-22', '456 Oak Ave, City, State 12345', 'active'),
('15eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Carol Davis', 'female', 'carol.davis@example.com', '+1-555-1003', '1998-11-08', '789 Pine Rd, City, State 12345', 'active'),
('25eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'David Brown', 'male', 'david.brown@example.com', '+1-555-1004', '1990-01-30', '321 Elm St, City, State 12345', 'completed'),
('35eebc99-9c0b-4ef8-bb6d-6bb9bd380aaa', 'Eva Martinez', 'female', NULL, '+1-555-1005', '1996-09-12', '654 Maple Dr, City, State 12345', 'active')
ON CONFLICT (email) DO NOTHING;

-- 插入示例專案
INSERT INTO projects (id, project_number, title, description, start_date, end_date, status) VALUES 
('45eebc99-9c0b-4ef8-bb6d-6bb9bd380bbb', 'PROJ-2024-001', 'Cognitive Load and Memory Performance', 'A comprehensive study examining the relationship between cognitive load and memory performance in different age groups.', '2024-01-15', '2024-12-31', 'active'),
('55eebc99-9c0b-4ef8-bb6d-6bb9bd380ccc', 'PROJ-2024-002', 'Social Media Impact on Attention', 'Research investigating how social media usage affects attention span and concentration abilities.', '2024-03-01', '2024-11-30', 'active'),
('65eebc99-9c0b-4ef8-bb6d-6bb9bd380ddd', 'PROJ-2023-003', 'Sleep Patterns and Learning', 'Analysis of sleep pattern effects on learning and retention capabilities.', '2023-09-01', '2024-02-28', 'completed')
ON CONFLICT (project_number) DO NOTHING;

-- 插入示例子專案
INSERT INTO subprojects (id, project_id, subproject_number, title, description, status) VALUES 
('75eebc99-9c0b-4ef8-bb6d-6bb9bd380eee', '45eebc99-9c0b-4ef8-bb6d-6bb9bd380bbb', 'SUB-001-A', 'Young Adults Memory Study', 'Memory performance analysis in participants aged 18-25', 'active'),
('85eebc99-9c0b-4ef8-bb6d-6bb9bd380fff', '45eebc99-9c0b-4ef8-bb6d-6bb9bd380bbb', 'SUB-001-B', 'Elderly Memory Study', 'Memory performance analysis in participants aged 65+', 'planning'),
('95eebc99-9c0b-4ef8-bb6d-6bb9bd380ggg', '55eebc99-9c0b-4ef8-bb6d-6bb9bd380ccc', 'SUB-002-A', 'Attention Span Measurement', 'Baseline attention span measurement before social media exposure', 'active'),
('a5eebc99-9c0b-4ef8-bb6d-6bb9bd380hhh', '65eebc99-9c0b-4ef8-bb6d-6bb9bd380ddd', 'SUB-003-A', 'Sleep Quality Assessment', 'Comprehensive sleep quality evaluation using wearable devices', 'completed')
ON CONFLICT (project_id, subproject_number) DO NOTHING;

-- 插入專案研究員關聯
INSERT INTO project_researchers (project_id, researcher_id, role) VALUES 
('45eebc99-9c0b-4ef8-bb6d-6bb9bd380bbb', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'principal_investigator'),
('55eebc99-9c0b-4ef8-bb6d-6bb9bd380ccc', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'principal_investigator'),
('65eebc99-9c0b-4ef8-bb6d-6bb9bd380ddd', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'co_investigator'),
('45eebc99-9c0b-4ef8-bb6d-6bb9bd380bbb', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'researcher')
ON CONFLICT (project_id, researcher_id) DO NOTHING;

-- 插入示例實驗記錄
INSERT INTO experiments (id, subproject_id, participant_id, researcher_id, experiment_date, start_time, end_time, status, notes, data_collected) VALUES 
('b5eebc99-9c0b-4ef8-bb6d-6bb9bd380iii', '75eebc99-9c0b-4ef8-bb6d-6bb9bd380eee', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '2024-02-15', '09:00:00', '10:30:00', 'completed', 'Participant showed good engagement. All memory tasks completed successfully.', true),
('c5eebc99-9c0b-4ef8-bb6d-6bb9bd380jjj', '75eebc99-9c0b-4ef8-bb6d-6bb9bd380eee', '05eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '2024-02-16', '14:00:00', '15:30:00', 'completed', 'Minor technical issues with equipment, but data collection was successful.', true),
('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380kkk', '95eebc99-9c0b-4ef8-bb6d-6bb9bd380ggg', '15eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '2024-03-10', '10:00:00', '11:00:00', 'scheduled', 'Initial attention baseline measurement session.', false),
('e5eebc99-9c0b-4ef8-bb6d-6bb9bd380lll', 'a5eebc99-9c0b-4ef8-bb6d-6bb9bd380hhh', '25eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '2024-01-20', '19:00:00', '07:00:00', 'completed', 'Full night sleep monitoring completed. Excellent data quality.', true)
ON CONFLICT DO NOTHING;

-- 更新序列（如果使用序列的話）
-- SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));

-- 顯示插入結果統計
SELECT 
    'users' as table_name, 
    COUNT(*) as record_count 
FROM users
UNION ALL
SELECT 
    'researchers' as table_name, 
    COUNT(*) as record_count 
FROM researchers
UNION ALL
SELECT 
    'participants' as table_name, 
    COUNT(*) as record_count 
FROM participants
UNION ALL
SELECT 
    'projects' as table_name, 
    COUNT(*) as record_count 
FROM projects
UNION ALL
SELECT 
    'subprojects' as table_name, 
    COUNT(*) as record_count 
FROM subprojects
UNION ALL
SELECT 
    'project_researchers' as table_name, 
    COUNT(*) as record_count 
FROM project_researchers
UNION ALL
SELECT 
    'experiments' as table_name, 
    COUNT(*) as record_count 
FROM experiments
ORDER BY table_name;
