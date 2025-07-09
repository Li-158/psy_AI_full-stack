#!/bin/bash

echo "🛑 完全停止並清理環境..."

# 停止所有容器
docker-compose down -v

# 查找並終止佔用 3001 端口的進程
echo "🔍 檢查端口 3001..."
if lsof -i :3001 > /dev/null 2>&1; then
    echo "⚠️  發現端口 3001 被佔用，正在終止..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 再次確認
if lsof -i :3001 > /dev/null 2>&1; then
    echo "❌ 端口 3001 仍被佔用："
    lsof -i :3001
    echo "請手動終止上述進程"
    exit 1
fi

echo "✅ 端口 3001 已釋放"

# 清理 Docker
echo "🧹 清理 Docker 環境..."
docker system prune -a -f --volumes

echo "✅ 清理完成"
