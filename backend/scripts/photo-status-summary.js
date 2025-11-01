/**
 * 照片状态总结报告
 */

const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const photosPath = path.join(__dirname, '../data/photos.json');

function loadData() {
  const usersData = fs.readFileSync(usersPath, 'utf8');
  const photosData = fs.readFileSync(photosPath, 'utf8');
  return {
    users: JSON.parse(usersData),
    photos: JSON.parse(photosData)
  };
}

function getUserGender(role) {
  if (role === 'male_student') return 'male';
  if (role === 'female') return 'female';
  return 'unknown';
}

function main() {
  const { users, photos } = loadData();
  
  console.log('='.repeat(60));
  console.log('照片状态总结报告');
  console.log('='.repeat(60));
  console.log('');
  
  // 按用户分组照片
  const photosByUser = {};
  photos.forEach(photo => {
    if (!photosByUser[photo.uid]) {
      photosByUser[photo.uid] = [];
    }
    photosByUser[photo.uid].push(photo);
  });
  
  // 分类统计
  const noPhotoUsers = [];
  const hasMismatchMark = [];
  const normalUsers = [];
  
  users.forEach(user => {
    const userPhotos = photosByUser[user.uid] || [];
    const primaryPhoto = userPhotos.find(p => p.is_primary === 1);
    
    if (userPhotos.length === 0) {
      noPhotoUsers.push(user);
    } else if (primaryPhoto) {
      if (primaryPhoto.gender_mismatch === true) {
        hasMismatchMark.push({ user, photo: primaryPhoto });
      } else {
        normalUsers.push({ user, photo: primaryPhoto });
      }
    } else {
      noPhotoUsers.push({ ...user, hasPhotos: true, photoCount: userPhotos.length });
    }
  });
  
  // 统计照片格式
  const formatCount = { JPG: 0, PNG: 0, WEBP: 0, OTHER: 0 };
  photos.forEach(photo => {
    const url = photo.url || '';
    if (url.includes('.jpg') || url.includes('.jpeg')) formatCount.JPG++;
    else if (url.includes('.png')) formatCount.PNG++;
    else if (url.includes('.webp')) formatCount.WEBP++;
    else formatCount.OTHER++;
  });
  
  // 输出报告
  console.log('📊 总体统计:');
  console.log(`   总用户数: ${users.length}`);
  console.log(`   总照片数: ${photos.length}`);
  console.log(`   有照片的用户: ${users.length - noPhotoUsers.length}`);
  console.log('');
  
  console.log('👥 用户状态:');
  console.log(`   ✅ 正常用户: ${normalUsers.length}`);
  console.log(`   ❌ 性别不匹配: ${hasMismatchMark.length}`);
  console.log(`   📷 缺少照片: ${noPhotoUsers.length}`);
  console.log('');
  
  console.log('📸 照片格式:');
  Object.keys(formatCount).forEach(format => {
    if (formatCount[format] > 0) {
      console.log(`   ${format}: ${formatCount[format]}张`);
    }
  });
  console.log('');
  
  // 缺少照片的用户详情
  if (noPhotoUsers.length > 0) {
    console.log('='.repeat(60));
    console.log('❌ 缺少照片的用户:');
    console.log('='.repeat(60));
    noPhotoUsers.forEach(u => {
      const genderText = getUserGender(u.role) === 'male' ? '男' : '女';
      console.log(`   UID ${u.uid} - ${u.nickname} (${genderText})`);
      if (u.hasPhotos) {
        console.log(`      状态: 有 ${u.photoCount} 张照片，但没有主照片`);
      }
    });
    console.log('');
  }
  
  // 性别不匹配的用户详情
  if (hasMismatchMark.length > 0) {
    console.log('='.repeat(60));
    console.log('❌ 性别不匹配的用户:');
    console.log('='.repeat(60));
    hasMismatchMark.forEach(item => {
      const genderText = item.user.gender === 'male' ? '男' : '女';
      console.log(`   UID ${item.user.uid} - ${item.user.nickname} (${genderText})`);
      console.log(`      照片: ${item.photo.url}`);
    });
    console.log('');
  }
  
  // 按性别统计正常用户
  const maleNormal = normalUsers.filter(item => getUserGender(item.user.role) === 'male').length;
  const femaleNormal = normalUsers.filter(item => getUserGender(item.user.role) === 'female').length;
  
  console.log('='.repeat(60));
  console.log('✅ 正常用户详情:');
  console.log('='.repeat(60));
  console.log(`   男生: ${maleNormal}人`);
  console.log(`   女生: ${femaleNormal}人`);
  console.log('');
  
  // 检查是否有WEBP格式需要检测
  const webpPhotos = photos.filter(p => p.url && p.url.includes('.webp'));
  if (webpPhotos.length > 0) {
    console.log('='.repeat(60));
    console.log('⚠️  需要注意:');
    console.log('='.repeat(60));
    console.log(`   有 ${webpPhotos.length} 张WEBP格式的照片无法使用Face++ API检测性别`);
    console.log(`   建议转换为JPG/PNG格式后重新检测`);
    console.log('');
  }
  
  // 最终总结
  console.log('='.repeat(60));
  console.log('📋 总结:');
  console.log('='.repeat(60));
  
  if (hasMismatchMark.length === 0 && noPhotoUsers.length === 0) {
    console.log('✅ 所有用户照片状态正常！');
  } else {
    if (hasMismatchMark.length > 0) {
      console.log(`❌ 需要处理: ${hasMismatchMark.length} 个用户性别不匹配`);
    }
    if (noPhotoUsers.length > 0) {
      console.log(`📷 需要处理: ${noPhotoUsers.length} 个用户缺少照片`);
    }
  }
  
  console.log('');
}

if (require.main === module) {
  main();
}

module.exports = { main };

