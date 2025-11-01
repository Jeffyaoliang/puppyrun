/**
 * 查找无人认领的照片
 */

const fs = require('fs');
const path = require('path');

const photosPath = path.join(__dirname, '../data/photos.json');
const usersPath = path.join(__dirname, '../data/users.json');
const uploadsDir = path.join(__dirname, '../uploads');

function main() {
  const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  
  // 获取所有用户ID
  const userIds = new Set(users.map(u => u.uid));
  
  // 获取所有照片中的URL
  const photoUrls = new Set(photos.map(p => p.url));
  
  // 找出uploads目录中的所有图片文件
  const imageFiles = [];
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        const url = `http://localhost:3000/uploads/${file}`;
        imageFiles.push({
          filename: file,
          url: url,
          path: path.join(uploadsDir, file)
        });
      }
    });
  }
  
  // 找出无人认领的照片（在uploads中但不在photos.json中）
  const orphanPhotos = imageFiles.filter(img => !photoUrls.has(img.url));
  
  console.log('='.repeat(60));
  console.log('查找无人认领的照片');
  console.log('='.repeat(60));
  console.log('');
  console.log(`总照片数: ${photos.length}`);
  console.log(`uploads目录中的图片: ${imageFiles.length}`);
  console.log(`无人认领的照片: ${orphanPhotos.length}`);
  console.log('');
  
  if (orphanPhotos.length > 0) {
    console.log('无人认领的照片列表:');
    orphanPhotos.forEach((photo, index) => {
      console.log(`${index + 1}. ${photo.filename}`);
      console.log(`   URL: ${photo.url}`);
    });
  } else {
    console.log('没有找到无人认领的照片');
  }
  
  // 检查photos.json中是否有uid不在users.json中的照片
  const photosWithInvalidUid = photos.filter(p => {
    if (!p.uid) return false;
    return !userIds.has(p.uid);
  });
  
  if (photosWithInvalidUid.length > 0) {
    console.log('');
    console.log('photos.json中有无效UID的照片:');
    photosWithInvalidUid.forEach(photo => {
      console.log(`  UID ${photo.uid}: ${photo.url}`);
    });
  }
  
  return orphanPhotos;
}

if (require.main === module) {
  main();
}

module.exports = { main };

