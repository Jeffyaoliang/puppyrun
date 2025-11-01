/**
 * 照片性别检测脚本
 * 功能：调用Face++ API检测照片中的性别，并与用户性别对比
 */

const fs = require('fs');
const path = require('path');
const { analyzePhotoWithFacePP } = require('../utils/facepp');

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
 * 将Face++返回的性别转换为标准格式
 */
function normalizeGender(faceppGender) {
  if (!faceppGender) return 'unknown';
  const gender = faceppGender.toLowerCase();
  if (gender === 'male' || gender === 'm') {
    return 'male';
  } else if (gender === 'female' || gender === 'f') {
    return 'female';
  }
  return 'unknown';
}

/**
 * 从URL或本地路径获取图片路径
 */
function getImagePath(photoUrl) {
  if (!photoUrl) return null;
  
  // 如果是localhost URL，提取本地路径
  if (photoUrl.includes('localhost:3000/uploads/')) {
    const filename = photoUrl.split('/uploads/')[1];
    return path.join(__dirname, '../uploads', filename);
  }
  
  // 如果是绝对路径或相对路径
  if (photoUrl.startsWith('http://localhost:3000') || photoUrl.startsWith('https://')) {
    // 远程URL，需要下载或使用URL
    return photoUrl;
  }
  
  // 本地路径
  if (fs.existsSync(photoUrl)) {
    return photoUrl;
  }
  
  return null;
}

/**
 * 检测单张照片的性别
 */
async function detectPhotoGender(photo) {
  try {
    const imagePath = getImagePath(photo.url);
    
    if (!imagePath) {
      return {
        success: false,
        error: '无法获取图片路径',
        photoId: photo.photo_id || photo.uid,
        url: photo.url
      };
    }
    
    // 调用Face++ API
    const result = await analyzePhotoWithFacePP(imagePath, photo.url);
    
    if (!result.success || !result.faceDetected) {
      return {
        success: false,
        error: result.error || '未检测到人脸',
        photoId: photo.photo_id || photo.uid,
        url: photo.url
      };
    }
    
    return {
      success: true,
      photoId: photo.photo_id || photo.uid,
      uid: photo.uid,
      url: photo.url,
      detectedGender: normalizeGender(result.gender),
      age: result.age,
      beautyScore: result.beauty_score
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      photoId: photo.photo_id || photo.uid,
      url: photo.url
    };
  }
}

/**
 * 分析所有用户的照片性别匹配情况
 */
async function analyzeGenderMatch() {
  const { users, photos } = loadData();
  
  console.log('='.repeat(60));
  console.log('照片性别检测与匹配分析');
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
  
  console.log(`📊 开始检测 ${photos.length} 张照片的性别...`);
  console.log('');
  
  const results = [];
  const mismatches = [];
  let processed = 0;
  
  // 检测每张照片
  for (const uid in photosByUser) {
    const userPhotos = photosByUser[uid];
    const user = userMap[uid];
    
    if (!user) {
      console.log(`⚠️  用户 ${uid} 不存在`);
      continue;
    }
    
    console.log(`检测用户 ${uid} (${user.nickname}, ${user.gender === 'male' ? '男' : '女'}) 的 ${userPhotos.length} 张照片...`);
    
    const userResults = [];
    
    for (const photo of userPhotos) {
      processed++;
      process.stdout.write(`   [${processed}/${photos.length}] 检测照片 ${photo.photo_id || photo.url}... `);
      
      const detection = await detectPhotoGender(photo);
      
      if (detection.success) {
        const isMatch = detection.detectedGender === user.gender;
        userResults.push({
          ...detection,
          userGender: user.gender,
          isMatch: isMatch
        });
        
        if (!isMatch) {
          mismatches.push({
            uid: uid,
            nickname: user.nickname,
            userGender: user.gender,
            photoId: detection.photoId,
            detectedGender: detection.detectedGender,
            url: detection.url
          });
        }
        
        const matchIcon = isMatch ? '✅' : '❌';
        const genderText = detection.detectedGender === 'male' ? '男' : '女';
        console.log(`${matchIcon} ${genderText}`);
      } else {
        userResults.push(detection);
        console.log(`❌ 失败: ${detection.error}`);
      }
      
      // 避免API调用过快，稍微延迟
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    results.push({
      uid: uid,
      user: user,
      photos: userResults
    });
    
    console.log('');
  }
  
  // 输出统计结果
  console.log('='.repeat(60));
  console.log('检测结果统计');
  console.log('='.repeat(60));
  console.log('');
  
  const totalDetected = results.reduce((sum, r) => {
    return sum + r.photos.filter(p => p.success).length;
  }, 0);
  
  const totalMatched = results.reduce((sum, r) => {
    return sum + r.photos.filter(p => p.success && p.isMatch).length;
  }, 0);
  
  const matchRate = totalDetected > 0 ? ((totalMatched / totalDetected) * 100).toFixed(1) : 0;
  
  console.log(`📊 总体统计:`);
  console.log(`   总照片数: ${photos.length}`);
  console.log(`   成功检测: ${totalDetected}`);
  console.log(`   性别匹配: ${totalMatched} (${matchRate}%)`);
  console.log(`   性别不匹配: ${mismatches.length}`);
  console.log('');
  
  // 显示不匹配的详情
  if (mismatches.length > 0) {
    console.log('❌ 性别不匹配的照片:');
    console.log('');
    
    mismatches.forEach(m => {
      const userGenderText = m.userGender === 'male' ? '男' : '女';
      const detectedGenderText = m.detectedGender === 'male' ? '男' : '女';
      console.log(`   UID ${m.uid} - ${m.nickname}`);
      console.log(`      用户性别: ${userGenderText}`);
      console.log(`      照片性别: ${detectedGenderText}`);
      console.log(`      照片ID: ${m.photoId}`);
      console.log(`      照片URL: ${m.url}`);
      console.log('');
    });
  } else {
    console.log('✅ 所有检测成功的照片性别都与用户性别匹配！');
    console.log('');
  }
  
  // 按用户汇总
  console.log('='.repeat(60));
  console.log('按用户汇总');
  console.log('='.repeat(60));
  console.log('');
  
  results.forEach(result => {
    const matchedCount = result.photos.filter(p => p.success && p.isMatch).length;
    const totalCount = result.photos.filter(p => p.success).length;
    const userGenderText = result.user.gender === 'male' ? '男' : '女';
    
    console.log(`UID ${result.uid} - ${result.user.nickname} (${userGenderText})`);
    console.log(`   成功检测: ${totalCount}/${result.photos.length}`);
    console.log(`   匹配数: ${matchedCount}/${totalCount}`);
    
    if (matchedCount < totalCount) {
      const unmatched = result.photos.filter(p => p.success && !p.isMatch);
      unmatched.forEach(p => {
        const detectedText = p.detectedGender === 'male' ? '男' : '女';
        console.log(`   ⚠️  照片 ${p.photoId}: 检测为 ${detectedText}`);
      });
    }
    console.log('');
  });
  
  console.log('='.repeat(60));
}

// 运行检测
if (require.main === module) {
  analyzeGenderMatch().catch(error => {
    console.error('检测过程出错:', error);
    process.exit(1);
  });
}

module.exports = { analyzeGenderMatch, detectPhotoGender };

