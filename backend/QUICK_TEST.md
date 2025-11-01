# 快速测试指南

## 🚀 快速开始

### 方法1: 运行服务模块测试（推荐）

```bash
# Windows PowerShell
.\test-services.ps1

# Windows CMD
test-services.bat

# 或直接使用Node.js
node test-services.js
```

这会测试：
- ✅ AI服务模块的所有功能
- ✅ 匹配服务模块的所有功能
- ✅ 使用模拟数据进行测试（无需实际API调用）

### 方法2: 测试完整的API接口

**步骤1：启动服务器**

```bash
npm start
```

**步骤2：运行API测试**

```bash
# Windows PowerShell
.\test-api.ps1

# Windows CMD
test-api.bat
```

这会测试：
- ✅ 服务器连接
- ✅ 基础API接口
- ✅ 照片上传和AI评分（如果有测试图片）
- ✅ 匹配相关接口

## 📋 测试内容

### AI服务模块测试

1. **初始化测试** - 验证服务可以正常初始化
2. **默认评分** - 测试降级策略（未配置API Secret时）
3. **综合评分计算** - 测试多维度评分综合计算
4. **照片分析** - 测试实际的Face++ API调用（需配置API Secret）

### 匹配服务模块测试

1. **量化映射** - 测试选项量化映射表
2. **权重配置** - 测试匹配权重配置
3. **匹配计算** - 测试两个用户的匹配分数计算
4. **批量匹配** - 测试批量匹配功能
5. **颜值匹配** - 测试颜值匹配度计算

## 🔧 配置Face++ API Secret（可选）

如果要测试实际的Face++ API调用：

```bash
# Windows PowerShell
$env:FACEPP_API_SECRET="your-api-secret-here"
node test-services.js

# Windows CMD
set FACEPP_API_SECRET=your-api-secret-here
node test-services.js
```

## 📸 测试照片上传

1. 将测试图片放在 `uploads` 目录
2. 启动服务器：`npm start`
3. 运行API测试：`.\test-api.ps1`

或者使用curl：

```bash
curl -X POST http://localhost:3000/api/questionnaire/upload-photo \
  -F "photo=@path/to/your/image.jpg"
```

## ✅ 预期结果

### 服务模块测试
- 所有测试应该显示 ✓ 成功标记
- 匹配分数应该在合理范围内（0-100）
- AI评分应该在1-10范围内

### API测试
- 服务器应该正常响应
- 照片上传应该返回AI评分数据
- 所有接口应该返回正确的JSON格式

## 🐛 常见问题

**Q: 测试显示使用默认评分？**
- A: 这是正常的，如果没有配置API Secret，会使用默认评分作为降级策略

**Q: 如何验证Face++ API是否工作？**
- A: 配置API Secret后，上传包含人脸的图片，检查返回的 `faceDetected` 字段

**Q: 匹配分数为0？**
- A: 检查测试数据是否完整（interests, values, appearancePref, aiScores）

## 📚 更多信息

详细测试说明请查看：`TEST_GUIDE.md`

