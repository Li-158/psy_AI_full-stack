#!/bin/bash

echo "=== 心理學實驗室系統 - API 連接測試 ==="
echo ""

# 1. 檢查容器狀態
echo "1. 檢查系統狀態..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 2. 測試後端 API 健康檢查
echo "2. 測試後端 API 健康檢查..."
curl -s http://localhost:3001/health | jq '.' || echo "API 健康檢查失敗"
echo ""

# 3. 測試登入功能（使用預設管理員帳號）
echo "3. 測試登入 API..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@psychologylab.com","password":"admin123"}')

echo "登入回應："
echo $LOGIN_RESPONSE | jq '.' || echo $LOGIN_RESPONSE

# 提取 token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
    echo ""
    echo "✅ 登入成功！Token: ${TOKEN:0:20}..."
    
    # 4. 測試專案列表 API
    echo ""
    echo "4. 測試專案列表 API..."
    curl -s -X GET http://localhost:3001/api/projects \
      -H "Authorization: Bearer $TOKEN" | jq '.' || echo "無法獲取專案列表"
    
    # 5. 測試同意書版本 API（如果有專案的話）
    echo ""
    echo "5. 獲取第一個專案的同意書版本..."
    FIRST_PROJECT_ID=$(curl -s -X GET http://localhost:3001/api/projects \
      -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id' 2>/dev/null)
    
    if [ "$FIRST_PROJECT_ID" != "null" ] && [ ! -z "$FIRST_PROJECT_ID" ]; then
        echo "專案 ID: $FIRST_PROJECT_ID"
        curl -s -X GET "http://localhost:3001/api/projects/$FIRST_PROJECT_ID/consent-versions" \
          -H "Authorization: Bearer $TOKEN" | jq '.' || echo "無法獲取同意書版本"
    else
        echo "沒有找到專案"
    fi
else
    echo "❌ 登入失敗"
fi

echo ""
echo "=== 測試完成 ==="
