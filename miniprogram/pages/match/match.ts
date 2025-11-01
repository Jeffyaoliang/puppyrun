// pages/match/match.ts
// 匹配列表页面
import { getApiUrl, API_PATHS } from '../../utils/config';

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

  // 加载候选人列表
  loadCandidates() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });

    // 获取当前用户ID
    const currentUserId = wx.getStorageSync('userId') || wx.getStorageSync('uid');
    
    // 调用后端API获取匹配候选人
    wx.request({
      url: getApiUrl(API_PATHS.MATCH_CANDIDATES),
      data: {
        currentUserId: currentUserId,
        page: 1,
        limit: 20,
        minScore: 70
      },
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
              assetLevel: item.authStatus === 'verified' ? '已认证' : ''
            };
            // 调试日志：打印头像URL
            console.log(`候选人 ${candidate.userId} (${candidate.nickname}): 头像URL = ${candidate.avatar}`);
            return candidate;
          });
          
          // 只显示匹配度高于70%的
          const filteredCandidates = candidates.filter((item: any) => item.matchScore >= 70);

          // 将候选人分组，每页4个
          const swiperPages: any[][] = [];
          for (let i = 0; i < filteredCandidates.length; i += 4) {
            swiperPages.push(filteredCandidates.slice(i, i + 4));
          }

          this.setData({
            candidates: filteredCandidates,
            swiperPages: swiperPages,
            loading: false
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

    wx.request({
      url: 'https://api.example.com/api/match/like',
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
        if (res.data.code === 200) {
          if (res.data.data.isMutual) {
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
        }
      }
    });
  },

  // 不感兴趣
  onPass(e: any) {
    const userId = e.currentTarget.dataset.userid;
    
    wx.request({
      url: 'https://api.example.com/api/match/like',
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