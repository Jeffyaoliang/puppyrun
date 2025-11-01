/**
 * 更新照片数据文件
 * 将上传结果中的照片URL和AI评分整合到photos.json
 */

const fs = require('fs');
const path = require('path');

const uploadResultsFile = path.join(__dirname, '..', 'data', 'upload-results.json');
const photosFile = path.join(__dirname, '..', 'data', 'photos.json');
const usersFile = path.join(__dirname, '..', 'data', 'users.json');

// 读取数据
const uploadResults = JSON.parse(fs.readFileSync(uploadResultsFile, 'utf8'));
const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

// 更新照片数据
const photos = uploadResults.map(result => {
  const user = users.find(u => u.uid === result.userId);
  
  return {
    uid: result.userId,
    url: result.photoUrl,
    is_primary: 1,
    quality_score: result.aiScores ? (result.aiScores['整体协调度'] || 5.5) : 5.5,
    ai_style_score: result.aiScores ? (result.aiScores['风格契合度'] || 5.5) : 5.5,
    ai_taste_score: result.aiScores ? (result.aiScores['气质匹配度'] || 5.5) : 5.5,
    ai_coordination_score: result.aiScores ? (result.aiScores['整体协调度'] || 5.5) : 5.5,
    beauty_score: result.beautyScore || null,
    audit_status: 'approved',
    sort_order: 0,
    created_at: new Date().toISOString()
  };
});

// 保存
fs.writeFileSync(photosFile, JSON.stringify(photos, null, 2), 'utf8');

console.log(`✓ 已更新 ${photos.length} 条照片数据`);
console.log(`照片数据文件: ${photosFile}`);

