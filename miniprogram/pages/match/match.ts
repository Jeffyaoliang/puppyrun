// pages/match/match.ts
// 匹配列表页面
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

    // 临时：使用模拟数据（实际项目中应该调用后端API）
    const mockCandidates = [
      { userId: '1', nickname: '用户1', age: 22, city: '北京', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', matchScore: 85, interests: ['运动', '读书', '旅行'], assetLevel: '已认证' },
      { userId: '2', nickname: '用户2', age: 23, city: '上海', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', matchScore: 82, interests: ['电影', '音乐'], assetLevel: '' },
      { userId: '3', nickname: '用户3', age: 21, city: '广州', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', matchScore: 80, interests: ['摄影', '游戏', '艺术'], assetLevel: '已认证' },
      { userId: '4', nickname: '用户4', age: 24, city: '深圳', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', matchScore: 78, interests: ['科技', '读书'], assetLevel: '' },
      { userId: '5', nickname: '用户5', age: 22, city: '杭州', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', matchScore: 75, interests: ['运动', '电影'], assetLevel: '已认证' },
      { userId: '6', nickname: '用户6', age: 23, city: '成都', avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0', matchScore: 72, interests: ['音乐', '摄影'], assetLevel: '' }
    ];

    // 只显示匹配度高于70%的
    const filteredCandidates = mockCandidates.filter(item => item.matchScore >= 70);

    // 将候选人分组，每页4个
    const swiperPages: any[][] = [];
    for (let i = 0; i < filteredCandidates.length; i += 4) {
      swiperPages.push(filteredCandidates.slice(i, i + 4));
    }

    setTimeout(() => {
      this.setData({
        candidates: filteredCandidates,
        swiperPages: swiperPages,
        loading: false
      });
    }, 500);

    // 实际项目中应该调用后端API
    // wx.request({
    //   url: 'https://api.example.com/api/match/candidates',
    //   data: {
    //     page: 1,
    //     limit: 10,
    //     minMatchScore: 70
    //   },
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res: any) => {
    //     if (res.data.code === 200) {
    //       const candidates = (res.data.data.candidates || []).filter((item: any) => item.matchScore >= 70);
    //       const swiperPages: any[][] = [];
    //       for (let i = 0; i < candidates.length; i += 4) {
    //         swiperPages.push(candidates.slice(i, i + 4));
    //       }
    //       this.setData({
    //         candidates: candidates,
    //         swiperPages: swiperPages,
    //         loading: false
    //       });
    //     }
    //   },
    //   fail: () => {
    //     this.setData({ loading: false });
    //   }
    // });
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
  }
});