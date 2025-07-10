"""
Basic tests for Psychology Lab System API
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# 添加 app 路徑
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from main import app

client = TestClient(app)


def test_root_endpoint():
    """測試根端點"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "Psychology Lab API" in data["message"]


def test_health_check():
    """測試健康檢查端點"""
    response = client.get("/health")
    # 這個測試可能會失敗，因為需要資料庫連接
    # 但至少可以檢查端點是否存在
    assert response.status_code in [200, 503]


def test_api_docs():
    """測試 API 文檔端點"""
    response = client.get("/docs")
    assert response.status_code == 200


def test_openapi_schema():
    """測試 OpenAPI schema"""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert "info" in data


def test_cors_headers():
    """測試 CORS 設定"""
    response = client.options("/")
    assert response.status_code == 200


# 認證相關測試（需要模擬資料庫）
@pytest.mark.asyncio
async def test_login_endpoint_structure():
    """測試登入端點結構"""
    # 測試無效的登入請求
    response = client.post("/api/auth/login", json={
        "email": "invalid@test.com",
        "password": "invalid"
    })
    # 應該返回 401 或其他錯誤狀態
    assert response.status_code != 200


def test_unauthorized_endpoints():
    """測試未經授權的端點訪問"""
    # 測試需要認證的端點
    protected_endpoints = [
        "/api/users/",
        "/api/participants/",
        "/api/projects/",
        "/api/researchers/",
        "/api/subprojects/"
    ]
    
    for endpoint in protected_endpoints:
        response = client.get(endpoint)
        # 應該返回 401 或 403 未經授權
        assert response.status_code in [401, 403]


def test_invalid_routes():
    """測試無效的路由"""
    response = client.get("/invalid/route")
    assert response.status_code == 404


def test_api_versioning():
    """測試 API 版本路由"""
    # 所有 API 端點都以 /api/ 開頭
    response = client.get("/api/auth/login")
    # 應該不是 404（但可能是其他錯誤）
    assert response.status_code != 404


if __name__ == "__main__":
    # 基本測試運行
    print("🧪 Running basic tests...")
    
    try:
        test_root_endpoint()
        print("✅ Root endpoint test passed")
        
        test_api_docs()
        print("✅ API docs test passed")
        
        test_openapi_schema()
        print("✅ OpenAPI schema test passed")
        
        test_unauthorized_endpoints()
        print("✅ Unauthorized endpoints test passed")
        
        test_invalid_routes()
        print("✅ Invalid routes test passed")
        
        print("✅ All basic tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        raise
