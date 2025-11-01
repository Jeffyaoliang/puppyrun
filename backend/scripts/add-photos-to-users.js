/**
 * 为指定用户添加照片脚本
 * 将照片文件上传并分配给用户
 */

const fs = require('fs');
const path = require('path');

// 配置
const PHOTO_MAPPINGS = [
  {
    uid: 9,
    photoPath: 'D:\\TEST\\微信图片_20251101160513_107_16984.png'
  },
  {
    uid: 10,
    photoPath: 'D:\\TEST\\微信图片_20251101160514_108_16984.png'
  }
];

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const USERS_FILE = path.join(__dirname, '../data/users.json');
const PHOTOS_FILE = path.join(__dirname, '../data/photos.json');

/**
 * 复制照片到uploads目录并生成新文件名
 */
function copyPhotoToUploads(sourcePath, uid) {
  // 检查源文件是否存在
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`照片文件不存在: ${sourcePath}`);
  }
  
  const ext = path.extname(sourcePath).toLowerCase();
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const filename = `${timestamp}-${random}${ext}`;
  const destPath = path.join(UPLOADS_DIR, filename);
  
  // 复制文件
  fs.copyFileSync(sourcePath, destPath);
  
  const url = `http://localhost:3000/uploads/${filename}`;
  
  return {
    filename,
    path: destPath,
    url: url
  };
}

/**
 * 更新照片数据
 */
function updatePhotosData(photoMappings) {
  console.log('');
  console.log('更新照片数据...');
  
  // 读取数据
  const photosData = fs.readFileSync(PHOTOS_FILE, 'utf8');
  const photos = JSON.parse(photosData);
  
  let updatedCount = 0;
  
  // 为每个用户添加照片
  for (const mapping of photoMappings) {
    const { uid, photoInfo } = mapping;
    
    // 检查是否已有照片
    const existingPhotos = photos.filter(p => p.uid === uid);
    const hasPrimary = existingPhotos.some(p => p.is_primary === 1);
    
    if (hasPrimary) {
      // 如果已有主照片，更新它
      const primaryPhoto = existingPhotos.find(p => p.is_primary === 1);
      primaryPhoto.url = photoInfo.url;
      primaryPhoto.audit_status = 'approved';
      primaryPhoto.updated_at = new Date().toISOString();
      
      // 清理旧的不匹配标记
      if (primaryPhoto.gender_mismatch !== undefined) {
        primaryPhoto.gender_mismatch = false;
      }
      if (primaryPhoto.requires_reupload !== undefined) {
        primaryPhoto.requires_reupload = false;
      }
      
      updatedCount++;
      console.log(`  ✓ UID ${uid}: 更新主照片为 ${photoInfo.filename}`);
    } else {
      // 创建新的照片记录
      const newPhoto = {
        uid: uid,
        url: photoInfo.url,
        is_primary: 1,
        quality_score: 0,
        ai_style_score: 0,
        ai_taste_score: 0,
        ai_coordination_score: 0,
        beauty_score: 0,
        audit_status: 'approved',
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      photos.push(newPhoto);
      updatedCount++;
      console.log(`  ✓ UID ${uid}: 创建新照片记录 ${photoInfo.filename}`);
    }
  }
  
  // 保存更新后的数据
  fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2), 'utf8');
  
  console.log(`✓ 已更新 ${updatedCount} 条照片记录`);
  
  return updatedCount;
}

/**
 * 更新用户头像
 */
function updateUserAvatars(photoMappings) {
  console.log('');
  console.log('更新用户头像...');
  
  // 读取数据
  const usersData = fs.readFileSync(USERS_FILE, 'utf8');
  const users = JSON.parse(usersData);
  
  let updatedCount = 0;
  
  for (const mapping of photoMappings) {
    const { uid, photoInfo } = mapping;
    
    const user = users.find(u => u.uid === uid);
    if (user) {
      user.avatar = photoInfo.url;
      user.updated_at = new Date().toISOString();
      updatedCount++;
      console.log(`  ✓ UID ${uid}: 更新头像`);
    } else {
      console.warn(`  ⚠️  UID ${uid}: 用户不存在`);
    }
  }
  
  // 保存更新后的数据
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  
  console.log(`✓ 已更新 ${updatedCount} 个用户头像`);
  
  return updatedCount;
}

/**
 * 主函数
 */
function main() {
  console.log('='.repeat(60));
  console.log('为用户添加照片脚本');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    const photoMappings = [];
    
    // 1. 检查并复制照片
    console.log('处理照片文件...');
    for (const mapping of PHOTO_MAPPINGS) {
      const { uid, photoPath } = mapping;
      
      console.log(`  UID ${uid}: ${path.basename(photoPath)}`);
      
      // 复制照片到uploads目录
      const photoInfo = copyPhotoToUploads(photoPath, uid);
      
      photoMappings.push({
        uid: uid,
        photoInfo: photoInfo
      });
      
      console.log(`    → ${photoInfo.filename}`);
    }
    
    console.log('✓ 照片处理完成');
    
    // 2. 更新photos.json
    updatePhotosData(photoMappings);
    
    // 3. 更新users.json中的头像
    updateUserAvatars(photoMappings);
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✓ 所有操作完成！');
    console.log('='.repeat(60));
    console.log('');
    console.log('已添加照片的用户:');
    photoMappings.forEach(m => {
      console.log(`  - UID ${m.uid}: ${m.photoInfo.filename}`);
      console.log(`    照片URL: ${m.photoInfo.url}`);
    });
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('错误:', error.message);
    console.error('='.repeat(60));
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main };

