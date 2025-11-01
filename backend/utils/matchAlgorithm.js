// 匹配算法模块
// 基于量化选项的匹配方案

/**
 * 选项量化映射表
 * 所有选项统一映射到 0-100 的数值范围，间距统一为 50
 */
const OPTION_QUANTIZATION = {
  // 期待关系性质（三个选项，间距50）
  '期待关系性质': {
    '短期伴侣': 0,        // 起点
    '长期soul mate': 50,  // 中点
    '命定姻缘': 100       // 终点
  },
  
  // 异性社交边界（三个选项，间距50）
  '异性社交边界': {
    '严格边界': 0,        // 起点
    '适度边界': 50,       // 中点
    '开放边界': 100       // 终点
  },
  
  // 颜值要求偏好（三个选项，间距50）
  // 注意：这是用户对颜值的要求程度，不是用户自己的颜值
  '颜值要求偏好': {
    '顶级颜控': 0,        // 对颜值要求极高（需要对方颜值很高）
    '有点要求': 50,       // 对颜值有中等要求（需要对方颜值中等以上）
    '更看重内在': 100     // 对颜值要求低（更看重内在）
  }
};

/**
 * 权重配置
 */
const MATCH_WEIGHTS = {
  '兴趣爱好': 0.1,        // 10%
  '期待关系性质': 0.4,    // 40%
  '异性社交边界': 0.1,    // 10%
  '颜值要求': 0.4         // 40%
};

/**
 * AI颜值评分映射
 * 将AI评分（1-10分）映射到0-100的量化值
 * 用于将实际颜值与颜值要求进行匹配
 */
function mapAIScoreToQuantized(aiScore) {
  /**
   * AI评分范围：1-10分
   * 映射到0-100：
   * - 1分 → 0（最低颜值）
   * - 5分 → 50（中等颜值）
   * - 10分 → 100（最高颜值）
   * 
   * 公式：量化值 = (aiScore - 1) / 9 * 100
   */
  if (aiScore === null || aiScore === undefined) {
    return 50; // 默认中等颜值
  }
  
  // 确保分数在1-10范围内
  const clampedScore = Math.max(1, Math.min(10, aiScore));
  
  // 线性映射：1分→0, 10分→100
  return ((clampedScore - 1) / 9) * 100;
}

/**
 * 计算综合AI颜值
 * 基于多维度AI评分计算综合颜值分数
 * 
 * @param {Object} aiScores - AI评分对象
 * @param {Number} aiScores.ai_style_score - AI风格评分（1-10）
 * @param {Number} aiScores.ai_taste_score - AI气质评分（1-10）
 * @param {Number} aiScores.ai_coordination_score - AI整体协调度（1-10）
 * @returns {Number} 综合AI颜值（1-10分）
 */
function calculateCompositeAIScore(aiScores) {
  /**
   * 综合计算公式：
   * 风格评分 * 30% + 气质评分 * 40% + 协调度 * 30%
   * 
   * 权重说明：
   * - 气质评分权重最高（40%），因为气质是整体印象的关键
   * - 风格和协调度各占30%
   */
  if (!aiScores) {
    return 5.0; // 默认中等颜值
  }
  
  const styleScore = aiScores.ai_style_score || 5.0;
  const tasteScore = aiScores.ai_taste_score || 5.0;
  const coordinationScore = aiScores.ai_coordination_score || 5.0;
  
  const compositeScore = 
    styleScore * 0.3 + 
    tasteScore * 0.4 + 
    coordinationScore * 0.3;
  
  return Math.round(compositeScore * 10) / 10; // 保留1位小数
}

/**
 * 计算颜值匹配度
 * 
 * 匹配逻辑：
 * - 用户A的"颜值要求" vs 用户B的"实际AI颜值"
 * - 用户B的"颜值要求" vs 用户A的"实际AI颜值"
 * - 取两者的平均值
 * 
 * @param {Object} userA - 用户A的数据
 * @param {Object} userB - 用户B的数据
 * @returns {Number} 颜值匹配度（0-100分）
 */
function calculateAppearanceMatch(userA, userB) {
  /**
   * 获取用户的颜值要求偏好（量化值0-100）
   */
  const acceptanceA = userA.appearancePref?.acceptance || '';
  const acceptanceB = userB.appearancePref?.acceptance || '';
  
  const requirementA = OPTION_QUANTIZATION['颜值要求偏好'][acceptanceA] ?? 50;
  const requirementB = OPTION_QUANTIZATION['颜值要求偏好'][acceptanceB] ?? 50;
  
  /**
   * 获取用户的实际AI颜值评分
   * 如果用户有多张照片，取主照片（is_primary=1）的评分
   * 如果没有主照片，取所有照片的平均值
   */
  const actualAIScoreA = userA.aiScores 
    ? calculateCompositeAIScore(userA.aiScores)
    : 5.0; // 默认中等颜值
  
  const actualAIScoreB = userB.aiScores 
    ? calculateCompositeAIScore(userB.aiScores)
    : 5.0; // 默认中等颜值
  
  /**
   * 将AI评分映射到0-100量化值
   */
  const quantizedAIScoreA = mapAIScoreToQuantized(actualAIScoreA);
  const quantizedAIScoreB = mapAIScoreToQuantized(actualAIScoreB);
  
  /**
   * 匹配逻辑：
   * 1. 用户A对颜值的要求 vs 用户B的实际颜值
   *    - 如果A是"顶级颜控"（0），需要B的实际颜值接近100（高颜值）
   *    - 如果A是"有点要求"（50），需要B的实际颜值接近50（中等颜值）
   *    - 如果A是"更看重内在"（100），对B的实际颜值要求低（可以接受低颜值）
   * 
   * 2. 用户B对颜值的要求 vs 用户A的实际颜值
   *    同上逻辑
   * 
   * 3. 计算双向匹配度并取平均值
   */
  
  // 方向1：A的要求 vs B的实际颜值
  // 差异越小，匹配度越高
  const diff1 = Math.abs(requirementA - quantizedAIScoreB);
  const matchScore1 = 100 - diff1; // 0-100分
  
  // 方向2：B的要求 vs A的实际颜值
  const diff2 = Math.abs(requirementB - quantizedAIScoreA);
  const matchScore2 = 100 - diff2; // 0-100分
  
  // 双向匹配度取平均值
  const finalMatchScore = (matchScore1 + matchScore2) / 2;
  
  // 确保分数在0-100范围内
  return Math.max(0, Math.min(100, finalMatchScore));
}

/**
 * 计算匹配分数（完整版）
 * 
 * @param {Object} userA - 用户A的问卷数据
 * @param {Object} userB - 用户B的问卷数据
 * @returns {Object} 匹配结果，包含总分和各项得分
 * 
 * 数据结构示例：
 * userA = {
 *   userId: 'user_001',
 *   interests: ['运动', '读书', '旅行'],
 *   values: {
 *     consumption: '长期soul mate',  // 期待关系性质
 *     boundary: '适度边界',           // 异性社交边界
 *   },
 *   appearancePref: {
 *     acceptance: '有点要求'          // 颜值要求（偏好）
 *   },
 *   aiScores: {                      // 实际AI颜值评分
 *     ai_style_score: 7.5,
 *     ai_taste_score: 8.0,
 *     ai_coordination_score: 7.8
 *   }
 * }
 */
function calculateMatchScore(userA, userB) {
  const scores = {};
  
  // 1. 计算兴趣爱好匹配度（权重 0.1）
  const interestsA = new Set(userA.interests || []);
  const interestsB = new Set(userB.interests || []);
  
  const intersection = new Set([...interestsA].filter(x => interestsB.has(x)));
  const union = new Set([...interestsA, ...interestsB]);
  
  const interestSimilarity = union.size > 0 
    ? (intersection.size / union.size) * 100 
    : 0;
  
  scores['兴趣爱好'] = interestSimilarity * MATCH_WEIGHTS['兴趣爱好'];
  
  // 2. 计算期待关系性质匹配度（权重 0.4）
  const consumptionA = OPTION_QUANTIZATION['期待关系性质'][userA.values?.consumption] ?? 50;
  const consumptionB = OPTION_QUANTIZATION['期待关系性质'][userB.values?.consumption] ?? 50;
  
  const consumptionDiff = Math.abs(consumptionA - consumptionB);
  const consumptionMatch = 100 - consumptionDiff;
  
  scores['期待关系性质'] = consumptionMatch * MATCH_WEIGHTS['期待关系性质'];
  
  // 3. 计算异性社交边界匹配度（权重 0.1）
  const boundaryA = OPTION_QUANTIZATION['异性社交边界'][userA.values?.boundary] ?? 50;
  const boundaryB = OPTION_QUANTIZATION['异性社交边界'][userB.values?.boundary] ?? 50;
  
  const boundaryDiff = Math.abs(boundaryA - boundaryB);
  const boundaryMatch = 100 - boundaryDiff;
  
  scores['异性社交边界'] = boundaryMatch * MATCH_WEIGHTS['异性社交边界'];
  
  // 4. 计算颜值要求匹配度（权重 0.4）
  // 注意：这里使用修正后的双向匹配逻辑
  const appearanceMatch = calculateAppearanceMatch(userA, userB);
  scores['颜值要求'] = appearanceMatch * MATCH_WEIGHTS['颜值要求'];
  
  // 5. 计算总分
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  
  // 6. 生成匹配原因
  const matchReasons = generateMatchReasons(scores, userA, userB);
  
  return {
    totalScore: Math.round(totalScore * 100) / 100,
    detailScores: scores,
    matchReasons: matchReasons
  };
}

/**
 * 生成匹配原因说明
 */
function generateMatchReasons(scores, userA, userB) {
  const reasons = [];
  
  // 兴趣爱好匹配原因
  const commonInterests = (userA.interests || []).filter(
    interest => (userB.interests || []).includes(interest)
  );
  if (commonInterests.length > 0) {
    reasons.push(`共同兴趣：${commonInterests.slice(0, 3).join('、')}`);
  }
  
  // 期待关系性质匹配原因
  const consumptionA = userA.values?.consumption;
  const consumptionB = userB.values?.consumption;
  
  if (consumptionA && consumptionB && consumptionA === consumptionB) {
    reasons.push(`关系期望一致：${consumptionA}`);
  } else if (consumptionA && consumptionB) {
    const quantizedA = OPTION_QUANTIZATION['期待关系性质'][consumptionA] ?? 50;
    const quantizedB = OPTION_QUANTIZATION['期待关系性质'][consumptionB] ?? 50;
    const diff = Math.abs(quantizedA - quantizedB);
    if (diff <= 50) {
      reasons.push('关系期望相近');
    }
  }
  
  // 颜值匹配原因
  const acceptanceA = userA.appearancePref?.acceptance || '';
  const acceptanceB = userB.appearancePref?.acceptance || '';
  const requirementA = OPTION_QUANTIZATION['颜值要求偏好'][acceptanceA] ?? 50;
  const requirementB = OPTION_QUANTIZATION['颜值要求偏好'][acceptanceB] ?? 50;
  const actualAIScoreA = userA.aiScores ? calculateCompositeAIScore(userA.aiScores) : 5.0;
  const actualAIScoreB = userB.aiScores ? calculateCompositeAIScore(userB.aiScores) : 5.0;
  const quantizedAIScoreA = mapAIScoreToQuantized(actualAIScoreA);
  const quantizedAIScoreB = mapAIScoreToQuantized(actualAIScoreB);
  
  // 检查A的要求是否被B满足
  if (acceptanceA && acceptanceA !== '') {
    const diffA = Math.abs(requirementA - quantizedAIScoreB);
    if (diffA <= 25) {
      reasons.push(`颜值匹配：${acceptanceA}的期望得到满足`);
    }
  }
  
  // 检查B的要求是否被A满足
  if (acceptanceB && acceptanceB !== '') {
    const diffB = Math.abs(requirementB - quantizedAIScoreA);
    if (diffB <= 25) {
      reasons.push(`颜值匹配：${acceptanceB}的期望得到满足`);
    }
  }
  
  return reasons.slice(0, 3);
}

/**
 * 批量匹配：为用户A找到最匹配的候选用户列表
 * 
 * @param {Object} userA - 当前用户A的问卷数据
 * @param {Array} candidateUsers - 候选用户列表
 * @param {Number} topN - 返回前N个最匹配的用户，默认10
 * @returns {Array} 排序后的匹配结果列表
 */
function findBestMatches(userA, candidateUsers, topN = 10) {
  // 确保只匹配异性（严格过滤）
  const userARole = userA.role;
  
  // 如果当前用户角色未知，不返回任何匹配结果（安全策略）
  if (!userARole || (userARole !== 'female' && userARole !== 'male_student')) {
    console.warn(`⚠️ 警告: 用户A的角色未知或无效: ${userARole}，不返回匹配结果`);
    return [];
  }
  
  const filteredCandidates = candidateUsers.filter(userB => {
    const userBRole = userB.role;
    
    // 如果候选用户角色未知，排除该用户
    if (!userBRole || (userBRole !== 'female' && userBRole !== 'male_student')) {
      return false;
    }
    
    // 严格性别匹配：女生只能匹配男生，男生只能匹配女生
    if (userARole === 'female') {
      return userBRole === 'male_student';
    } else if (userARole === 'male_student') {
      return userBRole === 'female';
    }
    
    // 其他情况一律排除（安全策略）
    return false;
  });
  
  // 为每个候选用户计算匹配分数
  const matchResults = filteredCandidates.map(userB => {
    const matchResult = calculateMatchScore(userA, userB);
    return {
      userId: userB.userId || userB.uid,
      userInfo: userB,
      matchScore: matchResult.totalScore,
      detailScores: matchResult.detailScores,
      matchReasons: matchResult.matchReasons
    };
  });
  
  // 按匹配分数降序排序
  matchResults.sort((a, b) => b.matchScore - a.matchScore);
  
  // 最终安全检查：确保返回结果中不包含同性用户
  const finalResults = matchResults.filter(result => {
    const candidateRole = result.userInfo.role;
    
    // 再次验证性别匹配
    if (userARole === 'female' && candidateRole !== 'male_student') {
      console.error(`❌ 发现同性用户被包含在结果中: ${result.userId} (${result.userInfo.nickname}), 角色: ${candidateRole}`);
      return false;
    }
    if (userARole === 'male_student' && candidateRole !== 'female') {
      console.error(`❌ 发现同性用户被包含在结果中: ${result.userId} (${result.userInfo.nickname}), 角色: ${candidateRole}`);
      return false;
    }
    
    return true;
  });
  
  if (finalResults.length !== matchResults.length) {
    console.warn(`⚠️ 最终检查过滤掉了 ${matchResults.length - finalResults.length} 个同性用户`);
  }
  
  // 返回前N个
  return finalResults.slice(0, topN);
}

module.exports = {
  calculateMatchScore,
  findBestMatches,
  calculateAppearanceMatch,
  calculateCompositeAIScore,
  mapAIScoreToQuantized,
  OPTION_QUANTIZATION,
  MATCH_WEIGHTS
};

