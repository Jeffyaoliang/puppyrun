/**
 * 更新问卷数据结构脚本
 * 将 social_needs 改为 relationship，从 values.boundary 获取值
 * 删除 basic_info.schedule 字段
 * 
 * 使用方法：
 * node scripts/update-questionnaire-schema.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const QUESTIONNAIRE_FILE = path.join(DATA_DIR, 'questionnaire.json');

function updateQuestionnaireSchema() {
  console.log('开始更新问卷数据结构...\n');
  
  if (!fs.existsSync(QUESTIONNAIRE_FILE)) {
    console.log('问卷数据文件不存在，跳过更新');
    return;
  }
  
  try {
    // 读取数据
    const rawData = fs.readFileSync(QUESTIONNAIRE_FILE, 'utf8');
    const questionnaires = JSON.parse(rawData);
    
    console.log(`读取到 ${questionnaires.length} 条问卷数据`);
    
    // 更新每条问卷数据
    const updatedQuestionnaires = questionnaires.map(q => {
      const updated = { ...q };
      
      // 删除 basic_info.schedule
      if (updated.basic_info && updated.basic_info.schedule) {
        delete updated.basic_info.schedule;
      }
      
      // 将 social_needs 改为 relationship，从 values.boundary 获取值使用
      if (updated.social_needs) {
        delete updated.social_needs;
      }
      
      // 从 values.boundary 获取关系边界设置
      if (updated.values && updated.values.boundary) {
        updated.relationship = updated.values.boundary;
      } else {
        // 如果没有 boundary，设置默认值
        updated.relationship = '适度边界';
      }
      
      return updated;
    });
    
    // 保存更新后的数据
    fs.writeFileSync(QUESTIONNAIRE_FILE, JSON.stringify(updatedQuestionnaires, null, 2), 'utf8');
    
    console.log('✅ 问卷数据结构更新完成！');
    console.log(`\n更新内容:`);
    console.log(`  - 删除了 basic_info.schedule 字段`);
    console.log(`  - 将 social_needs 改为 relationship`);
    console.log(`  - relationship 值从 values.boundary 获取`);
    console.log(`\n数据文件位置: ${QUESTIONNAIRE_FILE}`);
    
  } catch (error) {
    console.error('更新失败:', error);
    process.exit(1);
  }
}

// 运行更新
if (require.main === module) {
  updateQuestionnaireSchema();
}

module.exports = { updateQuestionnaireSchema };

