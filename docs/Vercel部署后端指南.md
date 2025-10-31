# Vercel 部署后端指南

## 📋 什么是 Vercel？

Vercel 是一个现代化的部署平台，可以快速部署前端和后端项目。支持：
- ✅ 免费使用（有使用限制）
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 简单的部署流程
- ✅ 支持 Node.js、Python、Go 等多种后端框架

## 🚀 快速开始（5 分钟部署）

### 前置要求

1. **GitHub 账号**（Vercel 使用 GitHub 登录）
2. **后端项目代码**（Node.js、Python、Go 等）

---

## 步骤 1：准备后端项目

### 1.1 确保项目结构正确

你的后端项目应该有一个明确的入口文件：

**Node.js 示例：**
```
your-backend/
├── index.js          # 或 server.js, app.js
├── package.json
└── ...
```

**Python 示例：**
```
your-backend/
├── main.py
├── requirements.txt
└── ...
```

### 1.2 创建 Vercel 配置文件（可选但推荐）

在项目根目录创建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ]
}
```

**对于 Express.js：**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ]
}
```

### 1.3 确保后端代码适配 Serverless

**Node.js Express 示例：**

```javascript
// index.js
const express = require('express');
const app = express();

app.use(express.json());

// 你的路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from Vercel!' });
});

app.post('/api/questionnaire/submit', (req, res) => {
  // 处理问卷提交
  res.json({ code: 200, message: '成功', data: {} });
});

// Vercel 需要导出 handler
module.exports = app;
// 或者
// export default app; (ES6)
```

**注意：** 如果你的后端使用了传统的 `app.listen()`，需要移除或条件化：

```javascript
// ❌ 不要这样做（Vercel 会处理）
// app.listen(3000, () => {
//   console.log('Server running on port 3000');
// });

// ✅ 正确做法
const port = process.env.PORT || 3000;
if (require.main === module) {
  // 本地开发时才监听
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
```

---

## 步骤 2：上传代码到 GitHub

### 2.1 初始化 Git（如果还没有）

```bash
cd your-backend-project
git init
git add .
git commit -m "Initial commit"
```

### 2.2 创建 GitHub 仓库

1. 访问 https://github.com
2. 点击右上角 "+" -> "New repository"
3. 填写仓库名称（如 `my-backend-api`）
4. 选择 Public 或 Private
5. **不要**勾选 "Initialize with README"
6. 点击 "Create repository"

### 2.3 推送代码到 GitHub

```bash
# 添加远程仓库（替换 YOUR_USERNAME 和 REPO_NAME）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 推送代码
git branch -M main
git push -u origin main
```

**示例：**
```bash
git remote add origin https://github.com/jeffyaoliang/my-backend-api.git
git push -u origin main
```

---

## 步骤 3：导入到 Vercel

### 3.1 注册/登录 Vercel

1. 访问 https://vercel.com
2. 点击右上角 "Sign Up" 或 "Log In"
3. 选择 "Continue with GitHub"
4. 授权 Vercel 访问你的 GitHub 账号

### 3.2 导入项目

1. **方式 A：从 Dashboard 导入**
   - 登录后，点击 "Add New..." -> "Project"
   - 点击 "Import Git Repository"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

2. **方式 B：从 GitHub 仓库导入**
   - 在 GitHub 仓库页面，点击 "Deploy to Vercel" 按钮（如果有）
   - 或访问 https://vercel.com/new

### 3.3 配置项目

在导入页面：

1. **项目名称**
   - 可以修改项目名称（会用于生成域名）

2. **框架预设**
   - 如果检测到 Node.js，选择 "Other" 或保留默认
   - Vercel 会自动检测

3. **根目录**
   - 通常是 `.`（项目根目录）
   - 如果后端代码在子目录，如 `backend/`，则填写 `backend`

4. **构建命令**（如果需要）
   - Node.js 通常不需要
   - 如果使用 TypeScript，可能需要：`npm run build`

5. **输出目录**（通常是后端不需要）
   - 前端项目才需要

6. **安装命令**
   - 通常是 `npm install` 或 `yarn install`

7. **环境变量**（如果有）
   - 点击 "Environment Variables"
   - 添加需要的环境变量（如数据库连接、API 密钥等）

### 3.4 部署

点击 "Deploy" 按钮，等待部署完成（通常 1-3 分钟）

---

## 步骤 4：获得域名

部署成功后：

1. **查看部署状态**
   - 等待 "Building" 和 "Deploying" 完成
   - 看到 "Ready" 表示部署成功

2. **获得域名**
   - Vercel 会自动生成域名
   - 格式：`your-project-name.vercel.app`
   - 或：`your-project-name-xxx.vercel.app`（如果有重名）

3. **自定义域名**（可选）
   - 点击项目 -> Settings -> Domains
   - 添加你的自定义域名
   - 需要在域名解析中添加 CNAME 记录

---

## 步骤 5：配置小程序

### 5.1 修改配置文件

打开 `miniprogram/utils/config.ts`：

```typescript
// 将 API_BASE_URL 改为你的 Vercel 域名
export const API_BASE_URL = 'https://your-project-name.vercel.app';
```

### 5.2 测试 API

在浏览器中访问：
```
https://your-project-name.vercel.app/api/test
```

应该能看到返回的数据。

---

## 📝 完整示例

### 示例 1：Express.js 后端

**项目结构：**
```
my-backend/
├── index.js
├── package.json
├── vercel.json
└── routes/
    └── api.js
```

**index.js：**
```javascript
const express = require('express');
const app = express();

app.use(express.json());

// 示例路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from Vercel!' });
});

app.post('/api/questionnaire/submit', (req, res) => {
  console.log('Received data:', req.body);
  res.json({ 
    code: 200, 
    message: '提交成功', 
    data: { id: Date.now() } 
  });
});

module.exports = app;
```

**package.json：**
```json
{
  "name": "my-backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

**vercel.json：**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ]
}
```

### 示例 2：使用路由文件

如果你的 Express 使用了路由文件：

**index.js：**
```javascript
const express = require('express');
const app = express();
const apiRoutes = require('./routes/api');

app.use(express.json());
app.use('/api', apiRoutes);

module.exports = app;
```

**routes/api.js：**
```javascript
const express = require('express');
const router = express.Router();

router.post('/questionnaire/submit', (req, res) => {
  res.json({ code: 200, message: '成功' });
});

module.exports = router;
```

---

## 🔧 常见问题

### Q1: 部署失败怎么办？

**可能原因：**
- 代码有语法错误
- 缺少依赖（检查 `package.json`）
- 端口监听问题（Vercel 不需要 `app.listen()`）

**解决方法：**
1. 查看 Vercel 部署日志
2. 检查错误信息
3. 确保代码中没有 `app.listen()`
4. 确保所有依赖都在 `package.json` 中

### Q2: 如何查看日志？

1. 在 Vercel Dashboard 中
2. 点击项目 -> "Deployments"
3. 点击最新的部署
4. 查看 "Functions" 标签页的日志

### Q3: 如何更新代码？

**方法 1：Git 推送**
```bash
git add .
git commit -m "Update code"
git push
```
Vercel 会自动重新部署。

**方法 2：在 Vercel Dashboard**
- 点击项目 -> "Deployments" -> "Redeploy"

### Q4: 如何配置环境变量？

1. 在 Vercel Dashboard 中
2. 点击项目 -> Settings -> Environment Variables
3. 添加变量（如 `DATABASE_URL`、`API_KEY` 等）
4. 重新部署

### Q5: 如何连接数据库？

**选项 1：使用环境变量**
```javascript
const dbUrl = process.env.DATABASE_URL;
```

**选项 2：使用 MongoDB Atlas（免费）**
- 注册账号：https://www.mongodb.com/cloud/atlas
- 创建免费集群
- 获取连接字符串
- 在 Vercel 中配置环境变量

### Q6: 请求超时怎么办？

Vercel 免费版有超时限制：
- Hobby 计划：10 秒
- Pro 计划：60 秒

如果请求需要更长时间，考虑：
- 优化代码
- 使用异步处理
- 升级到 Pro 计划

### Q7: 如何添加自定义域名？

1. 在 Vercel Dashboard 中
2. 点击项目 -> Settings -> Domains
3. 输入你的域名（如 `api.yourdomain.com`）
4. 按照提示配置 DNS：
   - 添加 CNAME 记录：`api` -> `cname.vercel-dns.com`
5. 等待 DNS 生效（通常几分钟）

---

## 📚 Vercel 限制说明

### 免费版（Hobby）限制

- ✅ 无限部署
- ✅ 100GB 带宽/月
- ✅ 100 次构建/天
- ⚠️ 函数执行时间：10 秒
- ⚠️ 文件大小：50MB
- ⚠️ 冷启动可能较慢

### 对于小程序后端

免费版通常足够开发和小规模使用。如果：
- 用户量较大
- 需要更快的响应
- 需要更长的执行时间

可以考虑升级到 Pro 计划（$20/月）

---

## 🎯 最佳实践

### 1. 使用环境变量

不要在代码中硬编码敏感信息：
```javascript
// ❌ 不好
const apiKey = 'secret-key-123';

// ✅ 好
const apiKey = process.env.API_KEY;
```

### 2. 错误处理

```javascript
app.post('/api/questionnaire/submit', async (req, res) => {
  try {
    // 处理逻辑
    res.json({ code: 200, data: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      code: 500, 
      message: '服务器错误' 
    });
  }
});
```

### 3. 日志记录

```javascript
console.log('Request received:', req.body);
console.error('Error occurred:', error);
```

日志可以在 Vercel Dashboard 中查看。

### 4. CORS 配置（如果需要）

```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://your-app.vercel.app'],
  credentials: true
}));
```

---

## 📖 下一步

部署成功后：

1. ✅ 获得 Vercel 域名
2. ✅ 在小程序中配置域名
3. ✅ 测试 API 接口
4. ✅ 配置微信小程序合法域名（真机测试）

参考文档：
- [快速配置后端API.md](./快速配置后端API.md)
- [API接口定义.md](./API接口定义.md)

---

## 🔗 相关链接

- Vercel 官网：https://vercel.com
- Vercel 文档：https://vercel.com/docs
- Vercel 示例：https://vercel.com/examples

