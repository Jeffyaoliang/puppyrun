/**
 * 批量导入用户工具
 * 支持一次性导入用户数据、问卷和照片
 * 
 * 使用方法：
 * node scripts/batch-import-users.js
 * 
 * 或者指定照片目录：
 * node scripts/batch-import-users.js --photos-dir "D:\TEST"
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { initUsers, testUsers } = require('./init-users');

// 配置
const CONFIG = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  photosDir: null, // 照片目录，可以通过命令行参数指定
  uploadPhotos: true, // 是否上传照片
  delayBetweenUploads: 1000 // 上传间隔（毫秒），避免API限流
};

// 解析命令行参数
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--photos-dir' && args[i + 1]) {
    CONFIG.photosDir = args[i + 1];
  } else if (args[i] === '--no-photos') {
    CONFIG.uploadPhotos = false;
  } else if (args[i] === '--api-url' && args[i + 1]) {
    CONFIG.apiBaseUrl = args[i + 1];
  }
}

// 查找照片文件
function findPhotoFiles(photosDir) {
  if (!photosDir || !fs.existsSync(photosDir)) {
    return [];
  }
  
  const files = fs.readdirSync(photosDir).filter(f => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
  );
  
  return files.map(f => path.join(photosDir, f));
}

// 上传照片
async function uploadPhoto(imagePath, apiBaseUrl) {
  try {
    const form = new FormData();
    form.append('photo', fs.createReadStream(imagePath));
    
    const response = await axios.post(`${apiBaseUrl}/api/questionnaire/upload-photo`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 30000
    });
    
    if (response.data.code === 200) {
      return {
        success: true,
        url: response.data.data.url,
        aiScores: response.data.data.aiScores,
        beautyScore: response.data.data.beautyScore,
        faceDetected: response.data.data.faceDetected
      };
    } else {
      return {
        success: false,
        error: response.data.message || '上传失败'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || '上传失败'
    };
  }
}

// 检查服务器是否运行
async function checkServer(apiBaseUrl) {
  try {
    const response = await axios.get(`${apiBaseUrl}/api/test`, {
      timeout: 2000
    });
    return response.data.code === 200;
  } catch (error) {
    return false;
  }
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 批量导入用户
async function batchImportUsers() {
  console.log('========================================');
  console.log('批量导入用户工具');
  console.log('========================================\n');
  
  // 检查服务器
  console.log(`检查服务器状态: ${CONFIG.apiBaseUrl}...`);
  const serverRunning = await checkServer(CONFIG.apiBaseUrl);
  if (!serverRunning) {
    console.error('✗ 服务器未运行！');
    console.error(`请确保服务器已启动: npm start`);
    console.error(`当前API地址: ${CONFIG.apiBaseUrl}`);
    process.exit(1);
  }
  console.log('✓ 服务器运行正常\n');
  
  // 初始化用户数据
  console.log('步骤1: 初始化用户数据...');
  initUsers();
  console.log('✓ 用户数据已生成\n');
  
  // 读取用户数据
  const usersFile = path.join(__dirname, '..', 'data', 'users.json');
  const questionnaireFile = path.join(__dirname, '..', 'data', 'questionnaire.json');
  
  if (!fs.existsSync(usersFile)) {
    console.error('✗ 用户数据文件不存在！');
    process.exit(1);
  }
  
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  const questionnaires = fs.existsSync(questionnaireFile)
    ? JSON.parse(fs.readFileSync(questionnaireFile, 'utf8'))
    : [];
  
  console.log(`找到 ${users.length} 个用户数据\n`);
  
  // 查找照片文件
  let photoFiles = [];
  if (CONFIG.uploadPhotos) {
    console.log('步骤2: 查找照片文件...');
    if (CONFIG.photosDir) {
      photoFiles = findPhotoFiles(CONFIG.photosDir);
      console.log(`从指定目录找到 ${photoFiles.length} 张照片: ${CONFIG.photosDir}`);
    } else {
      // 尝试从常见位置查找
      const commonDirs = [
        path.join(__dirname, '..', 'uploads'),
        path.join(__dirname, '..', '..', '..', 'TEST'),
        'D:\\TEST',
        'D:\\photo\\Screenshots'
      ];
      
      for (const dir of commonDirs) {
        if (fs.existsSync(dir)) {
          const files = findPhotoFiles(dir);
          if (files.length > 0) {
            photoFiles = files;
            console.log(`从目录找到 ${files.length} 张照片: ${dir}`);
            break;
          }
        }
      }
    }
    
    if (photoFiles.length === 0) {
      console.log('⚠ 未找到照片文件，将跳过照片上传');
      console.log('提示: 使用 --photos-dir 参数指定照片目录');
      CONFIG.uploadPhotos = false;
    } else {
      console.log(`✓ 找到 ${photoFiles.length} 张照片\n`);
    }
  }
  
  // 批量上传照片
  const uploadResults = [];
  if (CONFIG.uploadPhotos && photoFiles.length > 0) {
    console.log('步骤3: 批量上传照片...');
    console.log(`上传间隔: ${CONFIG.delayBetweenUploads}ms\n`);
    
    for (let i = 0; i < Math.min(photoFiles.length, users.length); i++) {
      const photoPath = photoFiles[i];
      const user = users[i];
      
      console.log(`[${i + 1}/${Math.min(photoFiles.length, users.length)}] 上传照片: ${path.basename(photoPath)}`);
      console.log(`  用户: ${user.nickname} (${user.role === 'male_student' ? '男生' : '女生'})`);
      
      const result = await uploadPhoto(photoPath, CONFIG.apiBaseUrl);
      
      if (result.success) {
        console.log(`  ✓ 上传成功`);
        console.log(`  照片URL: ${result.url}`);
        if (result.beautyScore) {
          console.log(`  颜值评分: ${result.beautyScore}`);
        }
        if (result.aiScores) {
          console.log(`  AI评分: ${JSON.stringify(result.aiScores)}`);
        }
        console.log(`  检测到人脸: ${result.faceDetected ? '是' : '否'}\n`);
        
        uploadResults.push({
          userId: user.uid,
          nickname: user.nickname,
          photoPath: photoPath,
          photoUrl: result.url,
          aiScores: result.aiScores,
          beautyScore: result.beautyScore,
          faceDetected: result.faceDetected
        });
      } else {
        console.log(`  ✗ 上传失败: ${result.error}\n`);
        uploadResults.push({
          userId: user.uid,
          nickname: user.nickname,
          photoPath: photoPath,
          success: false,
          error: result.error
        });
      }
      
      // 延迟，避免API限流
      if (i < Math.min(photoFiles.length, users.length) - 1) {
        await delay(CONFIG.delayBetweenUploads);
      }
    }
  }
  
  // 生成导入报告
  console.log('\n========================================');
  console.log('导入完成！');
  console.log('========================================\n');
  
  console.log(`用户数据: ${users.length} 个`);
  console.log(`问卷数据: ${questionnaires.length} 个`);
  if (CONFIG.uploadPhotos) {
    const successCount = uploadResults.filter(r => r.success !== false).length;
    const failCount = uploadResults.length - successCount;
    console.log(`照片上传: ${successCount} 成功, ${failCount} 失败`);
  }
  
  // 保存上传结果
  if (uploadResults.length > 0) {
    const resultsFile = path.join(__dirname, '..', 'data', 'upload-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(uploadResults, null, 2), 'utf8');
    console.log(`\n上传结果已保存到: ${resultsFile}`);
  }
  
  console.log('\n数据文件位置:');
  console.log(`  用户数据: ${usersFile}`);
  console.log(`  问卷数据: ${questionnaireFile}`);
  console.log(`  照片数据: ${path.join(__dirname, '..', 'data', 'photos.json')}`);
  
  console.log('\n下一步:');
  console.log('1. 检查数据文件是否正确');
  console.log('2. 将数据导入到数据库（如果有数据库）');
  console.log('3. 或通过小程序逐个登录完善用户信息');
}

// 运行
if (require.main === module) {
  batchImportUsers().catch(error => {
    console.error('批量导入失败:', error);
    process.exit(1);
  });
}

module.exports = { batchImportUsers };

