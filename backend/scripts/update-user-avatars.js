/**
 * 更新用户头像脚本
 * 将每个用户的avatar字段更新为第一张上传的生活照
 * 
 * 使用方法：
 * node scripts/update-user-avatars.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');

function updateUserAvatars() {
  console.log('开始更新用户头像...\n');
  
  if (!fs.existsSync(USERS_FILE)) {
    console.log('用户数据文件不存在，跳过更新');
    return;
  }
  
  if (!fs.existsSync(PHOTOS_FILE)) {
    console.log('照片数据文件不存在，跳过更新');
    return;
  }
  
  try {
    // 读取数据
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const photos = JSON.parse(fs.readFileSync(PHOTOS_FILE, 'utf8'));
    
    console.log(`读取到 ${users.length} 个用户`);
    console.log(`读取到 ${photos.length} 张照片\n`);
    
    // 按uid分组照片，获取每个用户的第一张照片
    const userPhotosMap = {};
    photos.forEach(photo => {
      if (!userPhotosMap[photo.uid]) {
        userPhotosMap[photo.uid] = [];
      }
      userPhotosMap[photo.uid].push(photo);
    });
    
    // 更新每个用户的avatar字段
    let updatedCount = 0;
    users.forEach(user => {
      const userPhotos = userPhotosMap[user.uid] || [];
      
      // 优先使用is_primary=1的照片，否则使用第一张照片
      const primaryPhoto = userPhotos.find(p => p.is_primary === 1) || userPhotos[0];
      
      if (primaryPhoto && primaryPhoto.url) {
        const oldAvatar = user.avatar;
        user.avatar = primaryPhoto.url;
        if (oldAvatar !== primaryPhoto.url) {
          console.log(`✓ 用户 ${user.uid} (${user.nickname}): 更新头像`);
          console.log(`  旧: ${oldAvatar.substring(0, 50)}...`);
          console.log(`  新: ${primaryPhoto.url}`);
          updatedCount++;
        }
      } else {
        console.log(`⚠ 用户 ${user.uid} (${user.nickname}): 没有照片，保持原头像`);
      }
    });
    
    // 保存更新后的数据
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    
    console.log(`\n✅ 头像更新完成！`);
    console.log(`  更新了 ${updatedCount} 个用户的头像`);
    console.log(`\n数据文件位置: ${USERS_FILE}`);
    
  } catch (error) {
    console.error('更新失败:', error);
    process.exit(1);
  }
}

// 运行更新
if (require.main === module) {
  updateUserAvatars();
}

module.exports = { updateUserAvatars };

