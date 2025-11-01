/**
 * AI服务模块
 * 封装旷视Face++ API调用，提供统一的颜值打分接口
 * 
 * 设计原则：
 * 1. 独立模块，不依赖其他业务逻辑
 * 2. 提供统一的接口，便于替换底层实现
 * 3. 完善的错误处理和降级策略
 */

const { analyzePhotoWithFacePP, getDefaultAIScores, setApiSecret } = require('../utils/facepp');

/**
 * AI服务类
 * 封装旷视API调用，提供颜值打分功能
 */
class AIService {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * 初始化AI服务
   * @param {Object} config - 配置对象
   * @param {String} config.apiSecret - Face++ API Secret
   */
  init(config = {}) {
    if (config.apiSecret) {
      setApiSecret(config.apiSecret);
      this.isInitialized = true;
      console.log('AI服务已初始化');
    } else {
      console.warn('AI服务未配置API Secret，将使用默认评分');
    }
  }

  /**
   * 分析照片并返回AI评分
   * 
   * @param {Object} options - 分析选项
   * @param {String} options.imagePath - 图片本地文件路径（可选）
   * @param {String} options.imageUrl - 图片URL（可选，优先使用）
   * @returns {Promise<Object>} AI评分结果
   * 
   * 返回格式：
   * {
   *   success: true,
   *   ai_style_score: 7.5,           // 风格评分（1-10）
   *   ai_taste_score: 8.0,           // 气质评分（1-10）
   *   ai_coordination_score: 7.8,     // 协调度评分（1-10）
   *   quality_score: 8.5,             // 质量评分（1-10）
   *   faceDetected: true,             // 是否检测到人脸
   *   gender: 'Male' | 'Female',      // 性别（可选）
   *   age: 25,                        // 年龄（可选）
   *   error: null                     // 错误信息（如果有）
   * }
   */
  async analyzePhoto(options = {}) {
    const { imagePath, imageUrl } = options;

    if (!imagePath && !imageUrl) {
      throw new Error('必须提供 imagePath 或 imageUrl 参数');
    }

    try {
      // 调用底层Face++ API
      const result = await analyzePhotoWithFacePP(imagePath, imageUrl);
      
      // 标准化返回格式
      return {
        success: result.success !== false,
        // 直接颜值评分（1-10分，基于Face++的beauty评分）
        beauty_score: result.beauty_score || null,
        // 多维度综合评分
        ai_style_score: result.ai_style_score || 5.5,
        ai_taste_score: result.ai_taste_score || 5.5,
        ai_coordination_score: result.ai_coordination_score || 5.5,
        quality_score: result.quality_score || 5.5,
        faceDetected: result.faceDetected || false,
        gender: result.gender || null,
        age: result.age || null,
        // 原始Face++评分（0-100分）
        rawBeautyScore: result.rawBeautyScore || null,
        error: result.error || null,
        rawData: result.rawData || null
      };
    } catch (error) {
      console.error('AI服务分析照片失败:', error.message);
      
      // 返回默认评分，确保服务降级
      const defaultScores = getDefaultAIScores();
      return {
        success: false,
        ...defaultScores,
        faceDetected: false,
        error: error.message
      };
    }
  }

  /**
   * 批量分析照片
   * 
   * @param {Array<Object>} photos - 照片列表，每个对象包含 imagePath 或 imageUrl
   * @returns {Promise<Array<Object>>} 分析结果列表
   */
  async analyzePhotos(photos = []) {
    if (!Array.isArray(photos) || photos.length === 0) {
      return [];
    }

    // 并发分析，但限制并发数避免API限流
    const batchSize = 3; // 每次处理3张照片
    const results = [];

    for (let i = 0; i < photos.length; i += batchSize) {
      const batch = photos.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(photo => this.analyzePhoto(photo))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * 获取默认AI评分（用于降级场景）
   * 
   * @returns {Object} 默认评分对象
   */
  getDefaultScores() {
    return getDefaultAIScores();
  }

  /**
   * 计算综合AI颜值评分
   * 基于多维度评分计算综合分数
   * 
   * @param {Object} aiScores - AI评分对象
   * @param {Number} aiScores.ai_style_score - 风格评分
   * @param {Number} aiScores.ai_taste_score - 气质评分
   * @param {Number} aiScores.ai_coordination_score - 协调度评分
   * @returns {Number} 综合评分（1-10分）
   */
  calculateCompositeScore(aiScores) {
    if (!aiScores) {
      return 5.0;
    }

    const styleScore = aiScores.ai_style_score || 5.0;
    const tasteScore = aiScores.ai_taste_score || 5.0;
    const coordinationScore = aiScores.ai_coordination_score || 5.0;

    // 权重：气质40%，风格30%，协调度30%
    const compositeScore = 
      styleScore * 0.3 + 
      tasteScore * 0.4 + 
      coordinationScore * 0.3;

    return Math.round(compositeScore * 10) / 10;
  }
}

// 创建单例实例
const aiService = new AIService();

module.exports = {
  AIService,
  aiService // 导出单例，方便直接使用
};

