/**
 * 服务模块测试脚本
 * 用于测试AI服务和匹配服务模块
 * 
 * 使用方法：
 * node test-services.js
 */

const { aiService } = require('./services/aiService');
const { matchService } = require('./services/matchService');
const path = require('path');
const fs = require('fs');

// 测试配置
const TEST_CONFIG = {
  // 如果上传目录有图片，可以用作测试
  testImagePath: null,
  // 或者使用在线图片URL进行测试
  testImageUrl: 'https://example.com/test-image.jpg'
};

// 颜色输出（Node.js控制台）
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'cyan');
  console.log('='.repeat(50));
}

function logTest(testName) {
  log(`\n[测试] ${testName}...`, 'yellow');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`  ${message}`, 'gray');
}

// 测试数据
const mockUserA = {
  userId: 'user_001',
  interests: ['运动', '读书', '旅行', '电影'],
  values: {
    consumption: '长期soul mate',
    boundary: '适度边界',
    communication: '直接沟通'
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

const mockUserB = {
  userId: 'user_002',
  interests: ['运动', '电影', '音乐'],
  values: {
    consumption: '长期soul mate',
    boundary: '适度边界',
    communication: '直接沟通'
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

const mockUserC = {
  userId: 'user_003',
  interests: ['读书', '旅行', '摄影'],
  values: {
    consumption: '短期伴侣',
    boundary: '严格边界',
    communication: '委婉沟通'
  },
  appearancePref: {
    acceptance: '顶级颜控'
  },
  aiScores: {
    ai_style_score: 9.0,
    ai_taste_score: 9.5,
    ai_coordination_score: 8.8
  }
};

/**
 * 测试AI服务模块
 */
async function testAIService() {
  logSection('AI服务模块测试');

  // 测试1: 初始化AI服务
  logTest('AI服务初始化');
  try {
    // 如果设置了环境变量，会自动初始化
    // 否则使用默认配置（不配置API Secret）
    aiService.init({
      apiSecret: process.env.FACEPP_API_SECRET || ''
    });
    logSuccess('AI服务初始化成功');
    logInfo(`初始化状态: ${aiService.isInitialized ? '已配置API Secret' : '使用默认评分'}`);
  } catch (error) {
    logError(`初始化失败: ${error.message}`);
  }

  // 测试2: 获取默认评分
  logTest('获取默认AI评分');
  try {
    const defaultScores = aiService.getDefaultScores();
    logSuccess('获取默认评分成功');
    logInfo(`默认评分: ${JSON.stringify(defaultScores, null, 2)}`);
  } catch (error) {
    logError(`获取默认评分失败: ${error.message}`);
  }

  // 测试3: 计算综合AI颜值评分
  logTest('计算综合AI颜值评分');
  try {
    const compositeScore = aiService.calculateCompositeScore(mockUserA.aiScores);
    logSuccess('计算综合评分成功');
    logInfo(`综合评分: ${compositeScore} (1-10分)`);
    logInfo(`输入数据: 风格=${mockUserA.aiScores.ai_style_score}, 气质=${mockUserA.aiScores.ai_taste_score}, 协调度=${mockUserA.aiScores.ai_coordination_score}`);
  } catch (error) {
    logError(`计算综合评分失败: ${error.message}`);
  }

  // 测试4: 分析照片（如果有测试图片）
  logTest('分析照片（使用默认评分）');
  try {
    // 检查是否有测试图片
    const uploadsDir = path.join(__dirname, 'uploads');
    let testImagePath = null;
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir).filter(f => 
        /\.(jpg|jpeg|png|gif)$/i.test(f)
      );
      if (files.length > 0) {
        testImagePath = path.join(uploadsDir, files[0]);
        logInfo(`找到测试图片: ${files[0]}`);
      }
    }

    if (testImagePath) {
      // 注意：如果没有配置API Secret，会使用默认评分
      const result = await aiService.analyzePhoto({
        imagePath: testImagePath
      });
      logSuccess('照片分析完成');
      logInfo(`成功: ${result.success}`);
      logInfo(`风格评分: ${result.ai_style_score}`);
      logInfo(`气质评分: ${result.ai_taste_score}`);
      logInfo(`协调度评分: ${result.ai_coordination_score}`);
      logInfo(`质量评分: ${result.quality_score}`);
      logInfo(`检测到人脸: ${result.faceDetected}`);
      if (result.error) {
        logInfo(`错误信息: ${result.error}`);
      }
    } else {
      logInfo('未找到测试图片，跳过实际API调用测试');
      logInfo('提示: 如果要测试实际API调用，请：');
      logInfo('1. 配置环境变量 FACEPP_API_SECRET');
      logInfo('2. 在 uploads 目录放置测试图片');
    }
  } catch (error) {
    logError(`照片分析失败: ${error.message}`);
  }
}

/**
 * 测试匹配服务模块
 */
function testMatchService() {
  logSection('匹配服务模块测试');

  // 测试1: 获取选项量化映射表
  logTest('获取选项量化映射表');
  try {
    const quantization = matchService.getOptionQuantization();
    logSuccess('获取量化映射表成功');
    logInfo(`量化选项数量: ${Object.keys(quantization).length}`);
    logInfo(`示例: ${JSON.stringify(quantization['期待关系性质'], null, 2)}`);
  } catch (error) {
    logError(`获取量化映射表失败: ${error.message}`);
  }

  // 测试2: 获取匹配权重配置
  logTest('获取匹配权重配置');
  try {
    const weights = matchService.getMatchWeights();
    logSuccess('获取权重配置成功');
    logInfo(`权重配置: ${JSON.stringify(weights, null, 2)}`);
  } catch (error) {
    logError(`获取权重配置失败: ${error.message}`);
  }

  // 测试3: 计算两个用户的匹配分数
  logTest('计算用户匹配分数');
  try {
    const matchResult = matchService.calculateMatch(mockUserA, mockUserB);
    logSuccess('匹配计算成功');
    logInfo(`总分: ${matchResult.totalScore} (0-100分)`);
    logInfo(`详细得分:`);
    Object.entries(matchResult.detailScores).forEach(([key, value]) => {
      logInfo(`  ${key}: ${value.toFixed(2)}`);
    });
    logInfo(`匹配原因: ${matchResult.matchReasons.join(', ')}`);
  } catch (error) {
    logError(`匹配计算失败: ${error.message}`);
  }

  // 测试4: 计算颜值匹配度
  logTest('计算颜值匹配度');
  try {
    const appearanceMatch = matchService.calculateAppearanceMatch(mockUserA, mockUserB);
    logSuccess('颜值匹配度计算成功');
    logInfo(`颜值匹配度: ${appearanceMatch.toFixed(2)} (0-100分)`);
    logInfo(`用户A要求: ${mockUserA.appearancePref.acceptance}`);
    logInfo(`用户B要求: ${mockUserB.appearancePref.acceptance}`);
  } catch (error) {
    logError(`颜值匹配度计算失败: ${error.message}`);
  }

  // 测试5: 计算综合AI颜值评分
  logTest('计算综合AI颜值评分');
  try {
    const compositeScoreA = matchService.calculateCompositeAIScore(mockUserA.aiScores);
    const compositeScoreB = matchService.calculateCompositeAIScore(mockUserB.aiScores);
    logSuccess('综合AI颜值评分计算成功');
    logInfo(`用户A综合评分: ${compositeScoreA} (1-10分)`);
    logInfo(`用户B综合评分: ${compositeScoreB} (1-10分)`);
  } catch (error) {
    logError(`综合AI颜值评分计算失败: ${error.message}`);
  }

  // 测试6: 批量匹配
  logTest('批量匹配测试');
  try {
    const candidates = [mockUserB, mockUserC];
    const matches = matchService.findBestMatches(mockUserA, candidates, {
      topN: 10,
      minScore: 0
    });
    logSuccess('批量匹配成功');
    logInfo(`候选用户数: ${candidates.length}`);
    logInfo(`匹配结果数: ${matches.length}`);
    matches.forEach((match, index) => {
      logInfo(`\n  匹配 ${index + 1}:`);
      logInfo(`    用户ID: ${match.userId}`);
      logInfo(`    匹配分数: ${match.matchScore.toFixed(2)}`);
      logInfo(`    匹配原因: ${match.matchReasons.join(', ')}`);
    });
  } catch (error) {
    logError(`批量匹配失败: ${error.message}`);
  }

  // 测试7: 更新匹配权重
  logTest('更新匹配权重配置');
  try {
    const oldWeights = { ...matchService.getMatchWeights() };
    matchService.updateMatchWeights({
      '兴趣爱好': 0.15,
      '期待关系性质': 0.35
    });
    const newWeights = matchService.getMatchWeights();
    logSuccess('权重更新成功');
    logInfo(`原权重: ${JSON.stringify(oldWeights)}`);
    logInfo(`新权重: ${JSON.stringify(newWeights)}`);
    
    // 恢复原权重
    matchService.updateMatchWeights(oldWeights);
    logInfo('已恢复原权重配置');
  } catch (error) {
    logError(`权重更新失败: ${error.message}`);
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.clear();
  log('\n开始测试服务模块...\n', 'cyan');

  try {
    // 测试AI服务
    await testAIService();

    // 测试匹配服务
    testMatchService();

    // 测试完成
    logSection('测试完成');
    logSuccess('所有测试已执行完成！');
    logInfo('\n提示:');
    logInfo('1. 要测试实际的Face++ API调用，请配置环境变量 FACEPP_API_SECRET');
    logInfo('2. 将测试图片放在 uploads 目录中进行照片分析测试');
    logInfo('3. 匹配算法测试使用的是模拟数据，实际使用时需要从数据库获取用户数据');

  } catch (error) {
    logError(`测试过程中发生错误: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch(error => {
    logError(`测试失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  testAIService,
  testMatchService,
  runTests
};

