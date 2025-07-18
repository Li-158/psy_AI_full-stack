# 心理學實驗室系統 - 前端與後端 API 整合測試指南

## 系統架構概覽

### 技術堆疊
- **前端**: React.js (Port 3000)
- **後端**: FastAPI (Port 3001)
- **資料庫**: PostgreSQL (Port 5432)
- **容器化**: Docker Compose

### API 架構
```
前端 (React) 
    ↓ HTTP/REST API
後端 (FastAPI)
    ↓ SQL
資料庫 (PostgreSQL)
```

## 測試步驟

### 1. 啟動系統
```bash
cd /Users/wanglisheng/Desktop/project/psychology-lab-system
./start-system.sh
```

### 2. 執行 API 測試腳本
```bash
# 基本連接測試
chmod +x test_api_connection.sh
./test_api_connection.sh

# 同意書版本功能測試
chmod +x test_consent_versions.sh
./test_consent_versions.sh
```

### 3. 前端手動測試流程

#### A. 登入測試
1. 開啟瀏覽器訪問 http://localhost:3000
2. 使用管理員帳號登入：
   - Email: admin@psychologylab.com
   - Password: admin123
3. 確認成功進入系統主頁

#### B. 同意書版本管理測試
1. 點擊側邊欄的「專案管理」
2. 在任一計畫名稱旁，查看目前的同意書版本
3. 點擊文件圖標 (📄) 開啟同意書版本管理視窗
4. 測試功能：
   - **新增版本**: 點擊「新增同意書版本」，輸入版本名稱（如 v1.0）和說明
   - **編輯版本**: 點擊編輯圖標，修改版本資訊
   - **啟用/停用**: 勾選或取消「啟用此版本」
   - **刪除版本**: 點擊刪除圖標（注意：已被使用的版本無法刪除）

#### C. 參與者專案管理測試
1. 點擊側邊欄的「參與者管理」
2. 選擇或新增一個參與者
3. 在參與者詳情中，點擊「新增參與計畫」
4. 選擇計畫和子計畫
5. 展開計畫狀態卡片，確認「同意書版本」顯示該計畫的可用版本
6. 勾選參與者簽署的同意書版本

## API 端點清單

### 認證相關
- `POST /api/auth/login` - 登入
- `POST /api/auth/logout` - 登出

### 專案管理
- `GET /api/projects` - 獲取專案列表
- `POST /api/projects` - 創建專案
- `GET /api/projects/{id}` - 獲取專案詳情
- `PUT /api/projects/{id}` - 更新專案
- `DELETE /api/projects/{id}` - 刪除專案

### 同意書版本管理
- `GET /api/projects/{project_id}/consent-versions` - 獲取同意書版本列表
- `POST /api/projects/{project_id}/consent-versions` - 創建同意書版本
- `PUT /api/projects/{project_id}/consent-versions/{version_id}` - 更新版本
- `DELETE /api/projects/{project_id}/consent-versions/{version_id}` - 刪除版本

### 專案參與者管理
- `GET /api/projects/{project_id}/participants` - 獲取專案參與者
- `POST /api/projects/{project_id}/participants` - 加入參與者
- `PUT /api/projects/{project_id}/participants/{id}` - 更新參與者狀態
- `DELETE /api/projects/{project_id}/participants/{id}` - 移除參與者

## 資料流程圖

```
1. 計畫管理員創建同意書版本
   前端 → POST /api/projects/{id}/consent-versions → 資料庫 (consent_versions)

2. 參與者加入計畫
   前端 → POST /api/projects/{id}/participants → 資料庫 (project_participants)
   
3. 記錄參與者簽署的版本
   前端 → 包含 consent_version_ids → 資料庫 (participant_consent_versions)
```

## 常見問題排查

### 1. API 連接失敗
- 檢查後端容器是否運行：`docker ps`
- 查看後端日誌：`docker logs psychology_lab_backend`
- 確認環境變數：`cat .env`

### 2. 同意書版本未顯示
- 檢查瀏覽器控制台錯誤
- 確認 localStorage 中有 token
- 使用開發者工具查看 Network 請求

### 3. 資料庫連接問題
- 檢查 PostgreSQL 容器：`docker logs psychology_lab_db`
- 驗證資料表存在：
  ```bash
  docker exec -it psychology_lab_db psql -U psychologylab -d psychologylab -c '\dt'
  ```

### 4. 前端無法載入
- 清除瀏覽器快取
- 檢查前端容器：`docker logs psychology_lab_frontend`
- 確認 port 3000 未被占用

## 開發除錯工具

### 查看即時日誌
```bash
# 所有服務日誌
docker-compose logs -f

# 特定服務日誌
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 直接查詢資料庫
```bash
# 進入 PostgreSQL
docker exec -it psychology_lab_db psql -U psychologylab -d psychologylab

# 查看同意書版本
SELECT * FROM consent_versions;

# 查看專案參與者
SELECT * FROM project_participants;

# 查看參與者簽署的版本
SELECT * FROM participant_consent_versions;
```

### API 測試工具
使用 Postman 或 curl 測試 API：

```bash
# 獲取 token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@psychologylab.com","password":"admin123"}' \
  | jq -r '.token')

# 使用 token 呼叫 API
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/projects
```

## 成功指標

✅ 系統成功整合的標誌：
1. 能夠登入系統
2. 專案列表正確顯示
3. 同意書版本可以 CRUD 操作
4. 參與者可以選擇同意書版本
5. 資料正確儲存到資料庫
6. 重新整理頁面後資料保持不變
