// pages/message-list/message-list.ts
// 消息列表页面
Page({
  data: {
    matches: [] as any[],
    loading: false
  },

  onLoad() {
    this.loadMatches();
  },

  onShow() {
    this.loadMatches();
  },

  // 加载匹配列表
  loadMatches() {
    this.setData({ loading: true });

    // 临时：使用模拟数据（实际项目中应该调用后端API）
    setTimeout(() => {
      this.setData({
        matches: [],
        loading: false
      });
    }, 300);

    // 实际项目中应该调用后端API
    // wx.request({
    //   url: 'https://api.example.com/api/match/matches',
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res: any) => {
    //     if (res.data.code === 200) {
    //       const matches = (res.data.data.matches || []).map((match: any) => {
    //         return {
    //           ...match,
    //           matchedAt: this.formatTime(match.matchedAt)
    //         };
    //       });
    //       this.setData({
    //         matches: matches,
    //         loading: false
    //       });
    //     }
    //   },
    //   fail: () => {
    //     this.setData({ loading: false });
    //   }
    // });
  },

  // 格式化时间
  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
      }
      return `${hours}小时前`;
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日`;
    }
  },

  // 进入聊天
  enterChat(e: any) {
    const matchId = e.currentTarget.dataset.matchid;
    wx.navigateTo({
      url: `/pages/chat/chat?matchId=${matchId}`
    });
  }
});
