# 后端 API 配置说明

## 配置文件位置

配置文件位于：`miniprogram/utils/config.ts`

## 配置格式

### 1. 基本格式

```typescript
export const API_BASE_URL = 'https://your-api-domain.com';
```

### 2. 格式要求

- ✅ **必须使用 HTTPS**：微信小程序要求所有 API 请求必须使用 HTTPS 协议
- ✅ **只配置域名**：不要包含路径，例如：
  - ✅ 正确：`'https://api.example.com'`
  - ❌ 错误：`'https://api.example.com/api'`（路径在 API_PATHS 中配置）
- ✅ **不要带端口号**：如果使用默认端口（443），可以不写
  - ✅ 标准格式：`'https://api.example.com'`
  - ⚠️ 特殊情况：`'https://api.example.com:8443'`（非标准端口）

### 3. 常见配置示例

#### 示例 1：标准生产环境
```typescript
export const API_BASE_URL = 'https://api.yourdomain.com';
```

#### 示例 2：测试环境
```typescript
export const API_BASE_URL = 'https://test-api.yourdomain.com';
```

#### 示例 3：本地开发（使用代理）
```typescript
// 方式1：使用代理地址（推荐）
export const API_BASE_URL = 'https://localhost:3000';

// 方式2：使用内网地址
export const API_BASE_URL = 'https://192.168.1.100:3000';
```

#### 示例 4：区分开发/生产环境
```typescript
// 根据环境变量或标志位切换
const isDev = true; // 开发环境

export const API_BASE_URL = isDev 
  ? 'https://dev-api.yourdomain.com'  // 开发环境
  : 'https://api.yourdomain.com';      // 生产环境
```

## 配置步骤

### 步骤 1：修改配置文件

打开 `miniprogram/utils/config.ts`，修改 `API_BASE_URL`：

```typescript
export const API_BASE_URL = 'https://your-actual-api-domain.com';
```

### 步骤 2：配置微信小程序合法域名（生产环境必须）

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入「开发」->「开发管理」->「开发设置」
3. 找到「服务器域名」配置
4. 在「request合法域名」中添加你的 API 域名（不需要 https:// 前缀）
   - 例如：`api.yourdomain.com`

**重要提示：**
- 域名必须已备案（如果是国内服务器）
- 必须支持 HTTPS，且证书有效
- 上传文件需要配置「uploadFile合法域名」
- 下载文件需要配置「downloadFile合法域名」

### 步骤 3：开发环境设置

在微信开发者工具中：
1. 点击「详情」->「项目设置」
2. 勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」
3. 这样在开发时可以访问未配置的域名（仅限开发环境）

## API 路径配置

API 路径在 `API_PATHS` 对象中配置，会自动拼接到 `API_BASE_URL` 后面：

```typescript
// 例如：
API_BASE_URL = 'https://api.example.com'
API_PATHS.QUESTIONNAIRE_SUBMIT = '/api/questionnaire/submit'

// 最终请求地址：
// https://api.example.com/api/questionnaire/submit
```

## 验证配置

配置完成后，可以：

1. **查看控制台**：检查网络请求是否正确发送到配置的地址
2. **测试接口**：尝试上传照片或提交问卷，查看是否成功
3. **检查错误**：如果还有错误，查看控制台的错误信息

## 常见问题

### Q1: 为什么配置后还是提示连接失败？

**A:** 可能的原因：
- 域名未在微信小程序后台配置（生产环境）
- 服务器未启动或无法访问
- 网络连接问题
- SSL 证书问题

### Q2: 本地开发如何连接后端？

**A:** 推荐方式：
1. 使用代理工具（如 Charles、Fiddler）
2. 在开发者工具中配置代理
3. 或使用内网穿透工具（如 ngrok）

### Q3: 可以使用 HTTP 吗？

**A:** ❌ 不可以。微信小程序强制要求使用 HTTPS。

### Q4: 如何测试不同环境的 API？

**A:** 可以创建多个配置文件，或使用环境变量：
```typescript
// config.dev.ts - 开发环境
export const API_BASE_URL = 'https://dev-api.example.com';

// config.prod.ts - 生产环境
export const API_BASE_URL = 'https://api.example.com';
```

## 完整示例

```typescript
// miniprogram/utils/config.ts

// 生产环境配置
export const API_BASE_URL = 'https://api.yourdomain.com';

// 或者开发环境配置
// export const API_BASE_URL = 'https://dev-api.yourdomain.com';

// API 路径
export const API_PATHS = {
  QUESTIONNAIRE_SUBMIT: '/api/questionnaire/submit',
  QUESTIONNAIRE_UPLOAD_PHOTO: '/api/questionnaire/upload-photo',
  // ... 其他路径
};

// 获取完整 URL
export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
```

## 注意事项

1. ⚠️ **不要提交敏感信息**：不要在代码中硬编码包含密钥的 URL
2. ⚠️ **域名必须备案**：国内服务器必须完成域名备案
3. ⚠️ **SSL 证书有效**：确保 HTTPS 证书有效且未过期
4. ⚠️ **生产环境配置**：上线前必须在微信后台配置合法域名

