// pages/settings/settings.ts
// 设置页面
Page({
  data: {
    userInfo: {} as any,
    memberLevel: 'normal',
    memberExpiresAt: ''
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    // 如果后端API不可用，使用本地存储的数据
    const localUserInfo = wx.getStorageSync('userInfo');
    if (localUserInfo) {
      this.setData({
        userInfo: localUserInfo,
        memberLevel: wx.getStorageSync('memberLevel') || 'normal',
        memberExpiresAt: wx.getStorageSync('memberExpiresAt') || ''
      });
    }

    // 实际项目中应该调用后端API
    // wx.request({
    //   url: 'https://api.example.com/api/user/info',
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res: any) => {
    //     if (res.data.code === 200) {
    //       this.setData({
    //         userInfo: res.data.data,
    //         memberLevel: res.data.data.memberLevel || 'normal',
    //         memberExpiresAt: res.data.data.memberExpiresAt || ''
    //       });
    //     }
    //   },
    //   fail: () => {
    //     // API调用失败，使用本地数据
    //   }
    // });
  },

  // 查看匹配列表
  viewMatches() {
    wx.switchTab({
      url: '/pages/message-list/message-list'
    });
  },

  // 导出数据
  exportData() {
    wx.request({
      url: 'https://api.example.com/api/user/export-data',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res: any) => {
        if (res.data.code === 200) {
          wx.showModal({
            title: '导出成功',
            content: `数据下载链接：${res.data.data.downloadUrl}`,
            showCancel: false
          });
        }
      }
    });
  },

  // 注销账号
  deleteAccount() {
    wx.showModal({
      title: '注销账号',
      content: '注销后，您的所有数据将在72小时内被永久删除，且无法恢复。确定要注销吗？',
      confirmText: '确定注销',
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: 'https://api.example.com/api/user/delete-account',
            method: 'POST',
            header: {
              'Authorization': `Bearer ${wx.getStorageSync('token')}`,
              'Content-Type': 'application/json'
            },
            data: {
              reason: '用户主动注销'
            },
            success: () => {
              wx.showToast({
                title: '注销成功',
                icon: 'success'
              });
              // 清除本地数据
              wx.clearStorageSync();
              // 跳转到登录页
              setTimeout(() => {
                wx.reLaunch({
                  url: '/pages/index/index'
                });
              }, 1500);
            }
          });
        }
      }
    });
  },

  // 联系客服
  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服微信：service@example.com',
      showCancel: false
    });
  }
});
