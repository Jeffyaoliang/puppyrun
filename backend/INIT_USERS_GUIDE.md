# 初始用户数据导入指南

本文档说明如何创建和导入10-20个初始用户数据。

## 方法1：使用脚本批量创建（推荐）

### 步骤1：运行初始化脚本

```bash
cd backend
npm run init:users
```

或者直接运行：

```bash
node scripts/init-users.js
```

### 步骤2：查看生成的数据

脚本会在 `backend/data/` 目录下生成三个JSON文件：
- `users.json` - 用户基础信息（20个用户）
- `questionnaire.json` - 问卷数据
- `photos.json` - 照片数据

### 步骤3：导入到数据库（如果有数据库）

你可以将这些JSON数据导入到MySQL数据库中。示例SQL：

```sql
-- 导入用户数据
INSERT INTO users (uid, openid, phone, nickname, avatar, role, auth_status, age_bucket, city, status)
VALUES 
  (1, 'test_openid_001_xxx', '13000000001', '小明', '...', 'male_student', 'verified', '18-25', '北京', 'active'),
  -- ... 更多用户
```

## 方法2：通过API接口初始化

### 步骤1：启动服务器

```bash
npm start
```

### 步骤2：调用初始化接口

```bash
curl -X POST http://localhost:3000/api/admin/init-users
```

或者使用PowerShell：

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/init-users" -Method Post
```

### 步骤3：查看用户列表

```bash
curl http://localhost:3000/api/admin/users
```

## 方法3：手动通过小程序注册（最真实）

如果你想创建真实的用户数据，可以：

### 步骤1：准备测试账号

- 准备10-20个微信账号（可以是测试号）
- 或者使用真实微信号

### 步骤2：逐个注册

1. 打开微信小程序
2. 使用微信登录
3. 填写基础信息
4. 完成问卷
5. 上传照片（调用照片上传接口）
6. 完成身份认证

### 步骤3：批量操作脚本

可以创建一个批量操作脚本，自动调用API接口：

```javascript
// scripts/batch-register.js
const axios = require('axios');
const baseUrl = 'http://localhost:3000';

// 模拟注册流程
async function registerUser(userData) {
  // 1. 微信登录（需要真实的code）
  // 2. 提交问卷
  // 3. 上传照片
  // 4. 完成认证
}
```

## 创建的测试用户

脚本会创建20个测试用户：

### 男生（10个）
- 小明、张同学、李同学、王同学、刘同学
- 陈同学、杨同学、赵同学、周同学、吴同学
- 年龄段：18-25
- 城市：北京、上海、广州、深圳、杭州、成都、西安、南京、武汉、重庆

### 女生（10个）
- 小雨、美丽、优雅、温柔、智慧
- 阳光、精致、知性、独立、优雅
- 年龄段：28-38
- 城市：北京、上海、广州、深圳、杭州、成都、西安、南京、武汉、重庆

## 注意事项

### 1. OpenID是模拟的

测试用户的OpenID是模拟生成的（`test_openid_001_xxx`），实际使用时需要：
- 通过微信小程序获取真实的OpenID
- 或者使用微信开发者工具的测试账号

### 2. 照片需要真实上传

生成的用户数据中，照片URL是默认头像。你需要：
- 为每个用户上传真实照片
- 使用 `/api/questionnaire/upload-photo` 接口
- 照片上传后会自动获取AI评分

### 3. 认证状态

初始用户默认设置为 `verified`（已认证），但实际使用时：
- 需要上传真实证件
- 完成人脸识别
- 通过审核后才能设为 `verified`

## 推荐流程

1. **第一步**：运行初始化脚本创建基础数据
   ```bash
   npm run init:users
   ```

2. **第二步**：导入到数据库（如果有）
   - 将JSON数据转换为SQL
   - 导入到MySQL数据库

3. **第三步**：逐个上传照片
   - 为每个用户上传1-3张照片
   - 使用照片上传接口
   - 获取AI评分

4. **第四步**：完成认证（可选）
   - 上传证件照片
   - 完成人脸识别
   - 审核通过

## 后续操作

创建用户后，你可以：

1. **测试匹配功能**：使用匹配服务计算用户之间的匹配分数
2. **测试推荐算法**：查看匹配推荐是否正常工作
3. **测试聊天功能**：创建匹配后测试聊天功能
4. **数据分析**：分析用户数据分布和匹配效果

## 相关文件

- `scripts/init-users.js` - 初始化脚本
- `data/users.json` - 用户数据文件
- `data/questionnaire.json` - 问卷数据文件
- `data/photos.json` - 照片数据文件
- `server.js` - API接口（包含管理接口）

