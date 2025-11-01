/**
 * 从照片创建用户（随机分配性别）
 * 当无法检测性别时，随机分配但保持性别平衡
 */

const fs = require('fs');
const path = require('path');

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
 * 创建用户
 */
function createUser(photoUrl, gender, index) {
  const maxUid = Math.max(...JSON.parse(fs.readFileSync(usersPath, 'utf8')).map(u => u.uid || 0));
  const newUid = maxUid + 1 + index;
  
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
function main() {
  console.log('='.repeat(60));
  console.log('从照片创建用户（随机分配性别）');
  console.log('='.repeat(60));
  console.log('');
  
  // 获取无人认领的照片
  const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const photoUrls = new Set(photos.map(p => p.url));
  
  // 获取uploads目录中的所有图片
  const imageFiles = [];
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
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
  
  // 按文件名排序
  imageFiles.sort((a, b) => a.filename.localeCompare(b.filename));
  
  // 选择前20张
  const selectedPhotos = imageFiles.slice(0, 20);
  
  console.log(`找到 ${imageFiles.length} 张无人认领的照片`);
  console.log(`将处理前 ${selectedPhotos.length} 张照片`);
  console.log('');
  
  // 随机分配性别（10男10女）
  const genders = ['male', 'male', 'male', 'male', 'male', 'male', 'male', 'male', 'male', 'male',
                   'female', 'female', 'female', 'female', 'female', 'female', 'female', 'female', 'female', 'female'];
  
  // 打乱顺序
  for (let i = genders.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [genders[i], genders[j]] = [genders[j], genders[i]];
  }
  
  const newUsers = [];
  const newPhotos = [];
  
  // 为每张照片创建用户
  for (let i = 0; i < selectedPhotos.length; i++) {
    const photo = selectedPhotos[i];
    const gender = genders[i];
    const genderText = gender === 'male' ? '男' : '女';
    
    console.log(`[${i + 1}/${selectedPhotos.length}] ${photo.filename} → ${genderText}`);
    
    // 创建用户
    const user = createUser(photo.url, gender, i);
    newUsers.push(user);
    
    // 创建照片记录
    const photoRecord = createPhotoRecord(user.uid, photo.url);
    newPhotos.push(photoRecord);
  }
  
  // 保存数据
  console.log('');
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
  
  const maleCount = newUsers.filter(u => u.role === 'male_student').length;
  const femaleCount = newUsers.filter(u => u.role === 'female').length;
  
  console.log(`成功创建 ${newUsers.length} 个用户:`);
  console.log(`  男生: ${maleCount}人`);
  console.log(`  女生: ${femaleCount}人`);
  console.log('');
  console.log('用户列表:');
  newUsers.forEach(user => {
    const genderText = user.role === 'male_student' ? '男' : '女';
    console.log(`  UID ${user.uid} - ${user.nickname} (${genderText}), ${user.city}`);
  });
  console.log('');
  console.log('⚠️  注意: 性别是随机分配的，如需调整请手动修改 users.json');
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main };

