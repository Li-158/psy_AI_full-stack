#!/bin/bash

echo "🔍 診斷 Docker Compose 問題..."

cd /Users/wanglisheng/Desktop/project/psychology-lab-system

echo -e "\n📋 當前目錄內容："
ls -la

echo -e "\n📦 Docker 版本："
docker --version
docker compose version

echo -e "\n🛑 清理舊容器..."
docker compose down
docker rm -f psychology_lab_api psychology_lab_frontend psychology_lab_db 2>/dev/null

echo -e "\n🔨 嘗試構建後端..."
docker compose build backend
if [ $? -ne 0 ]; then
    echo "❌ 後端構建失敗"
    exit 1
fi

echo -e "\n🔨 嘗試構建前端..."
docker compose build frontend
if [ $? -ne 0 ]; then
    echo "❌ 前端構建失敗"
    exit 1
fi

echo -e "\n🚀 啟動 PostgreSQL..."
docker compose up -d postgres
sleep 10

echo -e "\n🗄️ 檢查資料庫..."
docker compose exec postgres pg_isready -U labuser -d psychology_lab

echo -e "\n🚀 啟動後端..."
docker compose up -d backend
sleep 10

echo -e "\n📋 後端日誌："
docker compose logs --tail=20 backend

echo -e "\n🚀 啟動前端..."
docker compose up -d frontend

echo -e "\n📊 所有容器狀態："
docker compose ps

echo -e "\n🔍 檢查運行中的容器："
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n✅ 診斷完成"
