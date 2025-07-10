#!/bin/bash

# Docker 清理腳本
# Docker cleanup script

echo "🗑️  Starting Docker cleanup..."

# 停止所有運行中的容器
echo "⏹️  Stopping all running containers..."
docker stop $(docker ps -q) 2>/dev/null || echo "No running containers found"

# 刪除所有容器
echo "🗑️  Removing all containers..."
docker rm $(docker ps -aq) 2>/dev/null || echo "No containers to remove"

# 刪除所有映像檔
echo "🗑️  Removing all images..."
docker rmi $(docker images -q) 2>/dev/null || echo "No images to remove"

# 清理網路
echo "🗑️  Cleaning up networks..."
docker network prune -f

# 清理 volumes
echo "🗑️  Cleaning up volumes..."
docker volume prune -f

# 清理系統
echo "🗑️  Final system cleanup..."
docker system prune -a --volumes -f

echo "✅ Docker cleanup completed!"
echo ""
echo "📊 Current Docker status:"
echo "Containers: $(docker ps -a | wc -l | tr -d ' ') (including header)"
echo "Images: $(docker images | wc -l | tr -d ' ') (including header)"
echo "Networks: $(docker network ls | wc -l | tr -d ' ') (including header)"
echo "Volumes: $(docker volume ls | wc -l | tr -d ' ') (including header)"
