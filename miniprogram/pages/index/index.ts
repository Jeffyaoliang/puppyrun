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
      
      // 在真实微信登录中，这里应该获取openid作为唯一标识
      // 开发模式下，可以使用固定的测试ID或时间戳ID来模拟不同账号
      // 为了测试多账号功能，使用时间戳生成不同的userId（每次登录都是新账号）
      // 如果之前保存过账号，会在保存的账号列表中查找匹配
      const newUserId = 'dev_user_' + Date.now();
      
      // 检查是否有保存的账号信息（遍历所有保存的账号，支持切换）
      const savedAccounts = wx.getStorageSync('savedAccounts') || {};
      
      // 在实际微信登录中，应该通过openid来匹配账号
      // 这里模拟：如果有保存的账号，可以选择恢复最近的一个（用于测试）
      // 或者通过其他方式确定要登录的账号
      
      // 为了支持"每次登录不同账号"，这里每次生成新userId
      // 如果用户想恢复之前的账号，需要在实际项目中提供账号选择界面
      // 或者通过微信openid自动匹配
      
      // 检查是否有该账号的保存信息（虽然每次都是新ID，但在真实场景中openid是固定的）
      const savedAccount = savedAccounts[newUserId];
      
      if (savedAccount) {
        // 恢复保存的账号信息
        console.log('恢复账号信息:', newUserId);
        wx.setStorageSync('token', savedAccount.token);
        wx.setStorageSync('userId', savedAccount.userId);
        wx.setStorageSync('userInfo', savedAccount.userInfo);
        wx.setStorageSync('userRole', savedAccount.userRole);
        wx.setStorageSync('authStatus', savedAccount.authStatus);
        wx.setStorageSync('memberLevel', savedAccount.memberLevel);
        wx.setStorageSync('memberExpiresAt', savedAccount.memberExpiresAt);
        wx.setStorageSync('questionnaireCompleted', savedAccount.questionnaireCompleted);
        
        // 恢复所有角色的问卷草稿
        if (savedAccount.questionnaireDrafts) {
          const drafts = savedAccount.questionnaireDrafts;
          const userId = savedAccount.userId;
          
          // 恢复男生问卷（如果存在）
          if (drafts['male_student']) {
            wx.setStorageSync(`questionnaire_draft_${userId}_male_student`, drafts['male_student']);
            console.log('已恢复男生问卷草稿');
          }
          
          // 恢复女生问卷（如果存在）
          if (drafts['female']) {
            wx.setStorageSync(`questionnaire_draft_${userId}_female`, drafts['female']);
            console.log('已恢复女生问卷草稿');
          }
        } else if (savedAccount.questionnaire_draft) {
          // 兼容旧版本：如果只有单个问卷草稿，按当前角色恢复
          const userRole = savedAccount.userRole || 'male_student';
          const userId = savedAccount.userId;
          wx.setStorageSync(`questionnaire_draft_${userId}_${userRole}`, savedAccount.questionnaire_draft);
          console.log('已恢复问卷草稿（兼容旧版本）');
        }
        
        wx.showToast({
          title: '账号恢复成功',
          icon: 'success'
        });
      } else {
        // 新账号，设置默认信息
        const testUserInfo = {
          nickName: '测试用户',
          avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
        };
        
        wx.setStorageSync('token', 'dev_token_' + Date.now());
        wx.setStorageSync('userId', newUserId);
        wx.setStorageSync('userInfo', testUserInfo);
        wx.setStorageSync('authStatus', 'pending');
        // 注意：新账号需要先选择角色，userRole会在认证页面设置
        
        wx.showToast({
          title: '登录成功（开发模式）',
          icon: 'success'
        });
      }
      
      this.setData({
        isLoggedIn: true
      });
      
      // 跳转到认证页面
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/auth/auth'
        });
      }, 1000);
    }, 500);
    
    // 注意：微信登录功能已暂时禁用，当前使用开发模式快速登录
    // 实际微信登录时，应该：
    // 1. 调用 wx.login() 获取 code
    // 2. 调用后端接口 /api/auth/wechat-login，传入 code
    // 3. 后端返回 openid 和 token
    // 4. 使用 openid 作为唯一标识，查找并恢复保存的账号信息
    // 5. 如果找不到，创建新账号
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