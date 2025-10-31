# 快速配置后端 API 指南

## 📌 问题说明

当前项目使用的是测试 API（`jsonplaceholder.typicode.com`），该服务不支持问卷提交等实际功能，因此会出现 404 错误。

要解决这个问题，需要配置真实的后端 API 地址。

## 🚀 快速配置步骤

### 步骤 1：修改配置文件

打开 `miniprogram/utils/config.ts`，找到第 29 行：

```typescript
// 当前配置（测试服务 - 不支持实际功能）
export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';
```

**修改为你的真实后端地址：**

```typescript
// 替换为你的后端 API 地址
export const API_BASE_URL = 'https://api.yourdomain.com';
```

**配置格式要求：**
- ✅ 必须使用 HTTPS（微信小程序强制要求）
- ✅ 只填写域名，不要包含路径
- ✅ 正确示例：`'https://api.example.com'`
- ❌ 错误示例：`'https://api.example.com/api'`（路径在 API_PATHS 中配置）

### 步骤 2：配置微信小程序合法域名（生产环境必须）

如果要在真机上测试或发布，必须在微信小程序后台配置合法域名：

1. **登录微信公众平台**
   - 访问：https://mp.weixin.qq.com/
   - 使用小程序账号登录

2. **进入开发设置**
   - 点击左侧菜单「开发」->「开发管理」->「开发设置」
   - 找到「服务器域名」配置区域

3. **添加合法域名**
   - 在「request合法域名」中添加你的 API 域名
   - **只填写域名**，不需要 `https://` 前缀
   - 例如：如果 API 地址是 `https://api.example.com`，则填写 `api.example.com`

4. **其他域名配置（如需要）**
   - **uploadFile合法域名**：用于上传文件（如照片上传）
   - **downloadFile合法域名**：用于下载文件
   - **socket合法域名**：用于 WebSocket 连接

### 步骤 3：开发环境设置（开发时可选）

在微信开发者工具中，可以临时跳过域名校验：

1. 点击右上角「详情」按钮
2. 选择「项目设置」标签
3. 勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」

**注意：** 此设置仅在开发工具中生效，真机上无效。

## 📋 配置示例

### 示例 1：标准生产环境

```typescript
// miniprogram/utils/config.ts
export const API_BASE_URL = 'https://api.yourdomain.com';
```

### 示例 2：测试环境

```typescript
export const API_BASE_URL = 'https://test-api.yourdomain.com';
```

### 示例 3：开发环境（本地后端）

如果你在本地运行后端服务器，可以使用以下方式：

**方式 A：使用内网穿透（推荐）**
```typescript
// 使用 ngrok、natapp 等工具生成 HTTPS 地址
export const API_BASE_URL = 'https://abc123.ngrok.io';
```

**方式 B：使用代理**
- 在微信开发者工具中配置代理
- 设置代理转发到本地后端

**方式 C：使用局域网 IP（仅开发工具）**
```typescript
// 注意：必须使用 HTTPS，且需要在开发者工具中关闭域名校验
export const API_BASE_URL = 'https://192.168.1.100:3000';
```

### 示例 4：根据环境自动切换

```typescript
// 根据环境变量切换
const isDev = true; // 开发环境
export const API_BASE_URL = isDev 
  ? 'https://dev-api.yourdomain.com'  // 开发环境
  : 'https://api.yourdomain.com';      // 生产环境
```

## ✅ 验证配置

配置完成后，可以通过以下方式验证：

1. **查看网络请求**
   - 打开微信开发者工具的「Network」或「网络」面板
   - 提交问卷时，查看请求地址是否为配置的地址
   - 例如：`https://api.yourdomain.com/api/questionnaire/submit`

2. **检查控制台**
   - 查看是否有新的错误信息
   - 404 错误应该消失，取而代之的是后端返回的响应

3. **测试功能**
   - 尝试提交问卷
   - 查看是否能正常提交（不再出现 404）

## 🔧 后端 API 要求

你的后端 API 需要满足以下要求：

### 1. 支持 HTTPS

微信小程序强制要求使用 HTTPS，不支持 HTTP。

### 2. 接口路径

确保后端实现了以下接口路径（根据 `API_PATHS` 配置）：

- `POST /api/questionnaire/submit` - 提交问卷
- `POST /api/questionnaire/upload-photo` - 上传照片
- `POST /api/auth/wechat-login` - 微信登录
- `POST /api/match/like` - 喜欢操作
- ... 等等

### 3. 响应格式

建议后端返回统一的响应格式：

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    // 具体数据
  }
}
```

### 4. 认证支持

后端需要支持 Bearer Token 认证：

```
Authorization: Bearer {token}
```

## ⚠️ 常见问题

### Q1: 配置后还是提示 404？

**可能原因：**
- 后端服务器未启动
- 后端未实现对应的接口路径
- 域名配置错误

**解决方法：**
- 检查后端服务是否正常运行
- 确认后端实现了 `/api/questionnaire/submit` 接口
- 检查 API_BASE_URL 配置是否正确

### Q2: 真机上无法访问？

**可能原因：**
- 未在微信小程序后台配置合法域名
- 域名未备案（国内服务器）
- SSL 证书问题

**解决方法：**
- 在微信小程序后台添加合法域名
- 确保域名已备案（国内服务器）
- 检查 SSL 证书是否有效

### Q3: 本地开发如何连接后端？

**推荐方案：**
1. 使用内网穿透工具（ngrok、natapp、frp 等）
2. 部署到测试服务器
3. 使用微信开发者工具的代理功能

### Q4: 可以使用 HTTP 吗？

❌ **不可以**。微信小程序强制要求使用 HTTPS。

## 📝 完整配置示例

```typescript
// miniprogram/utils/config.ts

// ============================================
// 后端 API 配置
// ============================================

// 生产环境（上线时使用）
export const API_BASE_URL = 'https://api.yourdomain.com';

// 开发环境（开发时使用）
// export const API_BASE_URL = 'https://dev-api.yourdomain.com';

// 测试环境（测试时使用）
// export const API_BASE_URL = 'https://test-api.yourdomain.com';

// API 接口路径
export const API_PATHS = {
  QUESTIONNAIRE_SUBMIT: '/api/questionnaire/submit',
  QUESTIONNAIRE_UPLOAD_PHOTO: '/api/questionnaire/upload-photo',
  // ... 其他路径
};

// 获取完整的 API URL
export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
```

## 📚 相关文档

- [API接口定义.md](./API接口定义.md) - 查看所有 API 接口定义
- [API配置说明.md](./API配置说明.md) - 详细的配置说明
- [项目开发指南.md](./项目开发指南.md) - 项目开发指南

## 🆘 需要帮助？

如果遇到问题，请检查：
1. 后端服务是否正常运行
2. 接口路径是否正确
3. 域名是否已配置
4. SSL 证书是否有效
5. 微信小程序后台域名配置是否正确

