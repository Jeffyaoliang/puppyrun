/**
 * 初始用户数据导入脚本
 * 用于批量创建测试用户数据
 * 
 * 使用方法：
 * node scripts/init-users.js
 */

const fs = require('fs');
const path = require('path');

// 模拟数据存储（实际应该存储到数据库）
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const QUESTIONNAIRE_FILE = path.join(DATA_DIR, 'questionnaire.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 生成随机OpenID（模拟微信OpenID）
function generateOpenId(index) {
  return `test_openid_${String(index).padStart(3, '0')}_${Date.now()}`;
}

// 生成随机手机号
function generatePhone(index) {
  const prefix = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
                  '150', '151', '152', '153', '155', '156', '157', '158', '159',
                  '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
  const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix[index % prefix.length] + random;
}

// 测试用户数据模板
const testUsers = [
  // 男生（10个）
  {
    nickname: '小明',
    role: 'male_student',
    age_bucket: '18-25',
    city: '北京',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['运动', '读书', '旅行', '电影'],
    values: {
      consumption: '长期soul mate',
      boundary: '适度边界',
      communication: '直接沟通'
    },
    appearancePref: {
      acceptance: '有点要求'
    }
  },
  {
    nickname: '张同学',
    role: 'male_student',
    age_bucket: '18-25',
    city: '上海',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['运动', '音乐', '游戏'],
    values: {
      consumption: '短期伴侣',
      boundary: '开放边界',
      communication: '灵活沟通'
    },
    appearancePref: {
      acceptance: '顶级颜控'
    }
  },
  {
    nickname: '李同学',
    role: 'male_student',
    age_bucket: '18-25',
    city: '广州',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['读书', '旅行', '摄影'],
    values: {
      consumption: '长期soul mate',
      boundary: '适度边界',
      communication: '直接沟通'
    },
    appearancePref: {
      acceptance: '更看重内在'
    }
  },
  {
    nickname: '王同学',
    role: 'male_student',
    age_bucket: '18-25',
    city: '深圳',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['科技', '读书', '运动'],
    values: {
      consumption: '命定姻缘',
      boundary: '严格边界',
      communication: '委婉沟通'
    },
    appearancePref: {
      acceptance: '有点要求'
    }
  },
  {
    nickname: '刘同学',
    role: 'male_student',
    age_bucket: '18-25',
    city: '杭州',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['电影', '音乐', '旅行'],
    values: {
      consumption: '长期soul mate',
      boundary: '适度边界',
      communication: '直接沟通'
    },
    appearancePref: {
      acceptance: '更看重内在'
    }
  },
  {
    nickname: '陈同学',
    role: 'male_student',
    age_bucket: '18-25',
    city: '成都',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['运动', '电影', '美食'],
    values: {
      consumption: '短期伴侣',
      boundary: '开放边界',
      communication: '灵活沟通'
    },
    appearancePref: {
      acceptance: '有点要求'
    }
  },
  {
    nickname: '杨同学',
    role: 'male_student',
    age_bucket: '18-25',
    city: '西安',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['读书', '旅行', '艺术'],
    values: {
      consumption: '长期soul mate',
      boundary: '适度边界',
      communication: '直接沟通'
    },
    appearancePref: {
      acceptance: '更看重内在'
    }
  },
  {
    nickname: '赵同学',
    role: 'male_student',
    age_bucket: '18-25',
    city: '南京',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['运动', '音乐', '科技'],
    values: {
      consumption: '命定姻缘',
      boundary: '严格边界',
      communication: '委婉沟通'
    },
    appearancePref: {
      acceptance: '顶级颜控'
    }
  },
  {
    nickname: '周同学',
    role: 'male_student',
    age_bucket: '18-25',
    city: '武汉',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['电影', '读书', '旅行'],
    values: {
      consumption: '长期soul mate',
      boundary: '适度边界',
      communication: '直接沟通'
    },
    appearancePref: {
      acceptance: '有点要求'
    }
  },
  {
    nickname: '吴同学',
    role: 'male_student',
    age_bucket: '18-25',
    city: '重庆',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['运动', '美食', '音乐'],
    values: {
      consumption: '短期伴侣',
      boundary: '开放边界',
      communication: '灵活沟通'
    },
    appearancePref: {
      acceptance: '更看重内在'
    }
  },
  
  // 女生（10个）
  {
    nickname: '小雨',
    role: 'female',
    age_bucket: '28-38',
    city: '北京',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['读书', '旅行', '艺术', '电影'],
    values: {
      consumption: '长期soul mate',
      boundary: '适度边界',
      communication: '直接沟通'
    },
    appearancePref: {
      acceptance: '更看重内在'
    },
    assetFlag: true
  },
  {
    nickname: '美丽',
    role: 'female',
    age_bucket: '28-38',
    city: '上海',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['运动', '音乐', '旅行'],
    values: {
      consumption: '命定姻缘',
      boundary: '严格边界',
      communication: '委婉沟通'
    },
    appearancePref: {
      acceptance: '有点要求'
    },
    assetFlag: true
  },
  {
    nickname: '优雅',
    role: 'female',
    age_bucket: '28-38',
    city: '广州',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['读书', '摄影', '艺术'],
    values: {
      consumption: '长期soul mate',
      boundary: '适度边界',
      communication: '直接沟通'
    },
    appearancePref: {
      acceptance: '更看重内在'
    },
    assetFlag: false
  },
  {
    nickname: '温柔',
    role: 'female',
    age_bucket: '28-38',
    city: '深圳',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['电影', '音乐', '美食'],
    values: {
      consumption: '短期伴侣',
      boundary: '开放边界',
      communication: '灵活沟通'
    },
    appearancePref: {
      acceptance: '顶级颜控'
    },
    assetFlag: true
  },
  {
    nickname: '智慧',
    role: 'female',
    age_bucket: '28-38',
    city: '杭州',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['读书', '旅行', '科技'],
    values: {
      consumption: '长期soul mate',
      boundary: '适度边界',
      communication: '直接沟通'
    },
    appearancePref: {
      acceptance: '有点要求'
    },
    assetFlag: true
  },
  {
    nickname: '阳光',
    role: 'female',
    age_bucket: '28-38',
    city: '成都',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['运动', '旅行', '美食'],
    values: {
      consumption: '命定姻缘',
      boundary: '严格边界',
      communication: '委婉沟通'
    },
    appearancePref: {
      acceptance: '更看重内在'
    },
    assetFlag: false
  },
  {
    nickname: '精致',
    role: 'female',
    age_bucket: '28-38',
    city: '西安',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['艺术', '读书', '电影'],
    values: {
      consumption: '长期soul mate',
      boundary: '适度边界',
      communication: '直接沟通'
    },
    appearancePref: {
      acceptance: '有点要求'
    },
    assetFlag: true
  },
  {
    nickname: '知性',
    role: 'female',
    age_bucket: '28-38',
    city: '南京',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['读书', '音乐', '旅行'],
    values: {
      consumption: '短期伴侣',
      boundary: '开放边界',
      communication: '灵活沟通'
    },
    appearancePref: {
      acceptance: '顶级颜控'
    },
    assetFlag: true
  },
  {
    nickname: '独立',
    role: 'female',
    age_bucket: '28-38',
    city: '武汉',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['运动', '科技', '旅行'],
    values: {
      consumption: '长期soul mate',
      boundary: '适度边界',
      communication: '直接沟通'
    },
    appearancePref: {
      acceptance: '更看重内在'
    },
    assetFlag: true
  },
  {
    nickname: '优雅',
    role: 'female',
    age_bucket: '28-38',
    city: '重庆',
    avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    interests: ['电影', '美食', '艺术'],
    values: {
      consumption: '命定姻缘',
      boundary: '严格边界',
      communication: '委婉沟通'
    },
    appearancePref: {
      acceptance: '有点要求'
    },
    assetFlag: false
  }
];

/**
 * 初始化用户数据
 */
function initUsers() {
  console.log('开始初始化用户数据...\n');
  
  const users = [];
  const questionnaires = [];
  const photos = [];
  
  testUsers.forEach((userTemplate, index) => {
    const uid = index + 1;
    const openid = generateOpenId(index + 1);
    const phone = generatePhone(index);
    
    // 创建用户记录
    const user = {
      uid: uid,
      openid: openid,
      phone: phone,
      nickname: userTemplate.nickname,
      avatar: userTemplate.avatar,
      role: userTemplate.role,
      auth_status: 'verified', // 初始用户设为已认证
      age_bucket: userTemplate.age_bucket,
      city: userTemplate.city,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    users.push(user);
    
    // 创建问卷记录
    const questionnaire = {
      uid: uid,
      basic_info: {
        age: userTemplate.age_bucket === '18-25' ? 22 : 32,
        education: '本科',
        city: userTemplate.city
      },
      interests: userTemplate.interests,
      values: userTemplate.values,
      appearance_pref: userTemplate.appearancePref,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    questionnaires.push(questionnaire);
    
    // 创建照片记录（模拟，实际需要上传真实照片）
    const photo = {
      uid: uid,
      url: userTemplate.avatar, // 暂时使用头像URL
      is_primary: 1,
      quality_score: 5.5,
      ai_style_score: 5.5,
      ai_taste_score: 5.5,
      ai_coordination_score: 5.5,
      audit_status: 'approved',
      created_at: new Date().toISOString()
    };
    photos.push(photo);
    
    console.log(`✓ 创建用户 ${uid}: ${userTemplate.nickname} (${userTemplate.role === 'male_student' ? '男生' : '女生'})`);
  });
  
  // 保存到文件
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  fs.writeFileSync(QUESTIONNAIRE_FILE, JSON.stringify(questionnaires, null, 2), 'utf8');
  fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2), 'utf8');
  
  console.log(`\n✅ 成功创建 ${users.length} 个用户数据！`);
  console.log(`\n数据文件位置:`);
  console.log(`  用户数据: ${USERS_FILE}`);
  console.log(`  问卷数据: ${QUESTIONNAIRE_FILE}`);
  console.log(`  照片数据: ${PHOTOS_FILE}`);
  console.log(`\n提示: 这些数据可以导入到数据库中，或者通过API接口使用。`);
}

// 运行初始化
if (require.main === module) {
  initUsers();
}

module.exports = { initUsers, testUsers };

