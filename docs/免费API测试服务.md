# 免费API测试服务推荐

## 推荐方案（按优先级）

### 1. JSONPlaceholder ⭐⭐⭐⭐⭐
**最适合：测试基本API请求**

- **地址**：`https://jsonplaceholder.typicode.com`
- **优点**：
  - 完全免费，无需注册
  - 支持 GET、POST、PUT、DELETE 等操作
  - 响应格式标准（JSON）
  - 非常稳定
- **限制**：
  - 不支持文件上传
  - 数据只是模拟数据，不会真正保存
- **适用场景**：测试问卷提交、数据获取等基础功能

**配置示例**：
```typescript
export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';
```

**接口映射示例**（需要调整接口路径以匹配 JSONPlaceholder）：
```typescript
// 注意：需要修改 API_PATHS 以匹配 JSONPlaceholder 的接口
// 例如：提交问卷可以映射到 /posts
API_PATHS.QUESTIONNAIRE_SUBMIT = '/posts';
```

---

### 2. httpbin.org ⭐⭐⭐⭐
**最适合：测试文件上传和HTTP请求**

- **地址**：`https://httpbin.org`
- **优点**：
  - ✅ **支持文件上传**（/post）
  - 完全免费，无需注册
  - 返回请求的详细信息，便于调试
- **限制**：
  - 主要用于测试，不是真正的后端
  - 响应格式与项目可能不匹配
- **适用场景**：测试照片上传功能

**配置示例**：
```typescript
export const API_BASE_URL = 'https://httpbin.org';
```

**接口映射**：
```typescript
// 文件上传接口
API_PATHS.QUESTIONNAIRE_UPLOAD_PHOTO = '/post';
```

---

### 3. MockAPI.io ⭐⭐⭐
**最适合：需要自定义Mock数据的场景**

- **地址**：`https://your-project-id.mockapi.io`
- **优点**：
  - 可以自定义数据结构
  - 支持 CRUD 操作
  - 数据会保存（模拟）
- **缺点**：
  - 需要注册账号
  - 免费版有请求限制
- **使用步骤**：
  1. 访问 https://mockapi.io
  2. 注册账号
  3. 创建项目
  4. 获取项目 URL（格式：`https://xxxxx.mockapi.io`）

**配置示例**：
```typescript
export const API_BASE_URL = 'https://your-project-id.mockapi.io';
```

---

### 4. Postman Mock Server ⭐⭐⭐
**最适合：已有Postman环境的开发者**

- **地址**：`https://your-project-id.mock.pstmn.io`
- **优点**：
  - 可以精确控制响应格式
  - 与Postman无缝集成
- **缺点**：
  - 需要Postman账号
  - 需要手动创建Mock规则

---

## 快速开始（推荐方案）

### 方案A：使用 JSONPlaceholder（最简单）

1. **修改配置文件** `miniprogram/utils/config.ts`：
```typescript
export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';
```

2. **临时调整接口路径**（仅用于测试）：
```typescript
// 在 questionnaire.ts 中临时修改
// 提交问卷可以使用 /posts 接口
API_PATHS.QUESTIONNAIRE_SUBMIT = '/posts';
```

3. **注意**：JSONPlaceholder 不支持文件上传，照片上传功能无法测试

---

### 方案B：使用 httpbin.org（支持文件上传）

1. **修改配置文件**：
```typescript
export const API_BASE_URL = 'https://httpbin.org';
```

2. **调整上传接口**：
```typescript
API_PATHS.QUESTIONNAIRE_UPLOAD_PHOTO = '/post';
```

3. **注意**：httpbin.org 返回的响应格式可能与项目不匹配，需要调整代码处理响应

---

## 临时测试配置示例

### 完整配置示例（使用 JSONPlaceholder）

```typescript
// miniprogram/utils/config.ts

// 临时测试配置（仅用于开发测试）
export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

// 临时接口映射（注意：这些只是测试，不会真正保存数据）
export const API_PATHS = {
  // 问卷提交（映射到 posts，仅测试）
  QUESTIONNAIRE_SUBMIT: '/posts',
  
  // 照片上传（JSONPlaceholder不支持，需要使用 httpbin.org）
  QUESTIONNAIRE_UPLOAD_PHOTO: '/post', // 如果使用 httpbin.org
  
  // 其他接口暂时使用相同路径
  // ...
};
```

---

## 重要提醒

⚠️ **这些服务只是临时测试方案**：

1. **数据不会真正保存**：这些Mock服务不会真正保存你的数据
2. **接口格式不匹配**：响应格式可能与项目要求不同
3. **功能限制**：某些功能（如认证、支付）无法测试
4. **最终方案**：项目上线前必须使用自己的后端服务器

---

## 下一步：搭建自己的后端

### 选项1：使用云服务（推荐）

- **腾讯云**：https://cloud.tencent.com/
- **阿里云**：https://www.aliyun.com/
- **AWS**：https://aws.amazon.com/
- **Vercel**：https://vercel.com/（免费，适合小项目）

### 选项2：本地开发

- 使用 Node.js + Express
- 使用 Python + Flask/Django
- 使用其他后端框架

### 选项3：后端即服务（BaaS）

- **Firebase**：https://firebase.google.com/
- **Supabase**：https://supabase.com/（开源替代Firebase）
- **Appwrite**：https://appwrite.io/

---

## 配置验证

配置完成后，在微信开发者工具中：

1. 确保已勾选「不校验合法域名」（开发环境）
2. 重新编译项目
3. 尝试提交问卷或上传照片
4. 查看控制台 Network 面板，确认请求地址正确

---

## 常见问题

**Q: 使用这些测试服务会泄露数据吗？**  
A: 不会，但建议不要提交真实敏感数据，这些服务只用于功能测试。

**Q: 可以在生产环境使用吗？**  
A: ❌ 绝对不可以！这些服务仅用于开发测试，生产环境必须使用自己的后端服务器。

**Q: 照片上传无法测试怎么办？**  
A: 可以先跳过照片上传功能，或者使用 httpbin.org 测试上传接口的调用（虽然数据不会保存）。

