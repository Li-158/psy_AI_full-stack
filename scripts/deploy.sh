#!/bin/bash

set -e

echo "🚀 開始部署心理實驗室管理系統..."

# 檢查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝"
    exit 1
fi

# 檢查 Docker Compose (新版)
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 不可用"
    exit 1
fi

# 檢查環境變數
if [ ! -f .env ]; then
    echo "❌ 請先設定 .env 檔案"
    echo "💡 複製 .env.example 並修改密碼"
    exit 1
fi

# 停止現有容器
echo "🛑 停止現有容器..."
docker compose down || true

# 清理舊映像檔 (可選)
read -p "是否清理舊的 Docker 映像檔？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ 清理舊映像檔..."
    docker system prune -f
fi

# 建構並啟動
echo "🏗️ 建構並啟動容器..."
docker compose up --build -d

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 45

# 檢查服務狀態
echo "🔍 檢查服務狀態..."
docker compose ps

echo ""
echo "🎉 部署完成！"
echo ""
echo "🌐 應用網址:"
echo "  前端應用: http://localhost:3000"
echo "  後端 API: http://localhost:3001/api/health"
echo ""
echo "🔐 預設管理員帳號:"
echo "  Email: admin@lab.com"
echo "  密碼: admin123"
echo ""
echo "📋 其他指令:"
echo "  查看日誌: docker compose logs -f"
echo "  停止服務: docker compose down"
echo "  重啟服務: docker compose restart"
