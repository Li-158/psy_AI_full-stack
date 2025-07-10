#!/bin/bash

# Psychology Lab System Backend Startup Script
# 心理學實驗室系統後端啟動腳本

set -e

echo "🚀 Starting Psychology Lab System Backend..."

# 檢查是否有 Python 3.11+
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
required_version="3.11"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.11+ is required. Current version: $python_version"
    exit 1
fi

# 檢查虛擬環境
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# 啟動虛擬環境
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# 安裝依賴
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# 檢查環境變數文件
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# 檢查資料庫連接
echo "🔍 Checking database connection..."
python3 scripts/init_database.py check || {
    echo "❌ Database connection failed. Please ensure PostgreSQL is running and configured correctly."
    echo "💡 You can start PostgreSQL with Docker: docker-compose up db -d"
    exit 1
}

# 初始化資料庫（如果需要）
echo "🏗️  Checking database initialization..."
python3 scripts/init_database.py check | grep -q "No tables found" && {
    echo "📋 Initializing database..."
    python3 scripts/init_database.py init
}

echo "✅ All checks passed!"
echo ""
echo "🎯 Starting FastAPI server..."
echo "📍 Server will be available at: http://localhost:3001"
echo "📖 API documentation: http://localhost:3001/docs"
echo "🔍 Health check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# 啟動應用程式
python3 main.py
