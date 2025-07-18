#!/bin/bash

# 心理學實驗室系統 - 同意書版本功能遷移腳本
# 此腳本會執行資料庫遷移以支援動態同意書版本管理

echo "=== 開始執行同意書版本功能的資料庫遷移 ==="

# 檢查環境變數
if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "錯誤：請設定資料庫環境變數 (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)"
    exit 1
fi

# 設定 PGPASSWORD 環境變數以避免密碼提示
export PGPASSWORD=$DB_PASSWORD

# 執行遷移 SQL
echo "正在執行資料庫遷移..."
psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f /app/scripts/add_consent_versions.sql

# 檢查執行結果
if [ $? -eq 0 ]; then
    echo "✅ 資料庫遷移成功完成！"
    echo ""
    echo "新增的資料表："
    echo "  - consent_versions: 儲存同意書版本"
    echo "  - project_participants: 儲存專案參與者關係"
    echo "  - participant_consent_versions: 儲存參與者簽署的同意書版本"
    echo ""
    echo "請重新啟動後端服務以使用新的 API 端點。"
else
    echo "❌ 資料庫遷移失敗！"
    exit 1
fi

# 清除密碼環境變數
unset PGPASSWORD
