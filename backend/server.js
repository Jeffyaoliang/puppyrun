// 简单的测试后端服务器
// 用于测试 Cloudflare Tunnel 连接

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');

// 使用新的服务模块（推荐）
const { aiService } = require('./services/aiService');
const { matchService } = require('./services/matchService');

// 保持向后兼容：仍然导出旧模块（可选）
// const { analyzePhotoWithFacePP } = require('./utils/facepp');

// 初始化AI服务
// 优先使用环境变量，如果没有则使用默认配置（已在facepp.js中配置）
aiService.init({
  apiSecret: process.env.FACEPP_API_SECRET || 'HfS00DI4f1THF7BWH0_h8D_Twxe0m_sg'
});

// 信任代理（用于Cloudflare Tunnel等反向代理）
app.set('trust proxy', true);

// 启用 CORS
app.use(cors());

// 解析 JSON
app.use(express.json());

// 配置文件上传 - 保留原始文件名和扩展名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // 保留原始文件名和扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let ext = path.extname(file.originalname);
    
    console.log('生成文件名:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      extractedExt: ext
    });
    
    // 如果没有扩展名，根据mimetype推断
    if (!ext || ext === '') {
      const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp'
      };
      ext = mimeToExt[file.mimetype] || '.jpg';
      console.log('根据mimetype推断扩展名:', ext);
    }
    
    // 确保扩展名是小写且以点开头
    if (!ext.startsWith('.')) {
      ext = '.' + ext;
    }
    ext = ext.toLowerCase();
    
    // 生成文件名：时间戳-随机数.扩展名
    const filename = `${uniqueSuffix}${ext}`;
    console.log('最终文件名:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // 允许图片文件
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件（jpeg, jpg, png, gif, webp）'));
    }
  }
});

// 提供静态文件服务 - 必须在API路由之前
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    // 设置正确的Content-Type
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
    // 设置缓存头
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// 确保上传目录存在
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// 测试接口
app.get('/api/test', (req, res) => {
  res.json({
    code: 200,
    message: '后端服务运行正常！',
    data: {
      timestamp: new Date().toISOString(),
      server: 'puppyrun-backend'
    }
  });
});

// 问卷提交接口（测试）
app.post('/api/questionnaire/submit', (req, res) => {
  console.log('收到问卷提交:', {
    body: req.body,
    timestamp: new Date().toISOString()
  });
  
  try {
    // 快速响应，避免超时
    // 处理照片URL：如果是临时路径，尝试查找对应的已上传文件
    // 注意：这只是测试环境的处理，生产环境应该确保小程序在上传成功后更新URL
    const processedPhotos = req.body.photos || [];
    const finalProtocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const requestHost = req.get('x-forwarded-host') || req.get('host') || 'api.puppyrun.site';
    const baseUrl = `${finalProtocol}://${requestHost}`;
    
    console.log('处理照片URL:', {
      originalPhotos: processedPhotos,
      baseUrl: baseUrl,
      photoCount: processedPhotos.length
    });
    
    // 立即返回响应，避免超时
    res.json({
      code: 200,
      message: '提交成功',
      data: {
        questionnaireId: Date.now().toString(),
        submittedAt: new Date().toISOString(),
        receivedPhotos: processedPhotos,
        photoCount: processedPhotos.length,
        profileGenerated: true,
        note: processedPhotos.some(p => p.startsWith('http://tmp/')) 
          ? '检测到临时路径照片，请确保照片已上传' 
          : '所有照片URL正常'
      }
    });
    
    console.log('问卷提交响应已发送');
    
    // 异步处理后续逻辑（不阻塞响应）
    // TODO: 保存问卷数据到数据库
    // TODO: 生成用户画像
    // TODO: 更新匹配索引
    
  } catch (error) {
    console.error('问卷提交处理失败:', error);
    res.status(500).json({
      code: 500,
      message: '提交失败',
      error: error.message
    });
  }
});

// 照片上传接口（测试）
app.post('/api/questionnaire/upload-photo', upload.single('photo'), async (req, res) => {
  console.log('收到照片上传请求');
  console.log('文件信息:', {
    fieldname: req.file?.fieldname,
    originalname: req.file?.originalname,
    mimetype: req.file?.mimetype,
    size: req.file?.size,
    filename: req.file?.filename,
    path: req.file?.path
  });
  
  if (!req.file) {
    console.error('未收到文件');
    return res.status(400).json({
      code: 400,
      message: '未收到文件',
      data: null
    });
  }
  
  // 生成文件URL - 根据请求头判断实际访问地址
  // 如果是通过Cloudflare Tunnel访问，从请求头获取host
  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:3000';
  const requestHost = req.get('x-forwarded-host') || host;
  
  // 如果是通过Cloudflare Tunnel（有x-forwarded-proto），使用HTTPS
  const finalProtocol = req.get('x-forwarded-proto') || protocol;
  const baseUrl = `${finalProtocol}://${requestHost}`;
  const photoUrl = `${baseUrl}/uploads/${req.file.filename}`;
  
  console.log('文件上传成功:', {
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    url: photoUrl,
    baseUrl: baseUrl,
    protocol: finalProtocol,
    host: requestHost
  });
  
  // 使用AI服务进行照片分析（异步处理，不阻塞响应）
  let aiScores = null;
  try {
    // 使用新的AI服务模块分析照片
    aiScores = await aiService.analyzePhoto({
      imagePath: req.file.path,
      imageUrl: photoUrl
    });
    console.log('AI服务评分结果:', aiScores);
  } catch (error) {
    console.error('AI服务调用失败，使用默认评分:', error.message);
    // API调用失败时，使用默认评分
    aiScores = aiService.getDefaultScores();
    aiScores.success = false;
    aiScores.faceDetected = false;
    aiScores.error = error.message;
  }
  
  // 返回响应，包含AI评分结果
  res.json({
    code: 200,
    message: '上传成功',
    data: {
      url: photoUrl,
      photoId: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      // AI评分结果
      qualityScore: aiScores.quality_score,
      // 直接颜值评分（1-10分）
      beautyScore: aiScores.beauty_score || null,
      // 多维度综合评分
      aiScores: {
        '气质匹配度': aiScores.ai_taste_score,
        '风格契合度': aiScores.ai_style_score,
        '整体协调度': aiScores.ai_coordination_score
      },
      faceDetected: aiScores.faceDetected || false,
      aiAnalysisSuccess: aiScores.success || false,
      // 原始Face++评分（0-100分，用于参考）
      rawBeautyScore: aiScores.rawBeautyScore || null
    }
  });
});

// 获取匹配候选人详情
app.get('/api/match/candidate/:userId', (req, res) => {
  const { userId } = req.params;
  console.log('获取候选人详情:', userId);
  
  // 返回模拟数据
  res.json({
    code: 200,
    message: 'success',
    data: {
      userId: userId,
      nickname: '测试用户',
      age: 22,
      city: '北京',
      avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      basicInfo: {
        age: 22,
        education: '本科',
        city: '北京',
        height: '175cm',
        weight: '65kg'
      },
      interests: ['运动', '读书', '旅行'],
      values: {
        consumption: '理性消费',
        boundary: '适度边界',
        communication: '直接沟通'
      },
      photos: [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg'
      ],
      matchScore: 85,
      matchReasons: ['共同兴趣：运动', '价值观相似']
    }
  });
});

// 管理接口：初始化用户数据（仅用于开发测试）
app.post('/api/admin/init-users', async (req, res) => {
  try {
    const { initUsers } = require('./scripts/init-users');
    initUsers();
    
    res.json({
      code: 200,
      message: '用户数据初始化成功',
      data: {
        usersFile: './data/users.json',
        questionnaireFile: './data/questionnaire.json',
        photosFile: './data/photos.json',
        note: '数据已保存到JSON文件，可以通过数据库导入脚本导入到数据库'
      }
    });
  } catch (error) {
    console.error('初始化用户数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '初始化失败',
      error: error.message
    });
  }
});

// 清理数据中的字符串，去除多余空格
function cleanStringData(obj) {
  // 处理 null 或 undefined
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // 处理字符串
  if (typeof obj === 'string') {
    // 去除所有类型的空白字符（包括不可见字符），首尾空格，并将多个连续空格替换为单个空格
    // \s 匹配所有空白字符，包括空格、制表符、换行符等
    // 使用更严格的清理：先去除首尾空白，再替换中间的多个空白为单个空格
    return obj
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // 去除零宽字符
      .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // 将所有特殊空格替换为普通空格
      .trim() // 去除首尾空格
      .replace(/\s+/g, ' '); // 将多个连续空格替换为单个空格
  }
  
  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => cleanStringData(item));
  }
  
  // 处理对象
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cleaned[key] = cleanStringData(obj[key]);
      }
    }
    return cleaned;
  }
  
  // 其他类型（数字、布尔值等）直接返回
  return obj;
}

// 管理接口：获取所有用户列表（仅用于开发测试）
app.get('/api/admin/users', (req, res) => {
  try {
    const usersFile = path.join(__dirname, 'data', 'users.json');
    const questionnaireFile = path.join(__dirname, 'data', 'questionnaire.json');
    
    if (!fs.existsSync(usersFile)) {
      return res.json({
        code: 200,
        data: {
          users: [],
          message: '暂无用户数据，请先运行初始化脚本'
        }
      });
    }
    
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    const questionnaires = fs.existsSync(questionnaireFile) 
      ? JSON.parse(fs.readFileSync(questionnaireFile, 'utf8'))
      : [];
    
    // 合并用户和问卷数据，并清理字符串数据
    const usersWithQuestionnaire = users.map(user => {
      const questionnaire = questionnaires.find(q => q.uid === user.uid);
      const userData = {
        ...user,
        questionnaire: questionnaire || null
      };
      // 清理数据中的字符串空格
      return cleanStringData(userData);
    });
    
    // 格式化输出，使用缩进让JSON更易读
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // 检查是否是开发环境或请求包含格式化参数
    const pretty = req.query.pretty !== 'false';
    
    if (pretty) {
      // 使用缩进格式化 JSON
      res.send(JSON.stringify({
        code: 200,
        data: {
          users: usersWithQuestionnaire,
          total: users.length
        }
      }, null, 2));
    } else {
      res.json({
        code: 200,
        data: {
          users: usersWithQuestionnaire,
          total: users.length
        }
      });
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取失败',
      error: error.message
    });
  }
});

// 获取匹配候选人列表
app.get('/api/match/candidates', (req, res) => {
  console.log('获取候选人列表:', req.query);
  
  try {
    // 从JSON文件读取用户数据（临时方案，实际应该从数据库查询）
    const usersFile = path.join(__dirname, 'data', 'users.json');
    const questionnaireFile = path.join(__dirname, 'data', 'questionnaire.json');
    const photosFile = path.join(__dirname, 'data', 'photos.json');
    
    if (!fs.existsSync(usersFile)) {
      return res.json({
        code: 200,
        message: 'success',
        data: {
          candidates: [],
          total: 0,
          hasMore: false,
          note: '暂无用户数据，请先运行批量导入'
        }
      });
    }
    
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    const questionnaires = fs.existsSync(questionnaireFile)
      ? JSON.parse(fs.readFileSync(questionnaireFile, 'utf8'))
      : [];
    const photos = fs.existsSync(photosFile)
      ? JSON.parse(fs.readFileSync(photosFile, 'utf8'))
      : [];
    
    // 生成图片完整URL（根据请求头判断实际访问地址）
    // 辅助函数：将相对URL或localhost URL转换为完整URL
    const getBaseUrl = () => {
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
      const requestHost = req.get('x-forwarded-host') || req.get('host') || 'api.puppyrun.site';
      return `${protocol}://${requestHost}`;
    };
    
    const normalizeImageUrl = (url) => {
      if (!url) return '';
      const baseUrl = getBaseUrl();
      // 如果已经是完整URL，检查是否需要转换协议和域名
      if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
        // 将localhost URL转换为实际域名URL
        const filename = url.split('/').pop();
        return `${baseUrl}/uploads/${filename}`;
      }
      // 如果是相对路径
      if (url.startsWith('/uploads/')) {
        return `${baseUrl}${url}`;
      }
      // 如果已经是完整URL，确保使用https
      if (url.startsWith('http://')) {
        return url.replace('http://', 'https://');
      }
      return url;
    };
    
    // 合并数据，构建候选用户列表
    const candidateUsers = users.map(user => {
      const questionnaire = questionnaires.find(q => q.uid === user.uid);
      const userPhotos = photos.filter(p => p.uid === user.uid);
      const primaryPhoto = userPhotos.find(p => p.is_primary === 1) || userPhotos[0];
      
      // 获取头像URL并规范化
      let avatarUrl = primaryPhoto ? primaryPhoto.url : user.avatar;
      avatarUrl = normalizeImageUrl(avatarUrl);
      
      return {
        userId: user.uid,
        uid: user.uid,
        nickname: user.nickname,
        avatar: avatarUrl,
        age: questionnaire?.basic_info?.age || (user.age_bucket === '18-25' ? 22 : 32),
        city: user.city,
        role: user.role,
        interests: questionnaire?.interests || [],
        values: questionnaire?.values || {},
        appearancePref: questionnaire?.appearance_pref || {},
        aiScores: primaryPhoto ? {
          ai_style_score: primaryPhoto.ai_style_score,
          ai_taste_score: primaryPhoto.ai_taste_score,
          ai_coordination_score: primaryPhoto.ai_coordination_score
        } : null,
        photos: userPhotos.map(p => normalizeImageUrl(p.url)),
        authStatus: user.auth_status
      };
    });
    
    // 获取当前用户ID（从token或查询参数，这里简化处理）
    const currentUserId = req.query.currentUserId || req.get('x-user-id');
    const currentUserRoleFromQuery = req.query.currentUserRole; // 前端传递的用户角色
    
    console.log(`📥 接收到的请求参数: currentUserId=${currentUserId}, currentUserRole=${currentUserRoleFromQuery}, role=${req.query.role}`);
    
    // 获取当前用户信息
    let currentUser = currentUserId 
      ? candidateUsers.find(u => u.uid.toString() === currentUserId.toString())
      : null;
    
    // 如果找不到用户但前端传递了角色，创建一个临时用户对象用于性别判断
    // 注意：需要包含默认的问卷数据结构，否则匹配算法会报错
    if (!currentUser && currentUserRoleFromQuery) {
      console.log(`✅ 使用前端传递的角色信息创建临时用户: ${currentUserRoleFromQuery}`);
      currentUser = {
        uid: currentUserId || 0,
        role: currentUserRoleFromQuery,
        interests: [], // 默认空数组
        values: {}, // 默认空对象
        appearancePref: {}, // 默认空对象
        aiScores: null // 默认无AI评分
      };
    } else if (currentUser) {
      console.log(`✅ 找到当前用户: UID=${currentUser.uid}, 角色=${currentUser.role}`);
    } else {
      console.log(`⚠️  未找到当前用户，且未提供currentUserRole参数`);
    }
    
    // 根据当前用户的性别过滤候选用户（必须匹配异性）
    // 强制规则：女生只能看男生，男生只能看女生
    let roleFilteredCandidates = candidateUsers;
    
    if (currentUser) {
      // 优先使用当前用户的性别信息
      if (currentUser.role === 'female') {
        // 当前用户是女生，强制只返回男生
        roleFilteredCandidates = candidateUsers.filter(u => u.role === 'male_student');
        console.log(`✅ 性别过滤: 当前用户是女生（UID: ${currentUser.uid}），强制只显示男生，数量: ${roleFilteredCandidates.length}`);
      } else if (currentUser.role === 'male_student') {
        // 当前用户是男生，强制只返回女生
        roleFilteredCandidates = candidateUsers.filter(u => u.role === 'female');
        console.log(`✅ 性别过滤: 当前用户是男生（UID: ${currentUser.uid}），强制只显示女生，数量: ${roleFilteredCandidates.length}`);
      } else {
        console.error(`❌ 当前用户角色未知: ${currentUser.role}，无法进行性别过滤`);
        // 角色未知时，不返回任何用户（安全策略）
        roleFilteredCandidates = [];
      }
    } else {
      // 如果没有当前用户信息，尝试从role参数推断
      // 注意：role参数在前端传入时，表示"想要查看的目标性别"
      // 女生页面传 role='male_student'（想看男生）
      // 男生页面传 role='female'（想看女生）
      if (req.query.role) {
        const targetRole = req.query.role;
        if (targetRole === 'male_student') {
          // 前端想看男生，说明当前用户是女生
          roleFilteredCandidates = candidateUsers.filter(u => u.role === 'male_student');
          console.log(`⚠️  使用role参数推断: 前端想看男生，推断当前用户是女生，过滤后数量: ${roleFilteredCandidates.length}`);
        } else if (targetRole === 'female') {
          // 前端想看女生，说明当前用户是男生
          roleFilteredCandidates = candidateUsers.filter(u => u.role === 'female');
          console.log(`⚠️  使用role参数推断: 前端想看女生，推断当前用户是男生，过滤后数量: ${roleFilteredCandidates.length}`);
        } else {
          console.warn(`未知的role参数: ${targetRole}`);
          roleFilteredCandidates = [];
        }
      } else {
        // 没有当前用户也没有role参数，不返回任何用户（安全策略）
        console.warn('❌ 未提供当前用户ID或role参数，不返回候选用户（安全策略）');
        roleFilteredCandidates = [];
      }
    }
    
    // 最终强制检查：确保没有同性用户
    const finalCheck = roleFilteredCandidates.filter(candidate => {
      if (currentUser) {
        // 有当前用户信息，严格检查
        if (currentUser.role === 'female' && candidate.role !== 'male_student') {
          console.error(`❌ 发现同性用户: ${candidate.uid} (${candidate.nickname}), 角色: ${candidate.role}`);
          return false;
        }
        if (currentUser.role === 'male_student' && candidate.role !== 'female') {
          console.error(`❌ 发现同性用户: ${candidate.uid} (${candidate.nickname}), 角色: ${candidate.role}`);
          return false;
        }
      }
      return true;
    });
    
    if (finalCheck.length !== roleFilteredCandidates.length) {
      console.error(`❌ 最终检查发现 ${roleFilteredCandidates.length - finalCheck.length} 个同性用户，已过滤`);
    }
    
    roleFilteredCandidates = finalCheck;
    
    // 过滤掉当前用户
    const filteredCandidates = currentUserId
      ? roleFilteredCandidates.filter(u => u.uid.toString() !== currentUserId.toString())
      : roleFilteredCandidates;
    
    // 如果提供了当前用户数据，使用匹配服务计算匹配分数
    if (currentUser && filteredCandidates.length > 0) {
      // 再次确保性别过滤（双重保险）
      const genderFiltered = filteredCandidates.filter(candidate => {
        if (currentUser.role === 'female') {
          return candidate.role === 'male_student';
        } else if (currentUser.role === 'male_student') {
          return candidate.role === 'female';
        }
        return false;
      });
      
      console.log(`性别过滤检查: 当前用户角色=${currentUser.role}, 过滤前=${filteredCandidates.length}, 过滤后=${genderFiltered.length}`);
      
      const matches = matchService.findBestMatches(currentUser, genderFiltered, {
        topN: parseInt(req.query.limit) || 10,
        minScore: parseInt(req.query.minScore) || 0
      });
      
      // 最终安全检查：确保返回结果中不包含同性用户
      const finalCandidates = matches.filter(m => {
        const candidateRole = m.userInfo.role;
        if (currentUser.role === 'female' && candidateRole !== 'male_student') {
          console.error(`发现同性用户: ${m.userId} (${m.userInfo.nickname}), 角色: ${candidateRole}`);
          return false;
        }
        if (currentUser.role === 'male_student' && candidateRole !== 'female') {
          console.error(`发现同性用户: ${m.userId} (${m.userInfo.nickname}), 角色: ${candidateRole}`);
          return false;
        }
        return true;
      });
      
      if (finalCandidates.length !== matches.length) {
        console.warn(`已过滤掉 ${matches.length - finalCandidates.length} 个同性用户`);
      }
      
      // 使用上面的 normalizeImageUrl 函数（已在函数开头定义）
      
      return res.json({
        code: 200,
        message: 'success',
        data: {
          candidates: finalCandidates.map(m => ({
            userId: m.userId,
            uid: m.userId,
            nickname: m.userInfo.nickname,
            avatar: normalizeImageUrl(m.userInfo.avatar),
            age: m.userInfo.age,
            city: m.userInfo.city,
            role: m.userInfo.role, // 添加role字段，前端需要用于性别过滤
            interests: m.userInfo.interests,
            matchScore: Math.round(m.matchScore),
            matchReasons: m.matchReasons,
            photos: (m.userInfo.photos || []).map(p => normalizeImageUrl(p)),
            authStatus: m.userInfo.authStatus
          })),
          total: finalCandidates.length,
          hasMore: false
        }
      });
    }
    
    // 如果没有当前用户，返回过滤后的候选用户（不计算匹配分数）
    // 注意：此时filteredCandidates已经根据role参数或为空
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedCandidates = filteredCandidates.slice(start, end);
    
    // 使用上面的 normalizeImageUrl 函数（已在函数开头定义）
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        candidates: paginatedCandidates.map(u => ({
          userId: u.uid,
          uid: u.uid,
          nickname: u.nickname,
          avatar: normalizeImageUrl(u.avatar),
          age: u.age,
          city: u.city,
          role: u.role, // 添加role字段，前端需要用于性别过滤
          interests: u.interests,
          photos: (u.photos || []).map(p => normalizeImageUrl(p)),
          authStatus: u.authStatus
        })),
        total: filteredCandidates.length,
        hasMore: end < filteredCandidates.length
      }
    });
    
  } catch (error) {
    console.error('获取候选人列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取失败',
      error: error.message
    });
  }
});

// 用户数据导出接口
app.get('/api/user/export-data', (req, res) => {
  console.log('收到数据导出请求');
  const token = req.get('Authorization')?.replace('Bearer ', '');
  
  // 模拟生成导出文件
  const finalProtocol = req.get('x-forwarded-proto') || req.protocol || 'https';
  const requestHost = req.get('x-forwarded-host') || req.get('host') || 'api.puppyrun.site';
  const baseUrl = `${finalProtocol}://${requestHost}`;
  
  // 生成导出文件URL（实际应该是真实的导出文件）
  const exportFileId = Date.now();
  const downloadUrl = `${baseUrl}/api/user/export-data/${exportFileId}`;
  
  res.json({
    code: 200,
    message: '导出成功',
    data: {
      downloadUrl: downloadUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
      note: '测试环境：这是模拟的导出链接'
    }
  });
});

// 注意：express.static 会自动处理 /uploads/* 路径的文件请求
// 如果文件存在则返回文件，不存在则返回404

// 其他GET接口（占位）
app.get('/api/*', (req, res) => {
  console.log('GET请求:', req.path);
  res.json({
    code: 200,
    message: '接口调用成功（测试环境）',
    data: {}
  });
});

// 其他POST接口（占位）
app.post('/api/*', (req, res) => {
  console.log('POST请求:', req.path);
  res.json({
    code: 200,
    message: '接口调用成功（测试环境）',
    data: {}
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

// 尝试启动服务器，如果端口被占用则尝试下一个端口
function startServer(port) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`========================================`);
    console.log(`后端服务器已启动`);
    console.log(`端口: ${port}`);
    console.log(`本地访问: http://localhost:${port}`);
    console.log(`测试接口: http://localhost:${port}/api/test`);
    console.log(`========================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`端口 ${port} 已被占用，尝试使用端口 ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('服务器启动失败:', err);
      process.exit(1);
    }
  });
}

startServer(PORT);

