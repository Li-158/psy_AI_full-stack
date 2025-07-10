# Psychology Lab System - Python Backend

心理學實驗室管理系統的 Python FastAPI 後端服務。

## 🚀 快速開始

### 先決條件

- Python 3.11+
- PostgreSQL 12+
- Git

### 安裝方式

#### 方式 1: 使用啟動腳本（推薦）

```bash
# 克隆專案
git clone <repository-url>
cd psychology-lab-system/backend-python

# 運行啟動腳本
chmod +x start.sh
./start.sh
```

#### 方式 2: 手動安裝

```bash
# 創建虛擬環境
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# 或 .venv\Scripts\activate  # Windows

# 安裝依賴
pip install -r requirements.txt

# 配置環境變數
cp .env.example .env
# 編輯 .env 文件設定資料庫連線

# 初始化資料庫
python scripts/init_database.py init

# 啟動服務
python main.py
```

#### 方式 3: 使用 Docker（推薦用於部署）

```bash
# 啟動所有服務（包含資料庫）
docker-compose up -d

# 僅啟動後端（需要外部資料庫）
docker-compose up backend

# 包含 pgAdmin 開發工具
docker-compose --profile dev up -d
```

## 📖 API 文檔

服務啟動後，可在以下地址查看 API 文檔：

- **Swagger UI**: http://localhost:3001/docs
- **ReDoc**: http://localhost:3001/redoc
- **健康檢查**: http://localhost:3001/health

## 🏗️ 專案結構

```
backend-python/
├── app/
│   ├── __init__.py
│   ├── config.py          # 配置設定
│   ├── database.py        # 資料庫連接
│   ├── auth.py           # 認證與授權
│   ├── schemas.py        # Pydantic 模型
│   └── routers/          # API 路由
│       ├── auth.py       # 認證相關 API
│       ├── users.py      # 用戶管理 API
│       ├── researchers.py # 研究員管理 API
│       ├── participants.py # 參與者管理 API
│       ├── projects.py   # 專案管理 API
│       └── subprojects.py # 子專案管理 API
├── scripts/
│   ├── init_database.py  # 資料庫初始化腳本
│   ├── init_db.sql      # 資料庫架構
│   └── seed_data.sql    # 種子資料
├── main.py              # 應用程式入口
├── requirements.txt     # Python 依賴
├── Dockerfile          # Docker 映像檔
├── docker-compose.yml  # Docker Compose 設定
├── .env.example        # 環境變數範例
└── start.sh           # 啟動腳本
```

## 🔐 認證系統

系統使用 JWT (JSON Web Token) 進行認證：

### 默認帳戶

- **管理員**: admin@psychologylab.com / admin123
- **研究員**: researcher1@psychologylab.com / researcher123

⚠️ **重要**: 請在生產環境中更改默認密碼！

### 角色權限

- **admin**: 完整系統管理權限
- **researcher**: 研究相關功能權限

## 📊 資料庫架構

系統包含以下主要資料表：

- `users` - 用戶帳戶
- `researchers` - 研究員資料
- `participants` - 參與者資料
- `projects` - 研究專案
- `subprojects` - 子專案
- `experiments` - 實驗記錄（未來擴展）
- `project_researchers` - 專案研究員關聯（未來擴展）

## 🛠️ 開發工具

### 資料庫管理

```bash
# 檢查資料庫狀態
python scripts/init_database.py check

# 重置資料庫（危險操作）
python scripts/init_database.py reset

# 重新初始化
python scripts/init_database.py init
```

### 使用 pgAdmin

如果使用 Docker Compose 啟動：

```bash
# 啟動包含 pgAdmin 的開發環境
docker-compose --profile dev up -d
```

訪問 http://localhost:8080
- 帳號: admin@psychologylab.com
- 密碼: admin123

## 🚀 API 端點概覽

### 認證
- `POST /api/auth/login` - 用戶登入
- `GET /api/auth/profile` - 獲取當前用戶資料

### 用戶管理
- `GET /api/users/` - 獲取用戶列表（管理員）
- `POST /api/users/` - 創建用戶（管理員）
- `GET /api/users/me` - 獲取當前用戶資訊
- `PUT /api/users/{user_id}` - 更新用戶（管理員）
- `DELETE /api/users/{user_id}` - 刪除用戶（管理員）

### 研究員管理
- `GET /api/researchers/` - 獲取研究員列表
- `GET /api/researchers/{researcher_id}` - 獲取研究員資料
- `PUT /api/researchers/{researcher_id}` - 更新研究員資料
- `GET /api/researchers/me/profile` - 獲取個人資料
- `PUT /api/researchers/me/profile` - 更新個人資料

### 參與者管理
- `GET /api/participants/` - 獲取參與者列表
- `POST /api/participants/` - 創建參與者
- `GET /api/participants/{participant_id}` - 獲取參與者資料
- `PUT /api/participants/{participant_id}` - 更新參與者
- `DELETE /api/participants/{participant_id}` - 刪除參與者（管理員）

### 專案管理
- `GET /api/projects/` - 獲取專案列表
- `POST /api/projects/` - 創建專案
- `GET /api/projects/{project_id}` - 獲取專案資料
- `PUT /api/projects/{project_id}` - 更新專案
- `DELETE /api/projects/{project_id}` - 刪除專案（管理員）
- `GET /api/projects/{project_id}/subprojects` - 獲取子專案列表
- `POST /api/projects/{project_id}/subprojects` - 創建子專案

### 子專案管理
- `GET /api/subprojects/` - 獲取所有子專案
- `GET /api/subprojects/{subproject_id}` - 獲取子專案資料
- `PUT /api/subprojects/{subproject_id}` - 更新子專案
- `DELETE /api/subprojects/{subproject_id}` - 刪除子專案（管理員）

## 🔧 配置選項

### 環境變數

| 變數名 | 說明 | 默認值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 連接字串 | 必填 |
| `JWT_SECRET` | JWT 密鑰 | 必填 |
| `JWT_ALGORITHM` | JWT 演算法 | HS256 |
| `JWT_EXPIRATION_HOURS` | Token 過期時間（小時） | 24 |
| `APP_NAME` | 應用程式名稱 | Psychology Lab API |
| `DEBUG` | 除錯模式 | False |
| `HOST` | 服務主機 | 0.0.0.0 |
| `PORT` | 服務端口 | 3001 |
| `CORS_ORIGINS` | 允許的跨域來源 | localhost:3000 |

## 🧪 測試

```bash
# 安裝測試依賴
pip install pytest pytest-asyncio httpx

# 運行測試
pytest

# 運行測試並顯示覆蓋率
pytest --cov=app
```

## 📈 監控與日誌

### 健康檢查

系統提供健康檢查端點：

```bash
curl http://localhost:3001/health
```

### 日誌

應用程式日誌包含：
- 請求記錄
- 錯誤追蹤
- 資料庫操作
- 認證事件

## 🚀 部署

### 生產環境部署

1. **使用 Docker（推薦）**

```bash
# 建置映像檔
docker build -t psychology-lab-backend .

# 運行容器
docker run -d \
  --name psychology-lab-backend \
  -p 3001:3001 \
  -e DATABASE_URL=your-production-db-url \
  -e JWT_SECRET=your-production-jwt-secret \
  psychology-lab-backend
```

2. **傳統部署**

```bash
# 安裝依賴
pip install -r requirements.txt

# 設定環境變數
export DATABASE_URL=your-production-db-url
export JWT_SECRET=your-production-jwt-secret
export DEBUG=False

# 初始化資料庫
python scripts/init_database.py init

# 使用 Gunicorn 啟動
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### 環境建議

- **開發**: SQLite + 內建服務器
- **測試**: PostgreSQL + Docker
- **生產**: PostgreSQL + Gunicorn + Nginx + SSL

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

### 代碼風格

- 使用 Black 進行代碼格式化
- 遵循 PEP 8 規範
- 添加適當的類型提示
- 編寫測試用例

## 📄 授權

本專案使用 MIT 授權條款。詳見 [LICENSE](LICENSE) 文件。

## 🆘 支持

如有問題或需要協助，請：

1. 查看 [API 文檔](http://localhost:3001/docs)
2. 檢查 [Issues](https://github.com/your-repo/issues)
3. 聯絡開發團隊

## 📝 變更日誌

### v1.0.0 (2024-07-09)

- ✨ 初始版本發布
- 🔐 JWT 認證系統
- 👥 用戶與研究員管理
- 👤 參與者管理
- 📊 專案與子專案管理
- 🐳 Docker 支持
- 📖 完整 API 文檔

---

**Made with ❤️ for Psychology Research**
