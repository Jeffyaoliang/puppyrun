# 如何获取后端 API 域名

## 📋 场景说明

根据你的实际情况，选择对应的方案：

---

## 🖥️ 场景 1：已有后端服务器

如果你已经有后端服务器运行，获取域名的方式：

### 方式 A：已有域名

如果你的服务器已经有域名：

1. **直接使用现有域名**
   ```typescript
   export const API_BASE_URL = 'https://api.yourdomain.com';
   ```

2. **配置子域名（推荐）**
   - 如果你的主域名是 `yourdomain.com`
   - 可以创建子域名 `api.yourdomain.com` 指向服务器
   - 在域名解析中添加 A 记录或 CNAME 记录

### 方式 B：只有 IP 地址

如果只有服务器 IP，需要先申请域名：

1. **购买域名**
   - 国内：阿里云、腾讯云、华为云等
   - 国外：Namecheap、GoDaddy 等
   - 价格：通常几十元/年

2. **域名解析**
   - 登录域名管理后台
   - 添加 A 记录：`api` -> `你的服务器IP`
   - 等待 DNS 生效（通常几分钟到几小时）

3. **配置 SSL 证书**
   - 使用 Let's Encrypt（免费）
   - 或购买商业 SSL 证书
   - 安装到服务器上

---

## ☁️ 场景 2：使用云服务平台

### 方案 A：阿里云 / 腾讯云 / 华为云

#### 1. 购买云服务器（ECS）

- 选择配置（2核4G 足够开发测试）
- 选择操作系统（推荐 Ubuntu 或 CentOS）
- 购买并启动

#### 2. 申请域名（可选）

- 在云平台购买域名（.com 约 50-100元/年）
- 或在其他平台购买后解析到云服务器

#### 3. 域名解析

在域名管理后台：
- 添加 A 记录：`api` -> `云服务器公网IP`
- 等待生效

#### 4. 配置 HTTPS

**使用 Let's Encrypt（免费）：**

```bash
# 安装 Certbot
sudo apt-get update
sudo apt-get install certbot

# 申请证书（替换为你的域名）
sudo certbot certonly --standalone -d api.yourdomain.com

# 证书位置：
# /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/api.yourdomain.com/privkey.pem
```

#### 5. 配置后端服务

启动后端服务并配置 HTTPS：
- 使用 Nginx 反向代理
- 或直接在 Node.js/Java 等服务中配置 HTTPS

---

### 方案 B：使用云函数/Serverless（推荐新手）

#### 阿里云函数计算（FC）

1. **创建函数**
   - 登录阿里云控制台
   - 创建函数计算服务
   - 上传后端代码

2. **配置自定义域名**
   - 在函数计算控制台配置自定义域名
   - 会自动提供 HTTPS 支持
   - 域名格式：`xxx.cn-hangzhou.fc.aliyuncs.com`

#### 腾讯云云函数（SCF）

1. **创建云函数**
   - 登录腾讯云控制台
   - 创建云函数
   - 上传代码

2. **配置 API 网关**
   - 创建 API 网关服务
   - 绑定云函数
   - 配置自定义域名（可选）

#### Vercel / Netlify（国外，免费）

1. **注册账号**
   - 访问 https://vercel.com 或 https://netlify.com
   - 使用 GitHub 账号登录

2. **部署后端**
   - 连接 GitHub 仓库
   - 自动部署

3. **获得域名**
   - Vercel：`your-project.vercel.app`
   - Netlify：`your-project.netlify.app`
   - 或配置自定义域名

---

## 🏠 场景 3：本地开发

### 方案 A：内网穿透（推荐）

#### 使用 ngrok（免费）

1. **注册并下载**
   ```bash
   # 访问 https://ngrok.com
   # 注册账号并下载客户端
   ```

2. **启动本地后端**
   ```bash
   # 假设后端运行在 3000 端口
   npm start  # 或你的启动命令
   ```

3. **启动 ngrok**
   ```bash
   # Windows
   ngrok.exe http 3000

   # 会得到类似这样的地址：
   # https://abc123.ngrok.io
   ```

4. **配置小程序**
   ```typescript
   export const API_BASE_URL = 'https://abc123.ngrok.io';
   ```

#### 使用 natapp（国内，免费）

1. **注册账号**
   - 访问 https://natapp.cn
   - 注册账号

2. **下载客户端**
   - 下载对应系统的客户端

3. **配置并启动**
   ```bash
   # 配置隧道（免费版）
   natapp -authtoken=你的token

   # 会得到类似这样的地址：
   # https://xxx.natapp1.cc
   ```

#### 使用 frp（自建，免费）

1. **部署 frp 服务器**
   - 在有公网 IP 的服务器上部署 frps
   - 或使用云服务器

2. **配置客户端**
   - 在本地运行 frpc
   - 配置端口映射

---

### 方案 B：微信开发者工具代理

1. **配置代理**
   - 在微信开发者工具中配置代理
   - 将请求转发到本地后端

2. **设置**
   - 工具 -> 设置 -> 代理设置
   - 配置本地后端地址

---

## 📝 完整示例：使用阿里云部署

### 步骤 1：购买云服务器

1. 登录阿里云控制台
2. 购买 ECS 实例（按量付费或包年包月）
3. 配置安全组（开放 80、443 端口）

### 步骤 2：购买域名（可选）

1. 在阿里云购买域名（如 `example.com`）
2. 或使用免费二级域名（不推荐生产环境）

### 步骤 3：域名解析

1. 进入域名控制台
2. 添加解析记录：
   - 记录类型：A
   - 主机记录：`api`（会生成 `api.example.com`）
   - 记录值：云服务器公网 IP
   - TTL：10 分钟

### 步骤 4：部署后端

1. SSH 连接到服务器
2. 安装 Node.js/Java/Python 等运行环境
3. 上传后端代码
4. 启动后端服务

### 步骤 5：配置 HTTPS

**使用 Nginx + Let's Encrypt：**

```bash
# 安装 Nginx
sudo apt-get install nginx

# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d api.example.com

# 配置 Nginx
sudo nano /etc/nginx/sites-available/default
```

Nginx 配置示例：
```nginx
server {
    listen 443 ssl;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 步骤 6：配置小程序

```typescript
export const API_BASE_URL = 'https://api.example.com';
```

---

## 📝 完整示例：使用 Vercel 部署（最简单）

### 步骤 1：准备后端代码

确保你的后端代码支持 Serverless：
- Node.js Express
- 或其他框架

### 步骤 2：部署到 Vercel

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   cd your-backend-project
   vercel
   ```

4. **获得域名**
   - 部署成功后会得到：`your-project.vercel.app`
   - 或配置自定义域名

### 步骤 3：配置小程序

```typescript
export const API_BASE_URL = 'https://your-project.vercel.app';
```

---

## 🔧 快速测试方案（临时）

### 使用 httpbin.org（仅测试 GET 请求）

```typescript
export const API_BASE_URL = 'https://httpbin.org';
```

**限制：** 不支持 POST 提交数据，仅用于测试网络连接

### 使用 MockAPI.io（免费 Mock 服务）

1. **注册账号**
   - 访问 https://mockapi.io
   - 注册账号

2. **创建项目**
   - 创建新项目
   - 获得 API 地址：`https://xxxxx.mockapi.io`

3. **配置**
   ```typescript
   export const API_BASE_URL = 'https://xxxxx.mockapi.io';
   ```

**限制：** 功能有限，适合原型开发

---

## ⚠️ 注意事项

### 1. HTTPS 是必须的

微信小程序强制要求 HTTPS，不支持 HTTP。

### 2. 域名备案（国内服务器）

如果使用国内服务器：
- 域名必须完成备案
- 备案通常需要 1-2 周
- 可以使用临时方案（内网穿透）先开发

### 3. SSL 证书

- **免费方案：** Let's Encrypt（推荐）
- **商业方案：** 阿里云、腾讯云 SSL 证书
- **自动续期：** 配置 Certbot 自动续期

### 4. 开发环境 vs 生产环境

```typescript
// 开发环境（可以使用内网穿透）
const isDev = true;
export const API_BASE_URL = isDev 
  ? 'https://abc123.ngrok.io'           // 开发环境
  : 'https://api.yourdomain.com';       // 生产环境
```

---

## 📚 推荐方案对比

| 方案 | 难度 | 成本 | 适合场景 |
|------|------|------|----------|
| **云服务器 + 域名** | ⭐⭐⭐ | 💰💰 | 生产环境 |
| **云函数/Serverless** | ⭐⭐ | 💰 | 中小型项目 |
| **Vercel/Netlify** | ⭐ | 免费 | 原型/小项目 |
| **内网穿透** | ⭐ | 免费 | 本地开发 |
| **MockAPI** | ⭐ | 免费 | 快速测试 |

---

## 🆘 常见问题

### Q1: 我没有服务器怎么办？

**A:** 可以选择：
- 使用云函数（阿里云、腾讯云）
- 使用 Vercel/Netlify（免费）
- 使用内网穿透（本地开发）

### Q2: 域名一定要备案吗？

**A:** 
- **国内服务器：** 必须备案
- **国外服务器：** 不需要备案，但访问可能较慢
- **本地开发：** 不需要

### Q3: 可以用 IP 地址吗？

**A:** 
- ❌ 微信小程序不支持直接使用 IP 地址
- ✅ 必须先申请域名，再解析到 IP

### Q4: 免费域名可以用吗？

**A:**
- 免费二级域名（如 `xxx.tk`、`xxx.ml`）通常不被微信认可
- 建议使用正式域名（`.com`、`.cn` 等）

### Q5: 本地开发必须用内网穿透吗？

**A:**
- 不一定，可以在微信开发者工具中配置代理
- 但内网穿透更方便，可以真机调试

---

## 📖 下一步

配置好域名后，参考：
- [快速配置后端API.md](./快速配置后端API.md) - 如何在小程序中配置
- [API接口定义.md](./API接口定义.md) - 后端需要实现的接口

