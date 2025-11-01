/**
 * 删除指定用户及其照片记录
 */

const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const photosPath = path.join(__dirname, '../data/photos.json');
const questionnairePath = path.join(__dirname, '../data/questionnaire.json');

// 要删除的用户昵称列表
const NICKNAMES_TO_DELETE = ['红儿', '梅儿', '雪小姐', '敏小姐', '燕儿', '芳小姐'];

function deleteUsers() {
  console.log('='.repeat(60));
  console.log('删除用户脚本');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    // 读取数据
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));
    const questionnaires = fs.existsSync(questionnairePath)
      ? JSON.parse(fs.readFileSync(questionnairePath, 'utf8'))
      : [];
    
    // 查找要删除的用户
    const usersToDelete = users.filter(u => NICKNAMES_TO_DELETE.includes(u.nickname));
    const uidsToDelete = usersToDelete.map(u => u.uid);
    
    if (usersToDelete.length === 0) {
      console.log('未找到要删除的用户');
      return;
    }
    
    console.log(`找到 ${usersToDelete.length} 个要删除的用户:`);
    usersToDelete.forEach(u => {
      console.log(`  - UID ${u.uid}: ${u.nickname} (${u.role})`);
    });
    console.log('');
    
    // 删除用户
    const remainingUsers = users.filter(u => !NICKNAMES_TO_DELETE.includes(u.nickname));
    fs.writeFileSync(usersPath, JSON.stringify(remainingUsers, null, 2), 'utf8');
    console.log(`✓ 已从 users.json 删除 ${usersToDelete.length} 个用户`);
    console.log(`  剩余用户数: ${remainingUsers.length}`);
    console.log('');
    
    // 删除照片
    const photosToDelete = photos.filter(p => uidsToDelete.includes(p.uid));
    const remainingPhotos = photos.filter(p => !uidsToDelete.includes(p.uid));
    fs.writeFileSync(photosPath, JSON.stringify(remainingPhotos, null, 2), 'utf8');
    console.log(`✓ 已从 photos.json 删除 ${photosToDelete.length} 张照片`);
    console.log(`  剩余照片数: ${remainingPhotos.length}`);
    console.log('');
    
    // 删除问卷数据（如果存在）
    if (questionnaires.length > 0) {
      const remainingQuestionnaires = questionnaires.filter(q => !uidsToDelete.includes(q.uid));
      if (remainingQuestionnaires.length !== questionnaires.length) {
        fs.writeFileSync(questionnairePath, JSON.stringify(remainingQuestionnaires, null, 2), 'utf8');
        console.log(`✓ 已从 questionnaire.json 删除 ${questionnaires.length - remainingQuestionnaires.length} 条问卷记录`);
      }
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('删除完成！');
    console.log('='.repeat(60));
    console.log('');
    console.log('已删除的用户:');
    usersToDelete.forEach(u => {
      console.log(`  - UID ${u.uid}: ${u.nickname}`);
    });
    
  } catch (error) {
    console.error('删除用户时出错:', error.message);
    process.exit(1);
  }
}

// 运行删除
if (require.main === module) {
  deleteUsers();
}

module.exports = { deleteUsers };

