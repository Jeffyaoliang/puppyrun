# 服务模块说明

本目录包含独立封装的业务服务模块，提供统一的接口，便于维护和扩展。

## 模块列表

### 1. AI服务模块 (`aiService.js`)

封装旷视Face++ API调用，提供统一的颜值打分接口。

#### 功能特性

- ✅ 独立的服务模块，不依赖其他业务逻辑
- ✅ 统一的接口设计，便于替换底层实现
- ✅ 完善的错误处理和降级策略
- ✅ 支持单张照片和批量照片分析
- ✅ 支持综合AI颜值评分计算

#### 使用方法

```javascript
const { aiService } = require('./services/aiService');

// 初始化（可选，也可以通过环境变量配置）
aiService.init({
  apiSecret: 'your-facepp-api-secret'
});

// 分析单张照片
const result = await aiService.analyzePhoto({
  imagePath: '/path/to/image.jpg',  // 本地文件路径（可选）
  imageUrl: 'https://example.com/image.jpg'  // 图片URL（可选，优先使用）
});

// 返回结果
// {
//   success: true,
//   ai_style_score: 7.5,           // 风格评分（1-10）
//   ai_taste_score: 8.0,           // 气质评分（1-10）
//   ai_coordination_score: 7.8,     // 协调度评分（1-10）
//   quality_score: 8.5,             // 质量评分（1-10）
//   faceDetected: true,             // 是否检测到人脸
//   gender: 'Male' | 'Female',      // 性别（可选）
//   age: 25,                        // 年龄（可选）
//   error: null                     // 错误信息（如果有）
// }

// 批量分析照片
const photos = [
  { imageUrl: 'https://example.com/photo1.jpg' },
  { imageUrl: 'https://example.com/photo2.jpg' }
];
const results = await aiService.analyzePhotos(photos);

// 计算综合AI颜值评分
const compositeScore = aiService.calculateCompositeScore({
  ai_style_score: 7.5,
  ai_taste_score: 8.0,
  ai_coordination_score: 7.8
});
// 返回: 7.7 (1-10分)
```

#### 环境变量配置

可以通过环境变量 `FACEPP_API_SECRET` 配置API Secret，无需在代码中硬编码。

### 2. 匹配服务模块 (`matchService.js`)

封装匹配算法，提供用户匹配功能。

#### 功能特性

- ✅ 独立的服务模块，不依赖其他业务逻辑
- ✅ 提供统一的匹配接口
- ✅ 支持单用户匹配和批量匹配
- ✅ 可配置的匹配权重
- ✅ 详细的匹配结果和原因

#### 使用方法

```javascript
const { matchService } = require('./services/matchService');

// 计算两个用户的匹配分数
const userA = {
  userId: 'user_001',
  interests: ['运动', '读书', '旅行'],
  values: {
    consumption: '长期soul mate',
    boundary: '适度边界'
  },
  appearancePref: {
    acceptance: '有点要求'
  },
  aiScores: {
    ai_style_score: 7.5,
    ai_taste_score: 8.0,
    ai_coordination_score: 7.8
  }
};

const userB = {
  userId: 'user_002',
  interests: ['运动', '电影'],
  values: {
    consumption: '长期soul mate',
    boundary: '适度边界'
  },
  appearancePref: {
    acceptance: '更看重内在'
  },
  aiScores: {
    ai_style_score: 6.5,
    ai_taste_score: 7.0,
    ai_coordination_score: 6.8
  }
};

// 计算匹配分数
const matchResult = matchService.calculateMatch(userA, userB);
// 返回:
// {
//   totalScore: 85.5,
//   detailScores: {
//     '兴趣爱好': 8.5,
//     '期待关系性质': 32.0,
//     '异性社交边界': 9.0,
//     '颜值要求': 36.0
//   },
//   matchReasons: [
//     '共同兴趣：运动',
//     '关系期望一致：长期soul mate',
//     '颜值匹配：有点要求的期望得到满足'
//   ]
// }

// 批量匹配：为用户找到最匹配的候选用户列表
const candidateUsers = [userB, /* ...更多用户 */];
const matches = matchService.findBestMatches(userA, candidateUsers, {
  topN: 10,        // 返回前10个最匹配的用户
  minScore: 70     // 最低匹配分数
});

// 返回匹配结果列表（按匹配分数降序排序）
// [
//   {
//     userId: 'user_002',
//     userInfo: {...},
//     matchScore: 85.5,
//     detailScores: {...},
//     matchReasons: [...]
//   },
//   ...
// ]

// 单独计算颜值匹配度
const appearanceMatch = matchService.calculateAppearanceMatch(userA, userB);
// 返回: 75.5 (0-100分)

// 计算综合AI颜值评分
const compositeScore = matchService.calculateCompositeAIScore(userA.aiScores);
// 返回: 7.7 (1-10分)

// 更新匹配权重配置
matchService.updateMatchWeights({
  '兴趣爱好': 0.15,
  '期待关系性质': 0.35
});
```

## 向后兼容性

- ✅ `utils/facepp.js` 和 `utils/matchAlgorithm.js` 仍然保留，可以继续使用
- ✅ 新代码推荐使用 `services/` 目录下的服务模块
- ✅ 服务模块内部调用底层工具函数，保持功能一致性

## 迁移指南

### 从 `utils/facepp.js` 迁移到 `services/aiService.js`

**旧代码：**
```javascript
const { analyzePhotoWithFacePP } = require('./utils/facepp');
const result = await analyzePhotoWithFacePP(imagePath, imageUrl);
```

**新代码：**
```javascript
const { aiService } = require('./services/aiService');
const result = await aiService.analyzePhoto({ imagePath, imageUrl });
```

### 从 `utils/matchAlgorithm.js` 迁移到 `services/matchService.js`

**旧代码：**
```javascript
const { calculateMatchScore, findBestMatches } = require('./utils/matchAlgorithm');
const result = calculateMatchScore(userA, userB);
const matches = findBestMatches(userA, candidates, 10);
```

**新代码：**
```javascript
const { matchService } = require('./services/matchService');
const result = matchService.calculateMatch(userA, userB);
const matches = matchService.findBestMatches(userA, candidates, { topN: 10 });
```

## 设计原则

1. **独立性**：服务模块不依赖其他业务逻辑，可以独立测试和使用
2. **统一接口**：提供统一的接口，便于替换底层实现
3. **错误处理**：完善的错误处理和降级策略
4. **向后兼容**：保持对旧代码的兼容性
5. **可扩展性**：易于扩展和维护

