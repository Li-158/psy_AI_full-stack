#!/bin/bash

echo "📊 心理實驗室系統監控"
echo "===================="

# 檢查容器狀態
echo "📦 容器狀態:"
docker compose ps

echo ""

# 檢查服務健康狀態
echo "🏥 服務健康檢查:"

if curl -s -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ 後端 API: 正常"
else
    echo "❌ 後端 API: 異常"
fi

if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 前端應用: 正常"
else
    echo "❌ 前端應用: 異常"
fi

if docker compose exec -T postgres pg_isready -U labuser > /dev/null 2>&1; then
    echo "✅ 資料庫: 正常"
else
    echo "❌ 資料庫: 異常"
fi

echo ""

# 檢查資源使用
echo "💻 資源使用:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
