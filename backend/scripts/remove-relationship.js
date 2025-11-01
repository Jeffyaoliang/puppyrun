/**
 * 删除 relationship 字段脚本
 * 
 * 使用方法：
 * node scripts/remove-relationship.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const QUESTIONNAIRE_FILE = path.join(DATA_DIR, 'questionnaire.json');

function removeRelationship() {
  console.log('开始删除 relationship 字段...\n');
  
  if (!fs.existsSync(QUESTIONNAIRE_FILE)) {
    console.log('问卷数据文件不存在，跳过更新');
    return;
  }
  
  try {
    // 读取数据
    const rawData = fs.readFileSync(QUESTIONNAIRE_FILE, 'utf8');
    const questionnaires = JSON.parse(rawData);
    
    console.log(`读取到 ${questionnaires.length} 条问卷数据`);
    
    // 删除 relationship 字段
    const updatedQuestionnaires = questionnaires.map(q => {
      const updated = { ...q };
      if (updated.relationship) {
        delete updated.relationship;
      }
      return updated;
    });
    
    // 保存更新后的数据
    fs.writeFileSync(QUESTIONNAIRE_FILE, JSON.stringify(updatedQuestionnaires, null, 2), 'utf8');
    
    console.log('✅ relationship 字段删除完成！');
    console.log(`\n数据文件位置: ${QUESTIONNAIRE_FILE}`);
    
  } catch (error) {
    console.error('删除失败:', error);
    process.exit(1);
  }
}

// 运行删除
if (require.main === module) {
  removeRelationship();
}

module.exports = { removeRelationship };

