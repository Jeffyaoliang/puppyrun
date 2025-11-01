/**
 * 批量导入女性用户照片脚本
 * 从zip文件中解压照片，匹配到数据库中的女性用户
 * 
 * 使用方法：
 * node scripts/import-female-photos.js "D:\wechatfile\xwechat_files\wxid_3otx2h6ssrlf22_6c89\msg\file\2025-11\female_stars.zip"
 */

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// 确保uploads目录存在
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * 导入女性用户照片
 * @param {string} zipFilePath - zip文件路径
 */
function importFemalePhotos(zipFilePath) {
  console.log('开始导入女性用户照片...\n');
  
  // 检查zip文件是否存在
  if (!fs.existsSync(zipFilePath)) {
    console.error(`错误: zip文件不存在: ${zipFilePath}`);
    process.exit(1);
  }
  
  // 检查数据文件是否存在
  if (!fs.existsSync(USERS_FILE)) {
    console.error('错误: 用户数据文件不存在');
    process.exit(1);
  }
  
  try {
    // 读取用户数据
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const photos = fs.existsSync(PHOTOS_FILE) 
      ? JSON.parse(fs.readFileSync(PHOTOS_FILE, 'utf8'))
      : [];
    
    // 获取所有女性用户（role === 'female'）
    const femaleUsers = users.filter(u => u.role === 'female');
    console.log(`找到 ${femaleUsers.length} 个女性用户\n`);
    
    if (femaleUsers.length === 0) {
      console.error('错误: 没有找到女性用户');
      process.exit(1);
    }
    
    // 解压zip文件
    console.log(`正在解压: ${zipFilePath}`);
    const zip = new AdmZip(zipFilePath);
    const zipEntries = zip.getEntries();
    
    // 过滤出图片文件
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const imageEntries = zipEntries.filter(entry => {
      const ext = path.extname(entry.entryName).toLowerCase();
      return imageExtensions.includes(ext) && !entry.isDirectory;
    });
    
    console.log(`找到 ${imageEntries.length} 张图片\n`);
    
    if (imageEntries.length === 0) {
      console.error('错误: zip文件中没有找到图片文件');
      process.exit(1);
    }
    
    // 创建临时解压目录
    const tempDir = path.join(__dirname, '..', 'temp_photos');
    if (fs.existsSync(tempDir)) {
      // 清理临时目录
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });
    
    // 解压所有图片
    console.log('正在解压图片...');
    zip.extractAllTo(tempDir, true);
    
    // 获取解压后的图片文件列表
    const extractedImages = [];
    function getAllImages(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          getAllImages(filePath);
        } else {
          const ext = path.extname(file).toLowerCase();
          if (imageExtensions.includes(ext)) {
            extractedImages.push(filePath);
          }
        }
      });
    }
    getAllImages(tempDir);
    
    console.log(`解压出 ${extractedImages.length} 张图片\n`);
    
    // 匹配照片到用户
    // 策略：按文件名顺序或随机分配
    const photosToAdd = [];
    const now = new Date().toISOString();
    
    // 获取当前最大photo_id
    let maxPhotoId = photos.length > 0 
      ? Math.max(...photos.map(p => p.photo_id || 0))
      : 0;
    
    extractedImages.forEach((imagePath, index) => {
      // 分配到对应的女性用户（循环分配）
      const userIndex = index % femaleUsers.length;
      const user = femaleUsers[userIndex];
      
      // 生成新的文件名（确保每个文件都有唯一的时间戳）
      const ext = path.extname(imagePath);
      const timestamp = Date.now() + index; // 为每个文件添加索引确保唯一性
      const random = Math.round(Math.random() * 1E9);
      const newFileName = `${timestamp}-${random}${ext}`;
      const targetPath = path.join(UPLOADS_DIR, newFileName);
      
      // 复制文件到uploads目录
      fs.copyFileSync(imagePath, targetPath);
      
      // 生成照片URL（使用实际域名或本地地址）
      const photoUrl = `/uploads/${newFileName}`;
      const fullUrl = `http://localhost:3000${photoUrl}`;
      
      // 创建照片记录
      const photoId = ++maxPhotoId;
      const photoRecord = {
        photo_id: photoId,
        uid: user.uid,
        url: fullUrl,
        is_primary: index < femaleUsers.length ? 1 : 0, // 前N张设为主照片
        quality_score: 5.5, // 默认评分，后续可以重新分析
        ai_style_score: 5.5,
        ai_taste_score: 5.5,
        ai_coordination_score: 5.5,
        beauty_score: 5.5,
        audit_status: 'approved',
        sort_order: index,
        created_at: now
      };
      
      photosToAdd.push(photoRecord);
      
      console.log(`✓ [${index + 1}/${extractedImages.length}] 用户 ${user.uid} (${user.nickname}): ${path.basename(imagePath)}`);
    });
    
    // 添加照片记录到photos数组
    photos.push(...photosToAdd);
    
    // 更新用户头像（使用第一张主照片）
    let avatarUpdatedCount = 0;
    femaleUsers.forEach((user, index) => {
      const userPrimaryPhoto = photosToAdd.find(p => p.uid === user.uid && p.is_primary === 1);
      if (userPrimaryPhoto) {
        const oldAvatar = user.avatar;
        user.avatar = userPrimaryPhoto.url;
        if (oldAvatar !== userPrimaryPhoto.url) {
          avatarUpdatedCount++;
          console.log(`✓ 更新用户 ${user.uid} (${user.nickname}) 的头像`);
        }
      }
    });
    
    // 保存数据
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2), 'utf8');
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    
    // 清理临时目录
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    console.log(`\n✅ 导入完成！`);
    console.log(`  成功导入 ${photosToAdd.length} 张照片`);
    console.log(`  更新了 ${avatarUpdatedCount} 个用户的头像`);
    console.log(`\n数据文件位置:`);
    console.log(`  照片数据: ${PHOTOS_FILE}`);
    console.log(`  用户数据: ${USERS_FILE}`);
    
  } catch (error) {
    console.error('导入失败:', error);
    process.exit(1);
  }
}

// 运行导入
if (require.main === module) {
  const zipFilePath = process.argv[2];
  
  if (!zipFilePath) {
    console.error('错误: 请提供zip文件路径');
    console.error('使用方法: node scripts/import-female-photos.js <zip文件路径>');
    process.exit(1);
  }
  
  importFemalePhotos(zipFilePath);
}

module.exports = { importFemalePhotos };

