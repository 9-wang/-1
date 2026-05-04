# 亚健康助手 - 部署指南

## 项目架构

```
┌─────────────────────────────────────────────────────────────┐
│                      前端 (UniApp)                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  首页   │ │  驾驶舱  │ │  聊天   │ │  个人中心│           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
└───────┼───────────┼───────────┼───────────┼─────────────────┘
        │           │           │           │
        ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────┐
│                    后端 API (Express)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /api/auth/login    - 用户登录                      │   │
│  │  /api/auth/register - 用户注册                      │   │
│  │  /api/screen        - 健康筛查                      │   │
│  │  /api/chat          - AI聊天                        │   │
│  │  /api/posts         - 社区帖子                      │   │
│  │  /api/coze/*        - Coze API代理                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据库 (SQLite)                        │
│  ┌─────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │  users  │ │screen_record│ │health_report│ │community  │ │
│  └─────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件，配置以下内容：

```env
# Coze API配置
COZE_TOKEN=你的Coze令牌
COZE_BASE=https://api.coze.cn
BOT_ID=你的智能体ID

# 服务器配置
PORT=5000

# 数据库配置（SQLite无需额外配置）
DB_STORAGE=./database.sqlite

# JWT配置
JWT_SECRET=your-secret-key-change-in-production
```

### 3. 启动后端服务

```bash
npm run server
```

### 4. 启动前端开发服务器

```bash
# H5开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin
```

## 生产部署

### 方式一：使用 PM2（推荐）

#### 1. 安装 PM2

```bash
npm install -g pm2
```

#### 2. 创建 PM2 配置文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'health-assistant',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
```

#### 3. 启动服务

```bash
pm2 start ecosystem.config.js
```

#### 4. 查看日志

```bash
pm2 logs health-assistant
```

### 方式二：使用 Nginx 反向代理

#### 1. 构建前端

```bash
npm run build:h5
```

#### 2. 配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/project/dist/build/h5;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 数据库配置

### SQLite（默认）

无需额外配置，数据库文件会自动创建在项目根目录。

### MySQL（可选）

如果需要使用 MySQL，修改 `.env`：

```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=health_assistant
```

## API 接口列表

| 接口 | 方法 | 说明 | 需要认证 |
|------|------|------|----------|
| `/api/auth/register` | POST | 用户注册 | 否 |
| `/api/auth/login` | POST | 用户登录 | 否 |
| `/api/user/profile` | GET | 获取用户信息 | 是 |
| `/api/screen` | POST | 提交健康筛查 | 否 |
| `/api/screen/latest` | GET | 获取最新筛查记录 | 是 |
| `/api/chat` | POST | AI聊天 | 否 |
| `/api/posts` | GET | 获取帖子列表 | 否 |
| `/api/posts` | POST | 发布帖子 | 是 |
| `/api/posts/:id/comments` | GET | 获取评论 | 否 |
| `/api/posts/:id/comments` | POST | 添加评论 | 是 |
| `/api/posts/:id/like` | POST | 点赞 | 是 |
| `/api/coze/online-info` | GET | 检查智能体状态 | 否 |

## 目录结构

```
亚健康助手/
├── src/                    # 前端源码
│   ├── api/                # API接口定义
│   ├── data/               # 模拟数据
│   ├── pages/              # 页面组件
│   ├── static/icons/       # 图标资源
│   ├── styles/             # 全局样式
│   ├── utils/              # 工具函数
│   ├── db/                 # 数据库模块
│   │   ├── config.js       # 数据库配置
│   │   ├── models.js       # 数据库模型
│   │   └── operations.js   # 数据库操作
│   └── ...
├── .env                    # 环境变量
├── server.js               # 后端服务器
├── package.json            # 依赖配置
├── vite.config.ts          # Vite配置
└── DEPLOYMENT.md           # 部署文档
```

## 注意事项

1. **Coze 令牌有效期**：请定期检查并更新令牌
2. **JWT 密钥**：生产环境请使用安全的密钥
3. **数据库备份**：定期备份 SQLite 数据库文件
4. **HTTPS**：生产环境请配置 HTTPS
5. **日志管理**：建议配置日志轮转

## 常见问题

### Q: Coze API 返回 4101 错误？

A: 令牌无效或已过期，请重新获取新令牌并更新 `.env` 文件。

### Q: 前端无法连接后端？

A: 检查后端服务是否启动，端口是否正确，防火墙是否允许访问。

### Q: 数据库文件无法创建？

A: 检查项目目录权限，确保 Node.js 有写入权限。
