# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建项目（生产环境）
RUN npm run build:prod

# 生产阶段 - 使用 Node.js 运行 Vue 应用
FROM node:18-alpine

WORKDIR /app

# 安装 serve 作为静态文件服务器
RUN npm install -g serve

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 暴露 3000 端口 (主站)
EXPOSE 3000

# 启动 serve 服务
CMD ["sh", "-c", "serve -s dist -l 3000"]
