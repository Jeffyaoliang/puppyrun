/**
 * 检查照片状态脚本
 * 检查是否有性别不匹配或缺少照片的用户
 */

const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const photosPath = path.join(__dirname, '../data/photos.json');

function loadData() {
  try {
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const photosData = fs.readFileSync(photosPath, 'utf8');
    return {
      users: JSON.parse(usersData),
      photos: JSON.parse(photosData)
    };
  } catch (error) {
    console.error('读取数据文件失败:', error.message);
    process.exit(1);
  }
}

function getUserGender(role) {
  if (role === 'male_student') {
    return 'male';
  } else if (role === 'female') {
    return 'female';
  }
  return 'unknown';
}

function checkPhotoStatus() {
  const { users, photos } = loadData();
  
  console.log('='.repeat(60));
  console.log('照片状态检查报告');
  console.log('='.repeat(60));
  console.log('');
  
  // 构建用户映射
  const userMap = {};
  users.forEach(user => {
    userMap[user.uid] = {
      ...user,
      gender: getUserGender(user.role)
    };
  });
  
  // 按用户分组照片
  const photosByUser = {};
  photos.forEach(photo => {
    if (!photosByUser[photo.uid]) {
      photosByUser[photo.uid] = [];
    }
    photosByUser[photo.uid].push(photo);
  });
  
  // 检查结果
  const noPhotoUsers = [];
  const mismatchUsers = [];
  const pendingReviewUsers = [];
  const allGoodUsers = [];
  
  users.forEach(user => {
    const userPhotos = photosByUser[user.uid] || [];
    const primaryPhoto = userPhotos.find(p => p.is_primary === 1);
    
    if (userPhotos.length === 0) {
      noPhotoUsers.push(user);
    } else if (primaryPhoto) {
      // 检查是否有性别不匹配标记
      if (primaryPhoto.gender_mismatch === true) {
        mismatchUsers.push({
          user: user,
          photo: primaryPhoto
        });
      } else if (primaryPhoto.audit_status === 'pending_review') {
        pendingReviewUsers.push({
          user: user,
          photo: primaryPhoto
        });
      } else if (primaryPhoto.audit_status === 'approved' && 
                 (primaryPhoto.gender_mismatch === false || !primaryPhoto.gender_mismatch)) {
        allGoodUsers.push({
          user: user,
          photo: primaryPhoto
        });
      } else {
        // 未标记状态的照片
        allGoodUsers.push({
          user: user,
          photo: primaryPhoto
        });
      }
    } else {
      // 有照片但没有主照片
      noPhotoUsers.push({
        ...user,
        hasPhotos: true,
        photoCount: userPhotos.length
      });
    }
  });
  
  // 输出报告
  console.log('📊 统计信息:');
  console.log(`   总用户数: ${users.length}`);
  console.log(`   ✅ 正常用户: ${allGoodUsers.length}`);
  console.log(`   ⚠️  待审核用户: ${pendingReviewUsers.length}`);
  console.log(`   ❌ 性别不匹配: ${mismatchUsers.length}`);
  console.log(`   📷 缺少照片: ${noPhotoUsers.length}`);
  console.log('');
  
  // 缺少照片的用户
  if (noPhotoUsers.length > 0) {
    console.log('='.repeat(60));
    console.log('❌ 缺少照片的用户:');
    console.log('='.repeat(60));
    noPhotoUsers.forEach(u => {
      const genderText = getUserGender(u.role) === 'male' ? '男' : '女';
      if (u.hasPhotos) {
        console.log(`   UID ${u.uid} - ${u.nickname} (${genderText})`);
        console.log(`      状态: 有 ${u.photoCount} 张照片，但没有主照片`);
      } else {
        console.log(`   UID ${u.uid} - ${u.nickname} (${genderText})`);
        console.log(`      状态: 完全没有照片`);
      }
      console.log('');
    });
  }
  
  // 性别不匹配的用户
  if (mismatchUsers.length > 0) {
    console.log('='.repeat(60));
    console.log('❌ 性别不匹配的用户:');
    console.log('='.repeat(60));
    mismatchUsers.forEach(item => {
      const genderText = item.user.gender === 'male' ? '男' : '女';
      const detectedGender = item.photo.detected_gender === 'male' ? '男' : '女';
      console.log(`   UID ${item.user.uid} - ${item.user.nickname} (${genderText})`);
      console.log(`      照片URL: ${item.photo.url}`);
      console.log(`      检测性别: ${detectedGender}`);
      console.log(`      用户性别: ${genderText}`);
      console.log(`      状态: 需要重新上传`);
      console.log('');
    });
  }
  
  // 待审核的用户
  if (pendingReviewUsers.length > 0) {
    console.log('='.repeat(60));
    console.log('⚠️  待审核的用户:');
    console.log('='.repeat(60));
    pendingReviewUsers.forEach(item => {
      const genderText = item.user.gender === 'male' ? '男' : '女';
      console.log(`   UID ${item.user.uid} - ${item.user.nickname} (${genderText})`);
      console.log(`      照片URL: ${item.photo.url}`);
      console.log(`      审核状态: ${item.photo.audit_status}`);
      console.log('');
    });
  }
  
  // 正常用户（简要显示）
  if (allGoodUsers.length > 0) {
    console.log('='.repeat(60));
    console.log(`✅ 正常用户 (${allGoodUsers.length}人):`);
    console.log('='.repeat(60));
    const maleGood = allGoodUsers.filter(item => item.user.gender === 'male').length;
    const femaleGood = allGoodUsers.filter(item => item.user.gender === 'female').length;
    console.log(`   男生: ${maleGood}人`);
    console.log(`   女生: ${femaleGood}人`);
    console.log('');
  }
  
  // 总结
  console.log('='.repeat(60));
  console.log('总结:');
  console.log('='.repeat(60));
  console.log(`✅ 正常: ${allGoodUsers.length}人`);
  if (pendingReviewUsers.length > 0) {
    console.log(`⚠️  待审核: ${pendingReviewUsers.length}人`);
  }
  if (mismatchUsers.length > 0) {
    console.log(`❌ 性别不匹配: ${mismatchUsers.length}人`);
  }
  if (noPhotoUsers.length > 0) {
    console.log(`📷 缺少照片: ${noPhotoUsers.length}人`);
  }
  
  // 检查照片文件格式
  console.log('');
  console.log('='.repeat(60));
  console.log('照片格式统计:');
  console.log('='.repeat(60));
  
  const formatStats = {};
  photos.forEach(photo => {
    const url = photo.url || '';
    let ext = '';
    if (url.includes('.jpg') || url.includes('.jpeg')) {
      ext = 'JPG';
    } else if (url.includes('.png')) {
      ext = 'PNG';
    } else if (url.includes('.webp')) {
      ext = 'WEBP';
    } else {
      ext = 'UNKNOWN';
    }
    
    formatStats[ext] = (formatStats[ext] || 0) + 1;
  });
  
  Object.keys(formatStats).forEach(format => {
    console.log(`   ${format}: ${formatStats[format]}张`);
  });
  
  if (formatStats['WEBP']) {
    console.log('');
    console.log('⚠️  注意: WEBP格式的照片无法使用Face++ API检测性别');
  }
  
  console.log('');
  console.log('='.repeat(60));
}

// 运行检查
if (require.main === module) {
  checkPhotoStatus();
}

module.exports = { checkPhotoStatus };

