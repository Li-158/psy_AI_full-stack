#!/bin/bash

# 心理學實驗室系統 - 同意書版本功能遷移腳本（Docker 版本）

echo "=== 開始執行同意書版本功能的資料庫遷移 ==="

# 進入專案根目錄
cd /Users/wanglisheng/Desktop/project/psychology-lab-system

# 檢查 Docker 服務是否在運行
if ! docker compose ps | grep -q "postgres.*Up"; then
    echo "錯誤：PostgreSQL 容器未運行，請先啟動系統"
    echo "執行: ./start-system.sh"
    exit 1
fi

# 複製遷移腳本到容器中
docker cp backend/scripts/add_consent_versions.sql psychology-lab-system_postgres_1:/tmp/

# 在容器中執行遷移
echo "正在執行資料庫遷移..."
docker compose exec -T postgres psql -U postgres -d psychology_lab -f /tmp/add_consent_versions.sql

# 檢查執行結果
if [ $? -eq 0 ]; then
    echo "✅ 資料庫遷移成功完成！"
    echo ""
    echo "新增的資料表："
    echo "  - consent_versions: 儲存同意書版本"
    echo "  - project_participants: 儲存專案參與者關係"
    echo "  - participant_consent_versions: 儲存參與者簽署的同意書版本"
    echo ""
    echo "現在重新啟動後端服務..."
    docker compose restart backend
    echo ""
    echo "✅ 系統已更新完成！您現在可以使用同意書版本管理功能了。"
else
    echo "❌ 資料庫遷移失敗！"
    exit 1
fi
