// pages/match-male/match-male.ts
// 男生发现页面
import { getApiUrl, API_PATHS, API_BASE_URL } from '../../utils/config';

Page({
  data: {
    candidates: [] as any[],
    currentSwiperIndex: 0,
    loading: false,
    swiperPages: [] as any[][], // 每页4个卡片
    currentPage: 0
  },

  onLoad() {
    this.loadCandidates();
  },

  // 加载候选人列表（男生查看女生）
  loadCandidates() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });

    // 获取当前用户ID和角色
    const currentUserId = wx.getStorageSync('userId') || wx.getStorageSync('uid');
    // 注意：match-male 页面是用来查看男生的，所以当前用户应该是女生
    // 优先从存储中读取用户角色，如果没有则默认为女生（因为这个页面是给女生用的）
    const currentUserRole = wx.getStorageSync('userRole') || 'female';
    
    console.log('当前用户信息:', { 
      currentUserId, 
      currentUserRole, 
      userRoleFromStorage: wx.getStorageSync('userRole'),
      pageType: 'match-male (查看男生页面，当前用户应该是女生)' 
    });
    
    // 调用后端API获取匹配候选人（只返回女生）
    // 构建查询参数（GET请求需要将参数放在URL中）
    const params: string[] = [];
    if (currentUserId) params.push(`currentUserId=${encodeURIComponent(currentUserId)}`);
    params.push(`currentUserRole=${encodeURIComponent(currentUserRole || 'male_student')}`);
    params.push('page=1');
    params.push('limit=20');
    params.push('minScore=70');
    params.push('role=female'); // 目标性别：只看女生
    
    wx.request({
      url: `${getApiUrl(API_PATHS.MATCH_CANDIDATES)}?${params.join('&')}`,
      data: {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token') || ''}`
      },
      success: (res: any) => {
        console.log('获取候选人列表成功:', res.data);
        if (res.data.code === 200) {
          const candidates = (res.data.data.candidates || []).map((item: any) => {
            const candidate = {
              userId: item.userId || item.uid,
              nickname: item.nickname || '用户',
              age: item.age || 0,
              city: item.city || '',
              avatar: item.avatar || '', // 使用后端返回的头像（第一张生活照）
              matchScore: item.matchScore || 0,
              interests: item.interests || [],
              assetLevel: item.authStatus === 'verified' ? '已认证' : '',
              role: item.role || '' // 添加role字段用于前端过滤
            };
            // 调试日志：打印完整信息
            console.log(`候选人 ${candidate.userId} (${candidate.nickname}): 角色=${candidate.role}, 头像URL = ${candidate.avatar}, matchScore = ${candidate.matchScore}`);
            return candidate;
          });
          
          // 前端双重检查：确保只显示男生（match-male页面是用来查看男生的）
          const genderFilteredCandidates = candidates.filter((item: any) => {
            // 只保留男生（male_student）
            if (item.role && item.role !== 'male_student') {
              console.warn(`过滤掉非男生用户: ${item.userId} (${item.nickname}), 角色: ${item.role}`);
              return false;
            }
            return true;
          });
          
          if (genderFilteredCandidates.length !== candidates.length) {
            console.warn(`前端性别过滤: 原始${candidates.length}个，过滤后${genderFilteredCandidates.length}个`);
          }
          
          console.log(`获取到 ${candidates.length} 个候选人，原始matchScore值:`, candidates.map(c => ({ userId: c.userId, matchScore: c.matchScore })));
          
          // 检查当前用户是否有完整的问卷数据
          // 方法1: 检查本地存储的问卷完成标志
          const hasQuestionnaireFromStorage = wx.getStorageSync('hasQuestionnaire') === true || 
                                               wx.getStorageSync('questionnaireCompleted') === true;
          
          // 方法2: 如果所有候选人的匹配分数都很低（<50），可能说明当前用户没有填写问卷
          const validScores = genderFilteredCandidates
            .map(c => c.matchScore)
            .filter(score => score && score > 0);
          const avgScore = validScores.length > 0 
            ? validScores.reduce((sum, s) => sum + s, 0) / validScores.length 
            : 0;
          const maxScore = validScores.length > 0 ? Math.max(...validScores) : 0;
          
          // 如果平均分数很低（<50）或最高分也很低（<60），说明可能没有填写问卷
          const likelyNoQuestionnaire = avgScore < 50 && maxScore < 60;
          
          const hasQuestionnaire = hasQuestionnaireFromStorage || !likelyNoQuestionnaire;
          
          // 如果用户没有填写问卷，降低匹配分数阈值或显示所有
          const minScoreThreshold = hasQuestionnaire ? 70 : 0;
          
          console.log(`当前用户是否填写问卷: ${hasQuestionnaire} (存储: ${hasQuestionnaireFromStorage}, 平均分: ${avgScore}, 最高分: ${maxScore}), 匹配分数阈值: ${minScoreThreshold}`);
          
          // 只显示匹配度高于阈值的（如果没有matchScore或值较小，显示所有）
          const filteredCandidates = genderFilteredCandidates.filter((item: any) => {
            // 如果matchScore为0或未定义，可能是后端没有计算匹配分数，显示所有
            if (!item.matchScore || item.matchScore === 0) {
              console.log(`候选人 ${item.userId} 没有matchScore，将显示`);
              return true;
            }
            // 如果用户没有填写问卷，显示所有候选人（不进行分数过滤）
            if (!hasQuestionnaire) {
              console.log(`用户未填写问卷，显示所有候选人: ${item.userId} (matchScore: ${item.matchScore})`);
              return true;
            }
            return item.matchScore >= minScoreThreshold;
          });
          
          console.log(`过滤后剩余 ${filteredCandidates.length} 个候选人`);

          // 将候选人分组，每页4个
          const swiperPages: any[][] = [];
          for (let i = 0; i < filteredCandidates.length; i += 4) {
            swiperPages.push(filteredCandidates.slice(i, i + 4));
          }

          console.log(`生成的 swiperPages 数量: ${swiperPages.length}`, swiperPages);
          console.log(`每个页面的候选人数量:`, swiperPages.map((page, idx) => `页面${idx + 1}: ${page.length}个`));

          // 确保swiperPages不为空
          if (swiperPages.length === 0 && filteredCandidates.length > 0) {
            console.warn('警告：swiperPages为空但filteredCandidates不为空，强制创建一个页面');
            swiperPages.push(filteredCandidates);
          }

          console.log('准备setData，swiperPages:', swiperPages);
          console.log('准备setData，swiperPages.length:', swiperPages.length);

          this.setData({
            candidates: filteredCandidates,
            swiperPages: swiperPages,
            loading: false
          }, () => {
            console.log('setData 完成后的 swiperPages:', this.data.swiperPages);
            console.log('setData 完成后的 swiperPages.length:', this.data.swiperPages?.length);
            console.log('setData 完成后的 candidates:', this.data.candidates);
            console.log('setData 完成后的 candidates.length:', this.data.candidates?.length);
            
            // 再次检查并强制更新
            if (this.data.swiperPages && this.data.swiperPages.length > 0) {
              console.log('✅ swiperPages有数据，应该显示内容');
              // 强制触发视图更新
              this.setData({
                currentPage: 0
              });
            } else {
              console.error('❌ swiperPages为空，显示空状态');
              // 如果为空，尝试重新设置
              if (filteredCandidates.length > 0) {
                console.log('尝试重新设置swiperPages...');
                const retryPages: any[][] = [];
                for (let i = 0; i < filteredCandidates.length; i += 4) {
                  retryPages.push(filteredCandidates.slice(i, i + 4));
                }
                this.setData({
                  swiperPages: retryPages
                });
              }
            }
          });
        } else {
          console.error('获取候选人列表失败:', res.data.message);
          wx.showToast({
            title: res.data.message || '加载失败',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      },
      fail: (error: any) => {
        console.error('请求失败:', error);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    });
  },

  // Swiper切换
  onSwiperChange(e: any) {
    this.setData({
      currentPage: e.detail.current
    });
  },

  // 查看详情
  viewDetail(e: any) {
    const userId = e.currentTarget.dataset.userid;
    wx.navigateTo({
      url: `/pages/profile/profile?userId=${userId}`
    });
  },

  // 喜欢
  onLike(e: any) {
    const userId = e.currentTarget.dataset.userid;
    const candidate = this.data.candidates.find(c => c.userId === userId);
    if (!candidate) return;

    // 检测是否为测试服务
    const isTestService = API_BASE_URL.includes('httpbin.org') || 
                          API_BASE_URL.includes('jsonplaceholder.typicode.com') ||
                          API_BASE_URL.includes('api.example.com');
    
    if (isTestService) {
      // 测试环境：模拟喜欢操作
      console.log('测试环境：模拟喜欢操作');
      setTimeout(() => {
        // 模拟50%概率匹配成功
        const isMutual = Math.random() > 0.5;
        if (isMutual) {
          wx.showModal({
            title: '匹配成功！',
            content: '你们互相喜欢，可以开始聊天了',
            showCancel: false,
            success: () => {
              wx.navigateTo({
                url: `/pages/chat/chat?matchId=mock_match_${Date.now()}`
              });
            }
          });
        } else {
          wx.showToast({
            title: '已喜欢',
            icon: 'success'
          });
        }
      }, 300);
      return;
    }

    wx.request({
      url: getApiUrl(API_PATHS.MATCH_LIKE),
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        targetUserId: userId,
        action: 'like'
      },
      success: (res: any) => {
        if (res.data && res.data.code === 200) {
          if (res.data.data && res.data.data.isMutual) {
            wx.showModal({
              title: '匹配成功！',
              content: '你们互相喜欢，可以开始聊天了',
              showCancel: false,
              success: () => {
                wx.navigateTo({
                  url: `/pages/chat/chat?matchId=${res.data.data.matchId}`
                });
              }
            });
          } else {
            wx.showToast({
              title: '已喜欢',
              icon: 'success'
            });
          }
        } else {
          wx.showToast({
            title: res.data?.message || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (error: any) => {
        console.error('喜欢操作失败:', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 不感兴趣
  onPass(e: any) {
    const userId = e.currentTarget.dataset.userid;
    
    // 检测是否为测试服务
    const isTestService = API_BASE_URL.includes('httpbin.org') || 
                          API_BASE_URL.includes('jsonplaceholder.typicode.com') ||
                          API_BASE_URL.includes('api.example.com');
    
    if (isTestService) {
      // 测试环境：模拟跳过操作
      wx.showToast({
        title: '已跳过',
        icon: 'success'
      });
      return;
    }
    
    wx.request({
      url: getApiUrl(API_PATHS.MATCH_LIKE),
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        targetUserId: userId,
        action: 'pass'
      },
      success: () => {
        wx.showToast({
          title: '已跳过',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    });
  },

  // 图片加载错误处理
  onImageError(e: any) {
    const userId = e.currentTarget.dataset.userid;
    console.error(`用户 ${userId} 的头像加载失败:`, e.detail);
    
    // 更新该用户的头像为空，让CSS显示默认占位符
    const candidates = this.data.candidates.map((c: any) => {
      if (c.userId === userId) {
        return { ...c, avatar: '' };
      }
      return c;
    });
    
    // 更新swiperPages中的数据
    const swiperPages = this.data.swiperPages.map((page: any[]) => {
      return page.map((c: any) => {
        if (c.userId === userId) {
          return { ...c, avatar: '' };
        }
        return c;
      });
    });
    
    this.setData({
      candidates,
      swiperPages
    });
  }
});

