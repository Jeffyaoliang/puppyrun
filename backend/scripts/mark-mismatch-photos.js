/**
 * 标记性别不匹配的照片
 * 在photos.json中为不匹配的照片添加标记
 */

const fs = require('fs');
const path = require('path');

const photosPath = path.join(__dirname, '../data/photos.json');

// 需要标记的照片ID列表（根据检测报告）
const mismatchPhotoIds = [1, 2, 7, 8];

function markMismatchPhotos() {
  try {
    // 读取照片数据
    const photosData = fs.readFileSync(photosPath, 'utf8');
    const photos = JSON.parse(photosData);
    
    let updatedCount = 0;
    
    // 标记不匹配的照片
    photos.forEach(photo => {
      // 检查是否是主照片（is_primary=1）且UID在需要标记的列表中
      if (photo.is_primary === 1 && mismatchPhotoIds.includes(photo.uid)) {
        // 添加标记
        photo.gender_mismatch = true;
        photo.gender_mismatch_reason = '照片性别检测为女性，但用户性别为男性';
        photo.requires_reupload = true;
        photo.detected_gender = 'female';
        photo.audit_status = 'pending_review'; // 需要人工审核
        
        updatedCount++;
        
        console.log(`标记照片: UID ${photo.uid}, Photo ID: ${photo.photo_id || 'N/A'}`);
      }
    });
    
    // 保存更新后的数据
    fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2), 'utf8');
    
    console.log('');
    console.log('='.repeat(60));
    console.log('照片标记完成');
    console.log('='.repeat(60));
    console.log(`已标记 ${updatedCount} 张照片`);
    console.log(`文件已保存: ${photosPath}`);
    console.log('');
    console.log('标记字段说明:');
    console.log('  - gender_mismatch: true (性别不匹配)');
    console.log('  - requires_reupload: true (需要重新上传)');
    console.log('  - audit_status: pending_review (待人工审核)');
    console.log('  - detected_gender: female (检测到的性别)');
    
  } catch (error) {
    console.error('标记照片时出错:', error.message);
    process.exit(1);
  }
}

// 运行标记
if (require.main === module) {
  markMismatchPhotos();
}

module.exports = { markMismatchPhotos };

