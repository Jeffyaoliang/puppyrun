/**
 * 从无人认领的照片创建用户
 * 检测照片性别，然后创建对应的用户信息
 */

const fs = require('fs');
const path = require('path');
const { analyzePhotoWithFacePP } = require('../utils/facepp');

const photosPath = path.join(__dirname, '../data/photos.json');
const usersPath = path.join(__dirname, '../data/users.json');
const uploadsDir = path.join(__dirname, '../uploads');

// 中文姓名库
const MALE_NAMES = ['伟', '强', '磊', '军', '洋', '勇', '鹏', '超', '建', '明', '华', '亮', '刚', '平', '辉', '涛', '浩', '宇', '峰', '杰'];
const FEMALE_NAMES = ['芳', '娜', '敏', '静', '丽', '艳', '红', '玲', '雪', '梅', '霞', '燕', '莹', '玉', '琳', '欣', '悦', '雅', '慧', '美'];
const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '西安', '南京', '武汉', '重庆', '天津', '苏州', '长沙', '郑州', '济南', '青岛', '大连', '厦门', '福州', '合肥'];

/**
 * 生成随机手机号
 */
function generatePhone() {
  const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', 
                    '150', '151', '152', '153', '155', '156', '157', '158', '159', '180'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(10000000 + Math.random() * 90000000);
  return prefix + suffix.toString();
}

/**
 * 生成随机昵称
 */
function generateNickname(gender) {
  if (gender === 'male') {
    const name = MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)];
    return name + ['同学', '同学', '同学', '先生', '先生'][Math.floor(Math.random() * 5)];
  } else {
    const name = FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)];
    return name + ['', '儿', '儿', '小姐', '小姐'][Math.floor(Math.random() * 5)];
  }
}

/**
 * 获取照片文件路径
 */
function getImagePath(photoUrl) {
  if (!photoUrl) return null;
  
  if (photoUrl.includes('localhost:3000/uploads/')) {
    const filename = photoUrl.split('/uploads/')[1];
    return path.join(uploadsDir, filename);
  }
  
  return null;
}

/**
 * 检测照片性别
 */
async function detectPhotoGender(photoUrl) {
  try {
    const imagePath = getImagePath(photoUrl);
    
    if (!imagePath || !fs.existsSync(imagePath)) {
      return {
        success: false,
        error: '无法获取图片路径'
      };
    }
    
    // 跳过WEBP格式（Face++不支持）
    if (imagePath.toLowerCase().endsWith('.webp')) {
      // 对于WEBP，根据文件名或其他方式推断，这里默认设为female（因为之前女生照片都是webp）
      return {
        success: true,
        detectedGender: 'female',
        note: 'WEBP格式，无法检测，默认为female'
      };
    }
    
    const result = await analyzePhotoWithFacePP(imagePath, photoUrl);
    
    if (!result.success || !result.faceDetected) {
      return {
        success: false,
        error: result.error || '未检测到人脸'
      };
    }
    
    const gender = result.gender ? result.gender.toLowerCase() : null;
    const detectedGender = gender === 'male' ? 'male' : (gender === 'female' ? 'female' : null);
    
    return {
      success: true,
      detectedGender: detectedGender,
      age: result.age,
      beautyScore: result.beauty_score
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 创建用户
 */
function createUser(photoUrl, detectedGender, index) {
  const maxUid = Math.max(...JSON.parse(fs.readFileSync(usersPath, 'utf8')).map(u => u.uid || 0));
  const newUid = maxUid + 1 + index;
  
  const gender = detectedGender || 'male'; // 默认男性
  const role = gender === 'male' ? 'male_student' : 'female';
  const ageBucket = gender === 'male' ? '18-25' : '28-38';
  
  const user = {
    uid: newUid,
    openid: `test_openid_${String(newUid).padStart(3, '0')}_${Date.now()}`,
    phone: generatePhone(),
    nickname: generateNickname(gender),
    avatar: photoUrl,
    role: role,
    auth_status: 'verified',
    age_bucket: ageBucket,
    city: CITIES[Math.floor(Math.random() * CITIES.length)],
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return user;
}

/**
 * 创建照片记录
 */
function createPhotoRecord(uid, photoUrl) {
  return {
    uid: uid,
    url: photoUrl,
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
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(60));
  console.log('从照片创建用户脚本');
  console.log('='.repeat(60));
  console.log('');
  
  // 获取无人认领的照片（前20张）
  const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const photoUrls = new Set(photos.map(p => p.url));
  
  // 获取uploads目录中的所有图片
  const imageFiles = [];
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        const url = `http://localhost:3000/uploads/${file}`;
        if (!photoUrls.has(url)) {
          imageFiles.push({
            filename: file,
            url: url,
            path: path.join(uploadsDir, file)
          });
        }
      }
    });
  }
  
  // 按文件名排序，确保每次处理相同的顺序
  imageFiles.sort((a, b) => a.filename.localeCompare(b.filename));
  
  // 选择前20张，优先选择JPG和PNG格式（跳过WEBP）
  const jpgPngPhotos = imageFiles.filter(p => {
    const ext = path.extname(p.filename).toLowerCase();
    return ['.jpg', '.jpeg', '.png'].includes(ext);
  });
  
  const selectedPhotos = jpgPngPhotos.slice(0, 20);
  
  console.log(`找到 ${imageFiles.length} 张无人认领的照片`);
  console.log(`将处理前 ${selectedPhotos.length} 张照片`);
  console.log('');
  
  const newUsers = [];
  const newPhotos = [];
  const errors = [];
  
  // 处理每张照片
  for (let i = 0; i < selectedPhotos.length; i++) {
    const photo = selectedPhotos[i];
    console.log(`[${i + 1}/${selectedPhotos.length}] 处理照片: ${photo.filename}`);
    
    // 检测性别
    process.stdout.write('  检测性别... ');
    const detection = await detectPhotoGender(photo.url);
    
    if (!detection.success) {
      // 如果是403错误，记录但继续尝试
      if (detection.error && detection.error.includes('403')) {
        console.log(`⚠️  API限制，稍后重试: ${detection.error}`);
        errors.push({
          photo: photo,
          error: detection.error,
          retry: true
        });
      } else {
        console.log(`❌ 失败: ${detection.error}`);
        errors.push({
          photo: photo,
          error: detection.error
        });
      }
      continue;
    }
    
    const detectedGender = detection.detectedGender || 'male'; // 默认男性
    const genderText = detectedGender === 'male' ? '男' : '女';
    console.log(`✅ ${genderText}`);
    
    // 创建用户
    const user = createUser(photo.url, detectedGender, i);
    newUsers.push(user);
    
    // 创建照片记录
    const photoRecord = createPhotoRecord(user.uid, photo.url);
    newPhotos.push(photoRecord);
    
    console.log(`  创建用户: UID ${user.uid}, ${user.nickname} (${genderText})`);
    console.log('');
    
    // 避免API调用过快（增加延迟以避免并发限制）
    // 如果遇到403错误，等待更长时间
    if (!detection.success && detection.error && detection.error.includes('403')) {
      console.log('  遇到API限制，等待5秒...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  // 保存数据
  if (newUsers.length > 0) {
    console.log('保存数据...');
    
    // 添加新用户
    const allUsers = [...users, ...newUsers];
    fs.writeFileSync(usersPath, JSON.stringify(allUsers, null, 2), 'utf8');
    console.log(`✓ 已添加 ${newUsers.length} 个用户到 users.json`);
    
    // 添加新照片
    const allPhotos = [...photos, ...newPhotos];
    fs.writeFileSync(photosPath, JSON.stringify(allPhotos, null, 2), 'utf8');
    console.log(`✓ 已添加 ${newPhotos.length} 张照片到 photos.json`);
    
    console.log('');
    console.log('='.repeat(60));
    console.log('创建完成！');
    console.log('='.repeat(60));
    console.log('');
    console.log('新创建的用户:');
    newUsers.forEach(user => {
      const genderText = user.role === 'male_student' ? '男' : '女';
      console.log(`  UID ${user.uid} - ${user.nickname} (${genderText}), ${user.city}`);
    });
    
    if (errors.length > 0) {
      console.log('');
      console.log('处理失败的照片:');
      errors.forEach(err => {
        console.log(`  ${err.photo.filename}: ${err.error}`);
      });
    }
  } else {
    console.log('没有成功创建任何用户');
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('执行出错:', error);
    process.exit(1);
  });
}

module.exports = { main };

