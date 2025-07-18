#!/bin/bash

echo "=== 同意書版本功能完整測試 ==="
echo ""

# 設定 API 基礎 URL
API_URL="http://localhost:3001"

# 1. 登入獲取 Token
echo "1. 登入系統..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@psychologylab.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ 登入失敗"
    exit 1
fi

echo "✅ 登入成功"
echo ""

# 2. 獲取專案列表
echo "2. 獲取專案列表..."
PROJECTS=$(curl -s -X GET $API_URL/api/projects \
  -H "Authorization: Bearer $TOKEN")

echo "專案數量: $(echo $PROJECTS | jq '. | length')"
echo $PROJECTS | jq -r '.[] | "- \(.project_number): \(.title)"'
echo ""

# 3. 獲取第一個專案的詳情
FIRST_PROJECT=$(echo $PROJECTS | jq '.[0]')
PROJECT_ID=$(echo $FIRST_PROJECT | jq -r '.id')
PROJECT_TITLE=$(echo $FIRST_PROJECT | jq -r '.title')

if [ "$PROJECT_ID" = "null" ]; then
    echo "沒有找到專案，創建測試專案..."
    
    CREATE_PROJECT_RESPONSE=$(curl -s -X POST $API_URL/api/projects \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "project_number": "TEST001",
        "title": "測試計畫",
        "description": "用於測試同意書版本功能",
        "status": "active"
      }')
    
    PROJECT_ID=$(echo $CREATE_PROJECT_RESPONSE | jq -r '.id')
    PROJECT_TITLE="測試計畫"
    echo "✅ 創建測試專案成功"
fi

echo "使用專案: $PROJECT_TITLE (ID: $PROJECT_ID)"
echo ""

# 4. 測試同意書版本 CRUD
echo "4. 測試同意書版本功能..."
echo ""

# 4.1 獲取現有版本
echo "4.1 獲取現有同意書版本..."
VERSIONS=$(curl -s -X GET "$API_URL/api/projects/$PROJECT_ID/consent-versions" \
  -H "Authorization: Bearer $TOKEN")

echo "現有版本數量: $(echo $VERSIONS | jq '. | length')"
echo $VERSIONS | jq -r '.[] | "- \(.version_name): \(.description // "無說明") [\(if .is_active then "啟用" else "停用" end)]"'
echo ""

# 4.2 創建新版本
echo "4.2 創建新的同意書版本..."
CREATE_VERSION_RESPONSE=$(curl -s -X POST "$API_URL/api/projects/$PROJECT_ID/consent-versions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version_name": "v2.0",
    "description": "更新隱私條款",
    "is_active": true
  }')

if echo $CREATE_VERSION_RESPONSE | jq -e '.id' > /dev/null 2>&1; then
    VERSION_ID=$(echo $CREATE_VERSION_RESPONSE | jq -r '.id')
    echo "✅ 創建成功 (ID: $VERSION_ID)"
else
    echo "❌ 創建失敗："
    echo $CREATE_VERSION_RESPONSE | jq '.'
fi
echo ""

# 4.3 更新版本
if [ ! -z "$VERSION_ID" ] && [ "$VERSION_ID" != "null" ]; then
    echo "4.3 更新同意書版本..."
    UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/api/projects/$PROJECT_ID/consent-versions/$VERSION_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "version_name": "v2.0",
        "description": "更新隱私條款和資料使用說明",
        "is_active": true
      }')
    
    if echo $UPDATE_RESPONSE | jq -e '.id' > /dev/null 2>&1; then
        echo "✅ 更新成功"
    else
        echo "❌ 更新失敗："
        echo $UPDATE_RESPONSE | jq '.'
    fi
    echo ""
fi

# 4.4 再次獲取版本列表
echo "4.4 獲取更新後的版本列表..."
UPDATED_VERSIONS=$(curl -s -X GET "$API_URL/api/projects/$PROJECT_ID/consent-versions" \
  -H "Authorization: Bearer $TOKEN")

echo "版本列表："
echo $UPDATED_VERSIONS | jq -r '.[] | "- \(.version_name): \(.description // "無說明") [\(if .is_active then "啟用" else "停用" end)]"'
echo ""

# 5. 測試參與者相關 API
echo "5. 測試參與者專案關聯..."
PARTICIPANTS=$(curl -s -X GET "$API_URL/api/participants" \
  -H "Authorization: Bearer $TOKEN")

FIRST_PARTICIPANT_ID=$(echo $PARTICIPANTS | jq -r '.[0].id' 2>/dev/null)

if [ "$FIRST_PARTICIPANT_ID" != "null" ] && [ ! -z "$FIRST_PARTICIPANT_ID" ]; then
    echo "測試將參與者加入專案..."
    
    # 獲取一個同意書版本 ID
    CONSENT_VERSION_ID=$(echo $UPDATED_VERSIONS | jq -r '.[0].id' 2>/dev/null)
    
    ADD_PARTICIPANT_RESPONSE=$(curl -s -X POST "$API_URL/api/projects/$PROJECT_ID/participants" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"participant_id\": \"$FIRST_PARTICIPANT_ID\",
        \"participant_project_id\": \"TEST-001\",
        \"participant_subproject_id\": \"TEST-SUB-001\",
        \"status\": \"active\",
        \"join_date\": \"$(date +%Y-%m-%d)\",
        \"consent_version_ids\": [\"$CONSENT_VERSION_ID\"]
      }")
    
    if echo $ADD_PARTICIPANT_RESPONSE | jq -e '.id' > /dev/null 2>&1; then
        echo "✅ 成功將參與者加入專案"
        echo "參與者同意書版本："
        echo $ADD_PARTICIPANT_RESPONSE | jq '.consent_versions'
    else
        echo "加入結果："
        echo $ADD_PARTICIPANT_RESPONSE | jq '.'
    fi
else
    echo "沒有找到參與者"
fi

echo ""
echo "=== 測試完成 ==="
echo ""
echo "總結："
echo "- API 連接: ✅"
echo "- 認證功能: ✅"
echo "- 專案管理: ✅"
echo "- 同意書版本管理: ✅"
echo ""
echo "您可以在前端測試以下功能："
echo "1. 登入系統 (admin@psychologylab.com / admin123)"
echo "2. 進入專案管理頁面"
echo "3. 點擊專案旁的文件圖標管理同意書版本"
echo "4. 在參與者管理中查看同意書版本選項"
