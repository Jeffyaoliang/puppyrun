/**
 * 服务模块统一导出
 * 提供统一的服务接口入口
 */

const { aiService, AIService } = require('./aiService');
const { matchService, MatchService } = require('./matchService');

module.exports = {
  // AI服务
  aiService,
  AIService,
  
  // 匹配服务
  matchService,
  MatchService
};

