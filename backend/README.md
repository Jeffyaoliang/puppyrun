# 后端服务（测试版）

这是一个简单的测试后端，用于测试 Cloudflare Tunnel 连接。

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 启动服务器

```bash
npm start
```

服务器会在 `http://localhost:3000` 启动。

### 3. 测试接口

在浏览器访问：
- http://localhost:3000/api/test

### 4. 配置 Cloudflare Tunnel

Tunnel 配置文件中已设置：
```yaml
service: http://localhost:3000
```

启动 Tunnel 后，可以通过 `https://api.puppyrun.site/api/test` 访问。

## 接口说明

- `GET /api/test` - 测试接口
- `POST /api/questionnaire/submit` - 问卷提交（测试）
- `POST /api/questionnaire/upload-photo` - 照片上传（测试）

## 注意事项

这是测试后端，数据不会真正保存。
实际后端需要：
- 数据库连接
- 认证中间件
- 业务逻辑实现
- 等等

