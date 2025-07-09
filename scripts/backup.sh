#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/psychology_lab_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

echo "🗄️ 開始備份資料庫..."

# 備份資料庫
docker compose exec -T postgres pg_dump -U labuser psychology_lab > $BACKUP_FILE

# 壓縮備份檔案
gzip $BACKUP_FILE

echo "✅ 備份完成: ${BACKUP_FILE}.gz"

# 清理舊備份（保留最近 7 天）
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "🧹 清理舊備份檔案完成"
