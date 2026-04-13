

Based on the provided code map, I can see this is an anime website project built with Vue 3. Let me create a comprehensive README for this project.

# Anime Vue3

一个基于 Vue 3 构建的动漫视频网站管理系统。

## 项目简介

Anime Vue3 是一个功能完善的动漫视频网站前端应用，采用 Vue 3 + Vite 技术栈开发。系统包含用户前台和管理后台两大模块，支持动漫浏览、视频播放、搜索、用户管理以及数据爬取等功能。

## 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **国际化**: vue-i18n
- **UI**: 自定义组件
- **部署**: Docker

## 项目结构

```
├── src/                    # Vue 3 主应用
│   ├── api/               # API 接口
│   ├── components/        # 公共组件
│   │   ├── AnimeCard.vue  # 动漫卡片组件
│   │   ├── Footer.vue     # 页脚组件
│   │   ├── NavBar.vue     # 导航栏组件
│   │   └── Pager.vue      # 分页组件
│   ├── views/             # 页面视图
│   │   ├── HomeView.vue   # 首页
│   │   ├── DetailView.vue # 详情页
│   │   ├── PlayerView.vue # 播放器页
│   │   ├── SearchView.vue # 搜索页
│   │   ├── UserView.vue   # 用户页
│   │   └── LoginView.vue  # 登录页
│   ├── stores/            # Pinia 状态管理
│   │   ├── auth.js        # 认证状态
│   │   ├── i18n.js        # 国际化配置
│   │   └── theme.js       # 主题状态
│   ├── router/            # 路由配置
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── admin/                  # 管理后台前端
├── index.html              # 主应用入口 HTML
├── vite.config.js          # Vite 配置
├── Dockerfile              # Docker 镜像构建
├── docker-compose.yml      # Docker Compose 配置
└── deploy.sh               # 部署脚本
```

## 功能特性

### 用户前台
- 🎬 动漫浏览与展示
- 🔍 关键词搜索与热门搜索词
- ▶️ 视频播放器
- 👤 用户个人中心
- 📱 响应式设计

### 管理后台
- 📊 数据统计仪表盘（动漫数、视频数、用户数、访问量等）
- 📈 UV 趋势统计
- 🎯 类型分布统计
- 🔄 爬虫管理
- 👥 用户管理
- 📝 动漫管理
- 🔍 搜索管理

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### Docker 部署

使用 Docker Compose 启动服务：

```bash
docker-compose up -d
```

服务启动后将提供：
- 主应用: http://localhost:3000

## 目录说明

| 目录 | 说明 |
|------|------|
| `src/api` | API 请求封装 |
| `src/components` | 可复用的 Vue 组件 |
| `src/views` | 页面级组件 |
| `src/stores` | Pinia 状态管理 |
| `src/router` | 路由配置 |
| `admin/` | 管理后台静态资源 |

## 许可证

本项目仅供学习交流使用。

## 贡献指南

欢迎提交 Issue 和 Pull Request。