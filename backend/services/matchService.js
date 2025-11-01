/**
 * 匹配服务模块
 * 封装匹配算法，提供用户匹配功能
 * 
 * 设计原则：
 * 1. 独立模块，不依赖其他业务逻辑
 * 2. 提供统一的匹配接口
 * 3. 支持单用户匹配和批量匹配
 */

const {
  calculateMatchScore,
  findBestMatches,
  calculateAppearanceMatch,
  calculateCompositeAIScore,
  mapAIScoreToQuantized,
  OPTION_QUANTIZATION,
  MATCH_WEIGHTS
} = require('../utils/matchAlgorithm');

/**
 * 匹配服务类
 * 封装匹配算法，提供用户匹配功能
 */
class MatchService {
  constructor() {
    this.optionQuantization = OPTION_QUANTIZATION;
    this.matchWeights = MATCH_WEIGHTS;
  }

  /**
   * 计算两个用户的匹配分数
   * 
   * @param {Object} userA - 用户A的数据
   * @param {Object} userB - 用户B的数据
   * @returns {Object} 匹配结果
   * 
   * 返回格式：
   * {
   *   totalScore: 85.5,              // 总分（0-100）
   *   detailScores: {                // 各项得分
   *     '兴趣爱好': 8.5,
   *     '期待关系性质': 32.0,
   *     '异性社交边界': 9.0,
   *     '颜值要求': 36.0
   *   },
   *   matchReasons: [                // 匹配原因
   *     '共同兴趣：运动、读书',
   *     '关系期望相近',
   *     '颜值匹配：有点要求的期望得到满足'
   *   ]
   * }
   */
  calculateMatch(userA, userB) {
    if (!userA || !userB) {
      throw new Error('必须提供两个用户的数据');
    }

    try {
      return calculateMatchScore(userA, userB);
    } catch (error) {
      console.error('匹配计算失败:', error.message);
      throw error;
    }
  }

  /**
   * 为用户找到最匹配的候选用户列表
   * 
   * @param {Object} currentUser - 当前用户数据
   * @param {Array<Object>} candidateUsers - 候选用户列表
   * @param {Object} options - 选项
   * @param {Number} options.topN - 返回前N个最匹配的用户，默认10
   * @param {Number} options.minScore - 最低匹配分数，默认0
   * @returns {Array<Object>} 排序后的匹配结果列表
   * 
   * 返回格式：
   * [
   *   {
   *     userId: 'user_001',
   *     userInfo: {...},
   *     matchScore: 85.5,
   *     detailScores: {...},
   *     matchReasons: [...]
   *   },
   *   ...
   * ]
   */
  findBestMatches(currentUser, candidateUsers, options = {}) {
    if (!currentUser) {
      throw new Error('必须提供当前用户数据');
    }

    if (!Array.isArray(candidateUsers) || candidateUsers.length === 0) {
      return [];
    }

    const { topN = 10, minScore = 0 } = options;

    try {
      // 调用底层匹配算法
      const results = findBestMatches(currentUser, candidateUsers, topN);

      // 过滤最低分数
      return results.filter(result => result.matchScore >= minScore);
    } catch (error) {
      console.error('批量匹配失败:', error.message);
      throw error;
    }
  }

  /**
   * 计算颜值匹配度
   * 
   * @param {Object} userA - 用户A的数据
   * @param {Object} userB - 用户B的数据
   * @returns {Number} 颜值匹配度（0-100分）
   */
  calculateAppearanceMatch(userA, userB) {
    return calculateAppearanceMatch(userA, userB);
  }

  /**
   * 计算综合AI颜值评分
   * 
   * @param {Object} aiScores - AI评分对象
   * @returns {Number} 综合AI颜值（1-10分）
   */
  calculateCompositeAIScore(aiScores) {
    return calculateCompositeAIScore(aiScores);
  }

  /**
   * 将AI评分映射到量化值
   * 
   * @param {Number} aiScore - AI评分（1-10分）
   * @returns {Number} 量化值（0-100）
   */
  mapAIScoreToQuantized(aiScore) {
    return mapAIScoreToQuantized(aiScore);
  }

  /**
   * 获取选项量化映射表
   * 
   * @returns {Object} 选项量化映射表
   */
  getOptionQuantization() {
    return this.optionQuantization;
  }

  /**
   * 获取匹配权重配置
   * 
   * @returns {Object} 匹配权重配置
   */
  getMatchWeights() {
    return this.matchWeights;
  }

  /**
   * 更新匹配权重配置
   * 
   * @param {Object} weights - 新的权重配置
   */
  updateMatchWeights(weights) {
    if (weights && typeof weights === 'object') {
      this.matchWeights = { ...this.matchWeights, ...weights };
      console.log('匹配权重已更新:', this.matchWeights);
    }
  }
}

// 创建单例实例
const matchService = new MatchService();

module.exports = {
  MatchService,
  matchService // 导出单例，方便直接使用
};

