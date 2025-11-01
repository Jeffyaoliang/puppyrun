/**
 * 批量AI评分脚本
 * 对photos.json中所有默认评分的照片进行AI分析并更新评分
 * 
 * 使用方法：
 * node scripts/batch-score-photos.js
 * 或指定photo_id范围：
 * node scripts/batch-score-photos.js --photo-id=1,2,3
 * 或指定uid范围：
 * node scripts/batch-score-photos.js --uid=11,12,13
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { aiService } = require('../services/aiService');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// 初始化AI服务
aiService.init({
  apiSecret: process.env.FACEPP_API_SECRET || 'HfS00DI4f1THF7BWH0_h8D_Twxe0m_sg'
});

/**
 * 从URL获取本地文件路径
 * @param {string} url - 照片URL
 * @returns {string|null} 本地文件路径
 */
function getLocalPathFromUrl(url) {
  if (!url) return null;
  
  // 提取文件名
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  
  if (!filename) return null;
  
  const localPath = path.join(UPLOADS_DIR, filename);
  
  // 检查文件是否存在
  if (fs.existsSync(localPath)) {
    return localPath;
  }
  
  return null;
}

/**
 * 转换图片格式（webp转jpg）
 * @param {string} inputPath - 输入文件路径
 * @returns {Promise<string>} 转换后的文件路径
 */
async function convertImageFormat(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  
  // 如果已经是jpg/jpeg/png，直接返回
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    return inputPath;
  }
  
  // 如果是webp或其他格式，转换为jpg
  const outputPath = inputPath.replace(ext, '.jpg');
  
  try {
    await sharp(inputPath)
      .jpeg({ quality: 90 })
      .toFile(outputPath);
    
    console.log(`  ✓ 格式转换: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
    return outputPath;
  } catch (error) {
    console.error(`  ✗ 格式转换失败: ${error.message}`);
    // 转换失败时返回原路径（可能API支持）
    return inputPath;
  }
}

/**
 * 批量评分照片
 * @param {Array<number>} photoIds - 要评分的photo_id列表（可选）
 * @param {Array<number>} uids - 要评分的uid列表（可选）
 */
async function batchScorePhotos(photoIds = null, uids = null) {
  console.log('开始批量AI评分...\n');
  
  if (!fs.existsSync(PHOTOS_FILE)) {
    console.error('错误: 照片数据文件不存在');
    process.exit(1);
  }
  
  try {
    // 读取照片数据
    const photos = JSON.parse(fs.readFileSync(PHOTOS_FILE, 'utf8'));
    
    // 过滤需要评分的照片
    let photosToScore = photos.filter(photo => {
      // 如果指定了photo_id，只处理这些照片
      if (photoIds && photoIds.length > 0) {
        return photoIds.includes(photo.photo_id);
      }
      
      // 如果指定了uid，只处理这些用户的照片
      if (uids && uids.length > 0) {
        return uids.includes(photo.uid);
      }
      
      // 默认：处理所有使用默认评分的照片（quality_score === 5.5 且 ai_style_score === 5.5）
      return photo.quality_score === 5.5 && 
             photo.ai_style_score === 5.5 && 
             photo.ai_taste_score === 5.5 &&
             photo.ai_coordination_score === 5.5;
    });
    
    console.log(`找到 ${photosToScore.length} 张需要评分的照片\n`);
    
    if (photosToScore.length === 0) {
      console.log('没有找到需要评分的照片');
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    // 批量处理，每次处理3张（避免API限流）
    const batchSize = 3;
    for (let i = 0; i < photosToScore.length; i += batchSize) {
      const batch = photosToScore.slice(i, i + batchSize);
      
      console.log(`\n处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(photosToScore.length / batchSize)} (${batch.length} 张照片)`);
      
      const batchPromises = batch.map(async (photo) => {
        try {
          // 获取本地文件路径
          let localPath = getLocalPathFromUrl(photo.url);
          
          if (!localPath) {
            console.log(`⚠ 照片 ${photo.photo_id} (uid: ${photo.uid}): 本地文件不存在，跳过`);
            return { photo, success: false, error: '文件不存在' };
          }
          
          // 转换图片格式（webp转jpg）
          localPath = await convertImageFormat(localPath);
          
          console.log(`  正在分析照片 ${photo.photo_id} (uid: ${photo.uid})...`);
          
          // 调用AI服务分析照片
          const aiResult = await aiService.analyzePhoto({
            imagePath: localPath,
            imageUrl: photo.url
          });
          
          if (aiResult.success && aiResult.faceDetected) {
            // 更新照片评分
            photo.quality_score = aiResult.quality_score || photo.quality_score;
            photo.ai_style_score = aiResult.ai_style_score || photo.ai_style_score;
            photo.ai_taste_score = aiResult.ai_taste_score || photo.ai_taste_score;
            photo.ai_coordination_score = aiResult.ai_coordination_score || photo.ai_coordination_score;
            photo.beauty_score = aiResult.beauty_score || photo.beauty_score;
            
            // 更新updated_at时间
            photo.updated_at = new Date().toISOString();
            
            console.log(`  ✓ 照片 ${photo.photo_id}: beauty=${photo.beauty_score?.toFixed(1)}, style=${photo.ai_style_score?.toFixed(1)}, taste=${photo.ai_taste_score?.toFixed(1)}, coord=${photo.ai_coordination_score?.toFixed(1)}`);
            
            return { photo, success: true };
          } else {
            console.log(`  ✗ 照片 ${photo.photo_id}: AI分析失败 - ${aiResult.error || '未检测到人脸'}`);
            return { photo, success: false, error: aiResult.error || '未检测到人脸' };
          }
        } catch (error) {
          console.log(`  ✗ 照片 ${photo.photo_id}: 处理失败 - ${error.message}`);
          return { photo, success: false, error: error.message };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // 统计结果
      batchResults.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      });
      
      // 每批次处理后保存一次（防止中途失败丢失数据）
      fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2), 'utf8');
      
      // 避免API限流，等待1秒
      if (i + batchSize < photosToScore.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 最终保存
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2), 'utf8');
    
    console.log(`\n✅ 批量评分完成！`);
    console.log(`  成功: ${successCount} 张`);
    console.log(`  失败: ${failCount} 张`);
    console.log(`\n数据文件位置: ${PHOTOS_FILE}`);
    
  } catch (error) {
    console.error('批量评分失败:', error);
    process.exit(1);
  }
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  let photoIds = null;
  let uids = null;
  
  args.forEach(arg => {
    if (arg.startsWith('--photo-id=')) {
      const ids = arg.split('=')[1].split(',').map(id => parseInt(id.trim()));
      photoIds = ids.filter(id => !isNaN(id));
    } else if (arg.startsWith('--uid=')) {
      const ids = arg.split('=')[1].split(',').map(id => parseInt(id.trim()));
      uids = ids.filter(id => !isNaN(id));
    }
  });
  
  return { photoIds, uids };
}

// 运行批量评分
if (require.main === module) {
  const { photoIds, uids } = parseArgs();
  
  if (photoIds && photoIds.length > 0) {
    console.log(`指定photo_id: ${photoIds.join(', ')}\n`);
  }
  if (uids && uids.length > 0) {
    console.log(`指定uid: ${uids.join(', ')}\n`);
  }
  
  batchScorePhotos(photoIds, uids).catch(error => {
    console.error('执行失败:', error);
    process.exit(1);
  });
}

module.exports = { batchScorePhotos };

