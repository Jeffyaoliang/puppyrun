/**
 * 照片上传测试脚本（端口3002）
 * 使用方法: node test-upload-3002.js "D:\photo\Screenshots\images.jpg"
 */

const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

// 获取图片路径（命令行参数或默认路径）
const imagePath = process.argv[2] || path.join(__dirname, 'uploads', 'test-image.jpg');

// 检查文件是否存在
if (!fs.existsSync(imagePath)) {
  console.error(`错误: 文件不存在: ${imagePath}`);
  console.log('\n使用方法:');
  console.log('  node test-upload-3002.js "D:\\photo\\Screenshots\\images.jpg"');
  process.exit(1);
}

// 使用端口3002（根据服务器实际运行端口）
const baseUrl = 'http://localhost:3002';
const uploadApi = `${baseUrl}/api/questionnaire/upload-photo`;

console.log('正在上传图片...');
console.log(`图片路径: ${imagePath}`);
console.log(`API地址: ${uploadApi}\n`);

// 创建FormData
const form = new FormData();
form.append('photo', fs.createReadStream(imagePath));

// 发送请求
axios.post(uploadApi, form, {
  headers: form.getHeaders(),
  maxContentLength: Infinity,
  maxBodyLength: Infinity
})
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
    if (data.aiScores) {
      console.log(`  AI评分:`);
      Object.entries(data.aiScores).forEach(([key, value]) => {
        console.log(`    ${key}: ${value}`);
      });
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
    console.error('服务器地址:', uploadApi);
  } else {
    console.error('错误:', error.message);
  }
  process.exit(1);
});

