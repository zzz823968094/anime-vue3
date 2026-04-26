#!/bin/bash

# 部署脚本：停止Docker服务 -> 拉取最新代码 -> 重新构建并启动（生产环境）
# 使用 build:prod 确保生产环境配置

set -e  # 遇到错误立即退出

echo "========================================="
echo "  开始部署 anime-vue3 (生产环境)"
echo "  API: https://www.animeparadise.vip"
echo "  WS:  wss://www.animeparadise.vip"
echo "========================================="

# 1. 停止Docker服务
echo ""
echo "[1/4] 停止 Docker 服务..."
docker compose down
echo "✓ Docker 服务已停止"

# 2. 拉取最新代码
echo ""
echo "[2/4] 拉取最新代码..."
git pull origin master
echo "✓ 代码已更新"

# 3. 清理旧镜像并重新构建（生产环境）
echo ""
echo "[3/4] 清理旧的 Docker 镜像并重新构建（生产环境）..."
docker compose build --no-cache || docker compose build
echo "✓ 生产环境镜像构建完成"

# 4. 重新构建并启动
echo ""
echo "[4/4] 启动 Docker 服务（生产环境）..."
docker compose up -d
echo "✓ Docker 服务已启动"

# 5. 查看服务状态
echo ""
echo "检查服务状态..."
docker compose ps

echo ""
echo "========================================="
echo "  ✓ 部署完成！"
echo "========================================="
echo ""
echo "访问地址: https://www.animeparadise.vip"
echo ""
echo "查看日志: docker compose logs -f"
echo ""
