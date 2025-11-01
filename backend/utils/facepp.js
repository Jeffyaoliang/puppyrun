// Face++ API 调用模块
// 用于调用旷视Face++ API进行人脸检测和颜值评分

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Face++ API 配置
const FACEPP_CONFIG = {
  apiKey: '3IpTRg4eokauuxGVJIALQjj2uiAuYfqM',
  apiSecret: process.env.FACEPP_API_SECRET || 'HfS00DI4f1THF7BWH0_h8D_Twxe0m_sg', // 优先使用环境变量
  detectUrl: 'https://api-cn.faceplusplus.com/facepp/v3/detect',
  analyzeUrl: 'https://api-cn.faceplusplus.com/facepp/v3/face/analyze'
};

/**
 * 调用Face++ API进行人脸检测和颜值评分
 * 
 * @param {String} imagePath - 图片文件路径（本地路径）
 * @param {String} imageUrl - 图片URL（可选，优先使用URL）
 * @returns {Promise<Object>} AI评分结果
 * 
 * 返回格式：
 * {
 *   success: true,
 *   ai_style_score: 7.5,      // 风格评分（1-10）
 *   ai_taste_score: 8.0,       // 气质评分（1-10）
 *   ai_coordination_score: 7.8, // 协调度评分（1-10）
 *   quality_score: 8.5,        // 质量评分（1-10）
 *   faceDetected: true         // 是否检测到人脸
 * }
 */
async function analyzePhotoWithFacePP(imagePath, imageUrl = null) {
  try {
    // 检查API Secret是否配置
    if (!FACEPP_CONFIG.apiSecret) {
      console.warn('Face++ API Secret未配置，使用默认评分');
      return {
        success: false,
        ...getDefaultAIScores(),
        faceDetected: false,
        error: 'API Secret未配置'
      };
    }
    
    console.log('Face++ API配置检查:', {
      apiKey: FACEPP_CONFIG.apiKey ? '已配置' : '未配置',
      apiSecret: FACEPP_CONFIG.apiSecret ? '已配置（已隐藏）' : '未配置'
    });

    // 准备请求参数
    const formData = new FormData();
    formData.append('api_key', FACEPP_CONFIG.apiKey);
    formData.append('api_secret', FACEPP_CONFIG.apiSecret);
    
    // 设置返回属性：颜值评分、年龄、性别等
    formData.append('return_attributes', 'beauty,age,gender,smiling,headpose,facequality,blur,eyestatus,emotion,ethnicity');

    // 优先使用本地文件路径（Face++ API可以直接读取文件）
    // 如果图片URL是localhost，则使用本地文件路径
    if (imagePath && fs.existsSync(imagePath)) {
      // 读取本地文件
      console.log('使用本地文件路径:', imagePath);
      const imageStream = fs.createReadStream(imagePath);
      formData.append('image_file', imageStream);
    } else if (imageUrl && !imageUrl.includes('localhost')) {
      // 只有当URL不是localhost时才使用URL（Face++无法访问localhost）
      console.log('使用图片URL:', imageUrl);
      formData.append('image_url', imageUrl);
    } else {
      throw new Error('图片路径或URL无效');
    }

    // 调用Face++ API
    console.log('调用Face++ API进行人脸分析...');
    const response = await axios.post(FACEPP_CONFIG.detectUrl, formData, {
      headers: formData.getHeaders(),
      timeout: 10000 // 10秒超时
    });

    // 解析响应
    const data = response.data;
    
    // 检查是否检测到人脸
    if (!data.faces || data.faces.length === 0) {
      console.warn('Face++ API未检测到人脸');
      return {
        success: false,
        ...getDefaultAIScores(),
        faceDetected: false,
        error: '未检测到人脸'
      };
    }

    // 获取第一个人脸的分析结果（通常照片只有一个人）
    const face = data.faces[0];
    const attributes = face.attributes || {};

    // 提取颜值评分
    // Face++返回的beauty评分范围通常是0-100，需要转换为1-10分
    const beauty = attributes.beauty || {};
    const maleScore = beauty.male_score || 50;   // 男性颜值评分（0-100）
    const femaleScore = beauty.female_score || 50; // 女性颜值评分（0-100）

    // 获取性别信息（用于选择对应的颜值评分）
    const gender = attributes.gender || {};
    const genderValue = gender.value || 'Male'; // Male 或 Female
    
    // 根据性别选择对应的颜值评分
    const beautyScore = genderValue === 'Male' ? maleScore : femaleScore;
    
    // 将0-100的评分转换为1-10分
    // 公式：1-10分 = (0-100分 / 10) + 1，但为了更好的分布，使用线性映射
    const normalizedBeautyScore = (beautyScore / 10); // 0-100 -> 0-10，再加1确保范围是1-10
    const finalBeautyScore = Math.max(1, Math.min(10, normalizedBeautyScore));

    // 获取其他属性用于综合评分
    const faceQuality = attributes.facequality || {};
    const qualityValue = faceQuality.value || 50; // 人脸质量（0-100）
    const qualityScore = Math.max(1, Math.min(10, (qualityValue / 10)));

    // 获取微笑程度（0-100）
    const smiling = attributes.smiling || {};
    const smilingValue = smiling.value || 50;
    const smilingScore = Math.max(1, Math.min(10, (smilingValue / 10)));

    // 综合计算三个维度的评分
    // 风格评分：基于颜值和微笑程度
    const styleScore = (finalBeautyScore * 0.7 + smilingScore * 0.3);
    
    // 气质评分：基于颜值和性别特征
    const tasteScore = finalBeautyScore * 0.8 + (genderValue === 'Female' ? 0.5 : 0);
    
    // 协调度：基于整体质量和颜值
    const coordinationScore = (finalBeautyScore * 0.6 + qualityScore * 0.4);

    console.log('Face++ API分析结果:', {
      beautyScore: finalBeautyScore,
      qualityScore: qualityScore,
      gender: genderValue,
      styleScore: styleScore,
      tasteScore: tasteScore,
      coordinationScore: coordinationScore
    });

    return {
      success: true,
      // 直接颜值评分（1-10分，基于Face++的beauty评分）
      beauty_score: Math.round(finalBeautyScore * 10) / 10,
      // 多维度综合评分
      ai_style_score: Math.round(styleScore * 10) / 10,
      ai_taste_score: Math.round(tasteScore * 10) / 10,
      ai_coordination_score: Math.round(coordinationScore * 10) / 10,
      quality_score: Math.round(qualityScore * 10) / 10,
      faceDetected: true,
      gender: genderValue,
      age: attributes.age ? attributes.age.value : null,
      // 原始Face++评分（0-100分）
      rawBeautyScore: {
        male_score: maleScore,
        female_score: femaleScore,
        selected_score: beautyScore
      },
      rawData: {
        beauty: beauty,
        quality: faceQuality,
        smiling: smiling
      }
    };

  } catch (error) {
    console.error('Face++ API调用失败:', error.message);
    if (error.response) {
      console.error('API响应错误:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('API请求失败，无法连接到Face++服务器');
    }
    
    // API调用失败时返回默认评分
    return {
      success: false,
      ...getDefaultAIScores(),
      faceDetected: false,
      error: error.message || 'API调用失败'
    };
  }
}

/**
 * 获取默认AI评分（当API调用失败时使用）
 * 
 * @returns {Object} 默认评分
 */
function getDefaultAIScores() {
  // 返回中等评分（5-6分范围）
  return {
    ai_style_score: 5.5,
    ai_taste_score: 5.5,
    ai_coordination_score: 5.5,
    quality_score: 5.5
  };
}

/**
 * 设置API Secret
 * 
 * @param {String} apiSecret - Face++ API Secret
 */
function setApiSecret(apiSecret) {
  FACEPP_CONFIG.apiSecret = apiSecret;
}

module.exports = {
  analyzePhotoWithFacePP,
  getDefaultAIScores,
  setApiSecret
};

