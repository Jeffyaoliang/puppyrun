/**
 * 数据清理脚本
 * 用于清理JSON数据文件中的字符串空格问题
 * 
 * 使用方法：
 * node scripts/clean-data.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const QUESTIONNAIRE_FILE = path.join(DATA_DIR, 'questionnaire.json');

// 清理字符串数据
function cleanStringData(obj) {
  // 处理 null 或 undefined
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // 处理字符串
  if (typeof obj === 'string') {
    // 去除所有类型的空白字符（包括不可见字符），首尾空格，并将多个连续空格替换为单个空格
    return obj
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // 去除零宽字符
      .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // 将所有特殊空格替换为普通空格
      .trim() // 去除首尾空格
      .replace(/\s+/g, ' '); // 将多个连续空格替换为单个空格
  }
  
  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => cleanStringData(item));
  }
  
  // 处理对象
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cleaned[key] = cleanStringData(obj[key]);
      }
    }
    return cleaned;
  }
  
  // 其他类型（数字、布尔值等）直接返回
  return obj;
}

function cleanData() {
  console.log('开始清理数据文件...\n');
  
  if (!fs.existsSync(QUESTIONNAIRE_FILE)) {
    console.log('问卷数据文件不存在，跳过清理');
    return;
  }
  
  try {
    // 读取数据
    const rawData = fs.readFileSync(QUESTIONNAIRE_FILE, 'utf8');
    const questionnaires = JSON.parse(rawData);
    
    console.log(`读取到 ${questionnaires.length} 条问卷数据`);
    
    // 清理数据
    const cleanedData = cleanStringData(questionnaires);
    
    // 保存清理后的数据
    fs.writeFileSync(QUESTIONNAIRE_FILE, JSON.stringify(cleanedData, null, 2), 'utf8');
    
    console.log('✅ 数据清理完成！');
    console.log(`\n数据文件位置: ${QUESTIONNAIRE_FILE}`);
    
  } catch (error) {
    console.error('清理数据失败:', error);
    process.exit(1);
  }
}

// 运行清理
if (require.main === module) {
  cleanData();
}

module.exports = { cleanData, cleanStringData };

