/**
 * 替换男生照片脚本
 * 从ZIP文件中解压照片并分配给4个男生用户，替换他们原有的女性照片
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const ZIP_PATH = 'D:\\TEST\\male.zip';
const TEMP_DIR = path.join(__dirname, '../temp_male_photos');
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const USERS_FILE = path.join(__dirname, '../data/users.json');
const PHOTOS_FILE = path.join(__dirname, '../data/photos.json');

// 需要替换照片的用户ID
const TARGET_UIDS = [1, 2, 7, 8];

/**
 * 解压ZIP文件
 */
function extractZip() {
  console.log('='.repeat(60));
  console.log('开始解压ZIP文件...');
  console.log('='.repeat(60));
  
  try {
    // 检查ZIP文件是否存在
    if (!fs.existsSync(ZIP_PATH)) {
      throw new Error(`ZIP文件不存在: ${ZIP_PATH}`);
    }
    
    // 创建临时目录
    if (fs.existsSync(TEMP_DIR)) {
      console.log('清理临时目录...');
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    
    // 使用PowerShell解压ZIP文件
    console.log(`解压文件: ${ZIP_PATH}`);
    console.log(`目标目录: ${TEMP_DIR}`);
    
    // PowerShell解压命令
    const extractCommand = `powershell -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${TEMP_DIR}' -Force"`;
    execSync(extractCommand, { stdio: 'inherit' });
    
    console.log('✓ ZIP文件解压完成');
    console.log('');
    
    return true;
  } catch (error) {
    console.error('解压ZIP文件失败:', error.message);
    return false;
  }
}

/**
 * 获取照片文件列表
 */
function getPhotoFiles() {
  console.log('查找照片文件...');
  
  const photoFiles = [];
  const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (extensions.includes(ext)) {
          photoFiles.push(fullPath);
        }
      }
    }
  }
  
  scanDirectory(TEMP_DIR);
  
  // 按文件名排序
  photoFiles.sort();
  
  console.log(`找到 ${photoFiles.length} 张照片`);
  
  if (photoFiles.length < TARGET_UIDS.length) {
    console.warn(`⚠️  警告: 只有 ${photoFiles.length} 张照片，但需要替换 ${TARGET_UIDS.length} 个用户的照片`);
  }
  
  return photoFiles;
}

/**
 * 复制照片到uploads目录并生成新文件名
 */
function copyPhotoToUploads(sourcePath, uid) {
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
  
  // 更新每个用户的照片
  for (const mapping of photoMappings) {
    const { uid, photoInfo } = mapping;
    
    // 找到该用户的主照片（is_primary=1）
    const primaryPhoto = photos.find(p => p.uid === uid && p.is_primary === 1);
    
    if (primaryPhoto) {
      // 更新主照片的URL和其他信息
      primaryPhoto.url = photoInfo.url;
      primaryPhoto.audit_status = 'approved';
      primaryPhoto.gender_mismatch = false;
      primaryPhoto.requires_reupload = false;
      primaryPhoto.detected_gender = 'male';
      primaryPhoto.updated_at = new Date().toISOString();
      
      // 删除不需要的字段
      delete primaryPhoto.gender_mismatch_reason;
      
      updatedCount++;
      console.log(`  ✓ UID ${uid}: 更新主照片为 ${photoInfo.filename}`);
    } else {
      console.warn(`  ⚠️  UID ${uid}: 未找到主照片，将创建新记录`);
      
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
      console.log(`  ✓ UID ${uid}: 创建新照片记录`);
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
    }
  }
  
  // 保存更新后的数据
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  
  console.log(`✓ 已更新 ${updatedCount} 个用户头像`);
  
  return updatedCount;
}

/**
 * 清理临时文件
 */
function cleanup() {
  console.log('');
  console.log('清理临时文件...');
  
  try {
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
      console.log('✓ 临时目录已清理');
    }
  } catch (error) {
    console.warn('清理临时文件时出错:', error.message);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('='.repeat(60));
  console.log('替换男生照片脚本');
  console.log('='.repeat(60));
  console.log('');
  console.log(`目标用户: UID ${TARGET_UIDS.join(', ')}`);
  console.log(`ZIP文件: ${ZIP_PATH}`);
  console.log('');
  
  try {
    // 1. 解压ZIP文件
    if (!extractZip()) {
      process.exit(1);
    }
    
    // 2. 获取照片文件列表
    const photoFiles = getPhotoFiles();
    
    if (photoFiles.length === 0) {
      console.error('错误: 未找到任何照片文件');
      cleanup();
      process.exit(1);
    }
    
    // 3. 将照片分配给用户
    console.log('');
    console.log('分配照片给用户...');
    const photoMappings = [];
    
    for (let i = 0; i < TARGET_UIDS.length; i++) {
      const uid = TARGET_UIDS[i];
      const photoIndex = i % photoFiles.length; // 如果照片不够，循环使用
      const sourcePhoto = photoFiles[photoIndex];
      
      console.log(`  UID ${uid}: ${path.basename(sourcePhoto)}`);
      
      // 复制照片到uploads目录
      const photoInfo = copyPhotoToUploads(sourcePhoto, uid);
      
      photoMappings.push({
        uid: uid,
        photoInfo: photoInfo
      });
    }
    
    console.log('✓ 照片分配完成');
    
    // 4. 更新photos.json
    updatePhotosData(photoMappings);
    
    // 5. 更新users.json中的头像
    updateUserAvatars(photoMappings);
    
    // 6. 清理临时文件
    cleanup();
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✓ 所有操作完成！');
    console.log('='.repeat(60));
    console.log('');
    console.log('已替换的用户:');
    photoMappings.forEach(m => {
      console.log(`  - UID ${m.uid}: ${m.photoInfo.filename}`);
    });
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('错误:', error.message);
    console.error('='.repeat(60));
    cleanup();
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main };

