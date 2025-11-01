/**
 * 照片上传测试脚本（自动检测端口）
 * 使用方法: node test-upload-3000.js "D:\photo\Screenshots\images.jpg"
 */

const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

// 获取图片路径（命令行参数或默认路径）
const imagePath = process.argv[2] || path.join(__dirname, 'uploads', 'test-image.jpg');

// 检查路径是否存在
if (!fs.existsSync(imagePath)) {
  console.error(`错误: 路径不存在: ${imagePath}`);
  console.log('\n使用方法:');
  console.log('  node test-upload-3000.js "D:\\photo\\Screenshots\\images.jpg"');
  process.exit(1);
}

// 检查是否是目录
const stats = fs.statSync(imagePath);
if (stats.isDirectory()) {
  console.error(`错误: 提供的是目录，不是文件: ${imagePath}`);
  console.log('\n提示: 请提供图片文件的完整路径，例如:');
  console.log('  node test-upload-3000.js "D:\\TEST\\image.jpg"');
  console.log('\n如果目录中有图片，可以查找图片文件:');
  try {
    const files = fs.readdirSync(imagePath).filter(f => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
    );
    if (files.length > 0) {
      console.log(`\n找到 ${files.length} 个图片文件:`);
      files.slice(0, 5).forEach(file => {
        console.log(`  - ${path.join(imagePath, file)}`);
      });
      if (files.length > 5) {
        console.log(`  ... 还有 ${files.length - 5} 个文件`);
      }
      console.log(`\n使用示例:`);
      console.log(`  node test-upload-3000.js "${path.join(imagePath, files[0])}"`);
    } else {
      console.log('  目录中没有找到图片文件（.jpg, .jpeg, .png, .gif, .webp）');
    }
  } catch (err) {
    console.error('  无法读取目录:', err.message);
  }
  process.exit(1);
}

// 自动检测服务器端口（从3000开始尝试）
async function findServerPort() {
  const ports = [3000, 3001, 3002];
  
  for (const port of ports) {
    try {
      const response = await axios.get(`http://localhost:${port}/api/test`, {
        timeout: 1000
      });
      if (response.data.code === 200) {
        return port;
      }
    } catch (error) {
      // 继续尝试下一个端口
    }
  }
  return null;
}

// 上传照片的主函数
async function uploadPhoto() {
  // 自动检测服务器端口
  const port = await findServerPort();
  if (!port) {
    console.error('错误: 未找到运行中的服务器！');
    console.error('请确保服务器已启动: npm start');
    console.error('\n提示: 运行以下命令检查服务器状态:');
    console.error('  node check-server.js');
    process.exit(1);
  }
  
  const baseUrl = `http://localhost:${port}`;
  const uploadApi = `${baseUrl}/api/questionnaire/upload-photo`;
  
  console.log('正在上传图片...');
  console.log(`图片路径: ${imagePath}`);
  console.log(`检测到服务器运行在端口 ${port}`);
  console.log(`API地址: ${uploadApi}\n`);

  // 创建FormData
  const form = new FormData();
  form.append('photo', fs.createReadStream(imagePath));

  // 发送请求
  const response = await axios.post(uploadApi, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });
  
  return response;
}

// 执行上传
uploadPhoto()
.then(response => {
  console.log('✓ 上传成功！\n');
  console.log('响应数据:');
  console.log(JSON.stringify(response.data, null, 2));
  
  // 显示关键信息
  if (response.data.data) {
    const data = response.data.data;
    console.log('\n关键信息:');
    console.log(`  图片URL: ${data.url}`);
    console.log(`  质量评分: ${data.qualityScore}`);
    if (data.beautyScore) {
      console.log(`  颜值评分: ${data.beautyScore} (1-10分)`);
    }
    if (data.aiScores) {
      console.log(`  多维度AI评分:`);
      Object.entries(data.aiScores).forEach(([key, value]) => {
        console.log(`    ${key}: ${value}`);
      });
    }
    if (data.rawBeautyScore) {
      console.log(`  原始Face++评分 (0-100分):`);
      console.log(`    男性评分: ${data.rawBeautyScore.male_score}`);
      console.log(`    女性评分: ${data.rawBeautyScore.female_score}`);
      console.log(`    当前性别评分: ${data.rawBeautyScore.selected_score}`);
    }
    console.log(`  检测到人脸: ${data.faceDetected}`);
    console.log(`  AI分析成功: ${data.aiAnalysisSuccess}`);
    
    // 如果有错误信息，显示出来
    if (data.error) {
      console.log(`\n⚠ 错误信息: ${data.error}`);
    }
  }
})
.catch(error => {
  console.error('✗ 上传失败！\n');
  if (error.response) {
    console.error('错误响应:', error.response.data);
    console.error('状态码:', error.response.status);
  } else if (error.request) {
    console.error('请求失败，请确保服务器正在运行');
    console.error('\n提示: 运行以下命令检查服务器状态:');
    console.error('  node check-server.js');
  } else {
    console.error('错误:', error.message);
  }
  process.exit(1);
});
