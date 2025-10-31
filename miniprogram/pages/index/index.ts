// index.ts
// 首页 - 欢迎页面
// 注意：当前使用开发模式快速登录，跳过微信授权流程，便于测试其他功能

Page({
  data: {
    isLoggedIn: false
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const authStatus = wx.getStorageSync('authStatus');
    
    if (token && authStatus === 'verified') {
      this.setData({
        isLoggedIn: true
      });
    } else {
      this.setData({
        isLoggedIn: false
      });
    }
  },

  // 微信登录（开发模式：快速登录，跳过微信授权）
  wechatLogin() {
    // 开发模式：直接模拟登录，跳过微信授权流程
    wx.showLoading({
      title: '登录中...'
    });

    // 模拟登录成功
    setTimeout(() => {
      wx.hideLoading();
      
      // 设置测试用户信息
      const testUserInfo = {
        nickName: '测试用户',
        avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
      };
      
      wx.setStorageSync('token', 'dev_token_' + Date.now());
      wx.setStorageSync('userId', 'dev_user_' + Date.now());
      wx.setStorageSync('userInfo', testUserInfo);
      wx.setStorageSync('authStatus', 'pending');
      
      this.setData({
        isLoggedIn: true
      });
      
      wx.showToast({
        title: '登录成功（开发模式）',
        icon: 'success'
      });
      
      // 跳转到认证页面
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/auth/auth'
        });
      }, 1000);
    }, 500);
    
    // 注意：微信登录功能已暂时禁用，当前使用开发模式快速登录
    // 后续需要接入微信登录时，可以在 utils/config.ts 中配置后端API地址
  },

  // 开始匹配（已登录用户）
  startMatch() {
    // 检查是否已完成认证
    const authStatus = wx.getStorageSync('authStatus');
    if (authStatus !== 'verified') {
      wx.redirectTo({
        url: '/pages/auth/auth'
      });
      return;
    }

    // 检查是否已完成问卷
    const questionnaireCompleted = wx.getStorageSync('questionnaireCompleted');
    if (!questionnaireCompleted) {
      wx.redirectTo({
        url: '/pages/questionnaire/questionnaire'
      });
      return;
    }

    // 跳转到推荐页面（可以创建一个专门的推荐页面）
    // 或者直接显示推荐列表
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  }
});