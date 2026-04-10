#!/bin/bash

# 部署脚本：停止Docker服务 -> 拉取最新代码 -> 重新构建并启动 -> 配置外部nginx

set -e  # 遇到错误立即退出

echo "========================================="
echo "  开始部署 anime-vue3 (外部nginx模式)"
echo "========================================="

# 1. 停止Docker服务
echo ""
echo "[1/5] 停止 Docker 服务..."
docker-compose down
echo "✓ Docker 服务已停止"

# 2. 拉取最新代码
echo ""
echo "[2/5] 拉取最新代码..."
git pull origin main
echo "✓ 代码已更新"

# 3. 重新构建并启动
echo ""
echo "[3/5] 重新构建并启动 Docker 服务..."
docker-compose up -d --build
echo "✓ Docker 服务已启动"

# 4. 配置外部 nginx
echo ""
echo "[4/5] 配置外部 nginx..."

# 复制 nginx 配置文件到 nginx 配置目录
NGINX_CONF_DIR="/etc/nginx/conf.d"
if [ -d "$NGINX_CONF_DIR" ]; then
    cp nginx-external.conf $NGINX_CONF.d/anime-vue3.conf
    echo "✓ nginx 配置文件已复制到 $NGINX_CONF_DIR/anime-vue3.conf"
    
    # 测试 nginx 配置
    echo ""
    echo "测试 nginx 配置..."
    nginx -t
    
    # 重新加载 nginx
    echo ""
    echo "重新加载 nginx..."
    nginx -s reload || systemctl reload nginx
    echo "✓ nginx 已重新加载"
else
    echo "⚠ 未找到 nginx 配置目录 $NGINX_CONF_DIR"
    echo "请手动复制 nginx-external.conf 到 nginx 配置目录并重新加载 nginx"
fi

# 5. 查看服务状态
echo ""
echo "[5/5] 检查服务状态..."
docker-compose ps

echo ""
echo "========================================="
echo "  ✓ 部署完成！"
echo "========================================="
echo ""
echo "主站地址: http://$(hostname -I | awk '{print $1}'):80"
echo "管理后台: http://$(hostname -I | awk '{print $1}'):5173"
echo ""
echo "Docker 容器端口: 3000 (主站), 3001 (管理后台)"
echo "外部 nginx 端口: 80 (主站), 5173 (管理后台)"
echo ""
echo "查看日志: docker-compose logs -f"
echo "查看 nginx 日志: tail -f /var/log/nginx/access.log"
echo ""
