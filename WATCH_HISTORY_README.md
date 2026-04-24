# 观看历史功能 - 数据库存储方案

## 概述

本次更新将观看历史从浏览器 localStorage 迁移到数据库存储，实现跨设备同步和历史记录持久化。

## 后端文件清单

### 1. 实体类
- `WatchHistory.java` - 观看历史实体类
  - 位置: `src/main/java/com/anime/anime/entity/WatchHistory.java`

### 2. Mapper 接口
- `WatchHistoryMapper.java` - 数据访问层
  - 位置: `src/main/java/com/anime/anime/mapper/WatchHistoryMapper.java`
  - 包含自定义查询方法

### 3. Service 层
- `WatchHistoryService.java` - 服务接口
  - 位置: `src/main/java/com/anime/anime/service/WatchHistoryService.java`
- `WatchHistoryServiceImpl.java` - 服务实现
  - 位置: `src/main/java/com/anime/anime/service/impl/WatchHistoryServiceImpl.java`

### 4. Controller
- `WatchHistoryController.java` - REST API 控制器
  - 位置: `src/main/java/com/anime/anime/controller/WatchHistoryController.java`
  - 基础路径: `/api/history`

### 5. SQL 脚本
- `watch_history.sql` - 建表语句
  - 位置: `src/main/resources/sql/watch_history.sql`

## 数据库表结构

```sql
CREATE TABLE IF NOT EXISTS `watch_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `anime_id` BIGINT NOT NULL COMMENT '番剧ID',
    `video_id` BIGINT DEFAULT NULL COMMENT '视频ID',
    `episode` INT DEFAULT NULL COMMENT '当前集数',
    `progress` DOUBLE DEFAULT 0.0 COMMENT '观看进度（百分比）',
    `watch_duration` INT DEFAULT 0 COMMENT '观看时长（秒）',
    `vod_name` VARCHAR(255) DEFAULT NULL COMMENT '番剧名称（冗余字段）',
    `vod_pic` VARCHAR(500) DEFAULT NULL COMMENT '番剧封面（冗余字段）',
    `vod_total` INT DEFAULT NULL COMMENT '总集数（冗余字段）',
    `last_watch_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后观看时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_anime` (`user_id`, `anime_id`) COMMENT '用户+番剧唯一索引',
    KEY `idx_user_id` (`user_id`) COMMENT '用户ID索引',
    KEY `idx_last_watch_time` (`last_watch_time`) COMMENT '最后观看时间索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='观看历史表';
```

### 索引说明
- **主键**: `id` - 自增主键
- **唯一索引**: `uk_user_anime` - 确保每个用户对同一番剧只有一条记录
- **普通索引**: 
  - `idx_user_id` - 加速按用户查询
  - `idx_last_watch_time` - 加速按时间排序

## API 接口文档

### 1. 保存或更新观看历史
```
POST /api/history/save
Headers: X-User-Id: {userId}
Body: {
  "animeId": 123,
  "videoId": 456,
  "episode": 5,
  "progress": 50.5,
  "watchDuration": 600,
  "vodName": "进击的巨人",
  "vodPic": "https://...",
  "vodTotal": 25
}
Response: {
  "code": 200,
  "message": "保存成功"
}
```

### 2. 获取观看历史列表
```
GET /api/history/list?limit=100
Headers: X-User-Id: {userId}
Response: {
  "code": 200,
  "data": [
    {
      "id": 1,
      "userId": 100,
      "animeId": 123,
      "videoId": 456,
      "episode": 5,
      "progress": 50.5,
      "vodName": "进击的巨人",
      "vodPic": "https://...",
      "vodTotal": 25,
      "lastWatchTime": "2024-01-01T12:00:00"
    }
  ]
}
```

### 3. 删除某条观看历史
```
DELETE /api/history/{animeId}
Headers: X-User-Id: {userId}
Response: {
  "code": 200,
  "message": "删除成功"
}
```

### 4. 清空所有观看历史
```
DELETE /api/history/clear
Headers: X-User-Id: {userId}
Response: {
  "code": 200,
  "message": "清空成功"
}
```

### 5. 统计观看历史数量
```
GET /api/history/count
Headers: X-User-Id: {userId}
Response: {
  "code": 200,
  "data": {
    "count": 42
  }
}
```

## 前端修改

### 1. API 封装
文件: `src/api/anime.js`

新增 `historyApi` 对象，包含以下方法：
- `save(data)` - 保存观看历史
- `list(limit)` - 获取历史列表
- `remove(animeId)` - 删除单条历史
- `clear()` - 清空所有历史
- `count()` - 统计数量

### 2. PlayerView.vue 修改
- 导入 `historyApi`
- 修改 `saveWatchHistory()` 函数为异步调用 API
- 添加 `loadWatchedEps()` 函数从数据库加载已观看集数
- 在视频加载时调用 `loadWatchedEps()`

### 3. UserView.vue 修改
- 导入 `historyApi`
- 将 `histCount` 从 computed 改为 ref
- 修改 `loadHistory()` 为异步调用 API
- 修改 `removeHistory()` 和 `clearHistory()` 为异步调用 API
- 在 `loadProfile()` 中加载历史记录数量
- 模板中添加加载状态显示

## 部署步骤

### 1. 执行 SQL 脚本
```bash
mysql -u root -p your_database < src/main/resources/sql/watch_history.sql
```

### 2. 重新编译后端
```bash
cd D:\worktable\idea\anime-platform\anime-platform\anime-service
mvn clean package
```

### 3. 重启后端服务
```bash
java -jar target/anime-service.jar
```

### 4. 前端无需特殊操作
前端代码已更新，重新构建即可：
```bash
npm run build
```

## 特性说明

### 1. 自动去重
使用唯一索引 `uk_user_anime`，同一用户对同一番剧只会保留一条记录，新观看会自动更新旧记录。

### 2. 冗余字段设计
为了减少联表查询，表中包含了番剧名称、封面等冗余字段，提升查询性能。

### 3. 登录验证
所有 API 都需要通过 `X-User-Id` header 传递用户ID，未登录用户无法使用观看历史功能。

### 4. 实时同步
- 播放器页面：每次切换集数都会保存到数据库
- 个人中心：实时从数据库加载最新历史记录

## 注意事项

1. **用户认证**: 确保前端在请求时正确传递 `X-User-Id` header
2. **数据迁移**: 如果需要迁移旧的 localStorage 数据，需要编写迁移脚本
3. **性能优化**: 建议定期清理长时间未更新的记录（可选）
4. **隐私保护**: 考虑添加用户隐私设置，允许用户选择是否记录观看历史

## 后续优化建议

1. 添加观看进度自动保存（定时保存，而非仅切换集数时）
2. 支持多设备同步提示
3. 添加观看历史导出功能
4. 添加观看统计分析（观看时长、偏好类型等）
5. 实现观看历史的软删除机制
