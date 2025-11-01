# 服务模块测试指南

本文档说明如何测试新创建的AI服务和匹配服务模块。

## 快速开始

### 1. 运行自动化测试

```bash
# 使用Node.js直接运行
node test-services.js

# 或使用PowerShell脚本（Windows）
.\test-services.ps1

# 或使用批处理脚本（Windows）
.\test-services.bat
```

### 2. 测试API接口

```bash
# 启动服务器
npm start

# 在另一个终端运行API测试
.\test-api.ps1
```

## 详细测试说明

### 一、AI服务模块测试

#### 1.1 单元测试

AI服务模块测试包括：

- ✅ **初始化测试**：测试AI服务的初始化
- ✅ **默认评分测试**：测试获取默认评分功能
- ✅ **综合评分计算**：测试综合AI颜值评分计算
- ✅ **照片分析测试**：测试实际的照片分析功能（需要配置API Secret）

#### 1.2 配置Face++ API Secret

要测试实际的Face++ API调用，需要配置API Secret：

**方法1：环境变量（推荐）**

```bash
# Windows PowerShell
$env:FACEPP_API_SECRET="your-api-secret-here"
node test-services.js

# Windows CMD
set FACEPP_API_SECRET=your-api-secret-here
node test-services.js

# Linux/Mac
export FACEPP_API_SECRET="your-api-secret-here"
node test-services.js
```

**方法2：在代码中配置**

编辑 `backend/server.js`，在初始化部分添加：

```javascript
aiService.init({
  apiSecret: 'your-api-secret-here'
});
```

#### 1.3 测试照片上传接口

```bash
# 使用curl测试照片上传
curl -X POST http://localhost:3000/api/questionnaire/upload-photo \
  -F "photo=@/path/to/test-image.jpg" \
  -H "Content-Type: multipart/form-data"

# 使用PowerShell测试
$uri = "http://localhost:3000/api/questionnaire/upload-photo"
$filePath = ".\uploads\test-image.jpg"
$form = @{
    photo = Get-Item -Path $filePath
}
Invoke-RestMethod -Uri $uri -Method Post -Form $form
```

**预期响应：**

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "http://localhost:3000/uploads/xxx.jpg",
    "photoId": "1234567890",
    "qualityScore": 8.5,
    "aiScores": {
      "气质匹配度": 8.0,
      "风格契合度": 7.5,
      "整体协调度": 7.8
    },
    "faceDetected": true,
    "aiAnalysisSuccess": true
  }
}
```

### 二、匹配服务模块测试

#### 2.1 单元测试

匹配服务模块测试包括：

- ✅ **量化映射表测试**：测试选项量化映射
- ✅ **权重配置测试**：测试匹配权重配置
- ✅ **匹配分数计算**：测试两个用户的匹配分数计算
- ✅ **颜值匹配度**：测试颜值匹配度计算
- ✅ **综合AI评分**：测试综合AI颜值评分计算
- ✅ **批量匹配**：测试批量匹配功能
- ✅ **权重更新**：测试动态更新匹配权重

#### 2.2 测试匹配算法

匹配算法使用模拟数据进行测试，测试数据包括：

- **用户A**：运动、读书、旅行，期待长期soul mate，对颜值有点要求
- **用户B**：运动、电影，期待长期soul mate，更看重内在
- **用户C**：读书、旅行、摄影，期待短期伴侣，顶级颜控

**预期结果：**

- 用户A和用户B的匹配分数应该较高（共同兴趣、关系期望一致）
- 用户A和用户C的匹配分数应该较低（关系期望不一致）

#### 2.3 集成测试（在API中使用）

```javascript
// 在 server.js 的 /api/match/candidates 接口中使用
const { matchService } = require('./services/matchService');

app.get('/api/match/candidates', (req, res) => {
  // 从数据库获取当前用户和候选用户
  const currentUser = getCurrentUser(req);
  const candidateUsers = getCandidateUsers(req);
  
  // 使用匹配服务
  const matches = matchService.findBestMatches(currentUser, candidateUsers, {
    topN: 10,
    minScore: 70
  });
  
  res.json({
    code: 200,
    data: {
      candidates: matches.map(m => ({
        ...m.userInfo,
        matchScore: m.matchScore,
        matchReasons: m.matchReasons
      }))
    }
  });
});
```

## 测试场景

### 场景1：照片上传并获取AI评分

1. 启动服务器：`npm start`
2. 上传一张包含人脸的图片
3. 检查返回的AI评分数据
4. 验证评分数据格式正确

### 场景2：用户匹配计算

1. 准备两个用户的完整数据（问卷数据 + AI评分）
2. 调用 `matchService.calculateMatch(userA, userB)`
3. 验证返回的匹配分数和详细得分
4. 检查匹配原因是否合理

### 场景3：批量匹配

1. 准备当前用户数据和候选用户列表
2. 调用 `matchService.findBestMatches(currentUser, candidates, options)`
3. 验证返回的结果按匹配分数降序排序
4. 检查最低分数过滤是否生效

## 错误处理测试

### 测试AI服务错误处理

```javascript
// 测试无图片路径的情况
try {
  await aiService.analyzePhoto({});
} catch (error) {
  // 应该抛出错误：必须提供 imagePath 或 imageUrl 参数
}

// 测试API调用失败的情况（不配置API Secret）
const result = await aiService.analyzePhoto({
  imageUrl: 'https://invalid-url.com/image.jpg'
});
// 应该返回默认评分，success: false
```

### 测试匹配服务错误处理

```javascript
// 测试缺少用户数据的情况
try {
  matchService.calculateMatch(null, mockUserB);
} catch (error) {
  // 应该抛出错误：必须提供两个用户的数据
}

// 测试空候选列表
const matches = matchService.findBestMatches(mockUserA, []);
// 应该返回空数组
```

## 性能测试

### 批量照片分析性能

```javascript
// 测试批量分析性能
const photos = Array(10).fill(null).map((_, i) => ({
  imageUrl: `https://example.com/photo${i}.jpg`
}));

console.time('批量分析10张照片');
const results = await aiService.analyzePhotos(photos);
console.timeEnd('批量分析10张照片');
```

### 批量匹配性能

```javascript
// 测试批量匹配性能
const candidates = Array(100).fill(null).map((_, i) => ({
  userId: `user_${i}`,
  // ... 用户数据
}));

console.time('匹配100个候选用户');
const matches = matchService.findBestMatches(mockUserA, candidates, {
  topN: 10
});
console.timeEnd('匹配100个候选用户');
```

## 常见问题

### Q1: 测试时AI服务返回默认评分？

**A:** 如果没有配置 `FACEPP_API_SECRET` 环境变量，AI服务会使用默认评分。这是正常的降级行为。

### Q2: 如何验证Face++ API是否正常工作？

**A:** 
1. 配置正确的API Secret
2. 上传一张包含清晰人脸的图片
3. 检查返回结果中的 `faceDetected` 字段应该为 `true`
4. 检查 `aiAnalysisSuccess` 字段应该为 `true`

### Q3: 匹配分数为什么是0？

**A:** 检查用户数据是否完整：
- `interests` 数组
- `values` 对象（包含 `consumption`, `boundary`）
- `appearancePref` 对象（包含 `acceptance`）
- `aiScores` 对象（包含AI评分）

### Q4: 如何测试边界情况？

**A:** 测试以下边界情况：
- 空数组（`interests: []`）
- 缺失字段（`values: null`）
- 无效的选项值（不在量化映射表中的值）
- 极端分数值（AI评分为0或10）

## 下一步

测试通过后，可以：

1. ✅ 集成到实际的API接口中
2. ✅ 添加数据库持久化
3. ✅ 添加缓存机制（提高性能）
4. ✅ 添加监控和日志记录
5. ✅ 添加单元测试框架（如Jest）

