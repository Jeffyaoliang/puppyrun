/**
 * 用户性别统计分析脚本
 * 功能：
 * 1. 统计总用户数、男生数、女生数
 * 2. 检查用户性别与照片性别是否相符
 */

const fs = require('fs');
const path = require('path');

// 读取数据文件
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

/**
 * 根据用户role判断性别
 */
function getUserGender(role) {
  if (role === 'male_student') {
    return 'male';
  } else if (role === 'female') {
    return 'female';
  }
  return 'unknown';
}

/**
 * 分析用户和照片数据
 */
function analyzeData() {
  const { users, photos } = loadData();
  
  console.log('='.repeat(60));
  console.log('用户性别统计分析报告');
  console.log('='.repeat(60));
  console.log('');
  
  // 1. 统计用户数量
  const totalUsers = users.length;
  let maleCount = 0;
  let femaleCount = 0;
  let unknownCount = 0;
  
  const userGenderMap = {}; // uid -> gender
  
  users.forEach(user => {
    const gender = getUserGender(user.role);
    userGenderMap[user.uid] = gender;
    
    if (gender === 'male') {
      maleCount++;
    } else if (gender === 'female') {
      femaleCount++;
    } else {
      unknownCount++;
    }
  });
  
  console.log('📊 用户统计:');
  console.log(`   总用户数: ${totalUsers}`);
  console.log(`   男生数: ${maleCount} (${((maleCount / totalUsers) * 100).toFixed(1)}%)`);
  console.log(`   女生数: ${femaleCount} (${((femaleCount / totalUsers) * 100).toFixed(1)}%)`);
  if (unknownCount > 0) {
    console.log(`   未知性别: ${unknownCount}`);
  }
  console.log('');
  
  // 2. 分析照片性别
  console.log('📸 照片统计:');
  const totalPhotos = photos.length;
  const photosByUser = {}; // uid -> [photos]
  
  photos.forEach(photo => {
    if (!photosByUser[photo.uid]) {
      photosByUser[photo.uid] = [];
    }
    photosByUser[photo.uid].push(photo);
  });
  
  console.log(`   总照片数: ${totalPhotos}`);
  console.log(`   有照片的用户数: ${Object.keys(photosByUser).length}`);
  console.log('');
  
  // 3. 检查性别匹配
  console.log('🔍 性别匹配检查:');
  console.log('');
  
  const mismatches = [];
  const noPhotoUsers = [];
  const matchDetails = [];
  
  users.forEach(user => {
    const userGender = getUserGender(user.role);
    const userPhotos = photosByUser[user.uid] || [];
    
    if (userPhotos.length === 0) {
      noPhotoUsers.push({
        uid: user.uid,
        nickname: user.nickname,
        gender: userGender
      });
      return;
    }
    
    // 检查每张照片（目前照片数据中没有性别字段，需要标注）
    // 注意：由于photos.json中没有存储性别信息，我们需要根据文件名或其他方式判断
    // 或者需要调用Face++ API来检测，但这会比较慢
    
    // 暂时标记为需要检查
    matchDetails.push({
      uid: user.uid,
      nickname: user.nickname,
      userGender: userGender,
      photoCount: userPhotos.length,
      status: 'need_check' // 需要调用API检测
    });
  });
  
  if (noPhotoUsers.length > 0) {
    console.log(`   ⚠️  无照片用户: ${noPhotoUsers.length} 人`);
    noPhotoUsers.forEach(u => {
      console.log(`      - UID ${u.uid} (${u.nickname}, ${u.gender === 'male' ? '男' : '女'})`);
    });
    console.log('');
  }
  
  console.log(`   📋 需要检查性别匹配的用户: ${matchDetails.length} 人`);
  console.log('');
  
  // 显示详细信息
  console.log('📋 用户详细信息:');
  console.log('');
  
  matchDetails.forEach(detail => {
    const genderText = detail.userGender === 'male' ? '男' : '女';
    console.log(`   UID ${detail.uid} - ${detail.nickname}`);
    console.log(`      用户性别: ${genderText}`);
    console.log(`      照片数量: ${detail.photoCount}`);
    console.log(`      状态: ${detail.status === 'need_check' ? '需要检查照片性别' : '已检查'}`);
    console.log('');
  });
  
  // 4. 总结
  console.log('='.repeat(60));
  console.log('总结:');
  console.log(`   总用户: ${totalUsers}`);
  console.log(`   男生: ${maleCount}`);
  console.log(`   女生: ${femaleCount}`);
  console.log(`   无照片用户: ${noPhotoUsers.length}`);
  console.log(`   需要检查性别匹配: ${matchDetails.length}`);
  console.log('='.repeat(60));
  console.log('');
  console.log('⚠️  注意: 由于照片数据中没有存储性别信息，');
  console.log('   需要使用Face++ API来检测照片中的性别，然后与用户性别对比。');
  console.log('   如果需要检测照片性别，请运行: node scripts/detect-photo-gender.js');
}

// 运行分析
if (require.main === module) {
  analyzeData();
}

module.exports = { analyzeData, loadData, getUserGender };

