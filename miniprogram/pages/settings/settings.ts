// pages/settings/settings.ts
// 设置页面
import { getApiUrl, API_PATHS } from '../../utils/config';

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
      url: getApiUrl(API_PATHS.USER_EXPORT_DATA),
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

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后可以切换其他账号登录，当前账号的信息将被保存',
      confirmText: '确定退出',
      confirmColor: '#667eea',
      success: (res) => {
        if (res.confirm) {
          // 获取当前用户ID和角色
          const userId = wx.getStorageSync('userId');
          const userRole = wx.getStorageSync('userRole');
          
          if (userId) {
            // 保存所有角色的问卷草稿
            const questionnaireDrafts: any = {};
            if (userRole) {
              // 保存当前角色的问卷草稿
              const currentKey = `questionnaire_draft_${userId}_${userRole}`;
              const currentDraft = wx.getStorageSync(currentKey);
              if (currentDraft) {
                questionnaireDrafts[userRole] = currentDraft;
              }
            }
            
            // 也尝试保存其他可能存在的角色问卷（如果用户切换过角色）
            const maleKey = `questionnaire_draft_${userId}_male_student`;
            const femaleKey = `questionnaire_draft_${userId}_female`;
            const maleDraft = wx.getStorageSync(maleKey);
            const femaleDraft = wx.getStorageSync(femaleKey);
            
            if (maleDraft && !questionnaireDrafts['male_student']) {
              questionnaireDrafts['male_student'] = maleDraft;
            }
            if (femaleDraft && !questionnaireDrafts['female']) {
              questionnaireDrafts['female'] = femaleDraft;
            }
            
            // 保存当前账号的所有信息
            const accountData = {
              userId: userId,
              token: wx.getStorageSync('token'),
              userInfo: wx.getStorageSync('userInfo'),
              userRole: userRole,
              authStatus: wx.getStorageSync('authStatus'),
              memberLevel: wx.getStorageSync('memberLevel'),
              memberExpiresAt: wx.getStorageSync('memberExpiresAt'),
              questionnaireCompleted: wx.getStorageSync('questionnaireCompleted'),
              questionnaireDrafts: questionnaireDrafts, // 保存所有角色的问卷草稿
              savedAt: new Date().toISOString()
            };
            
            // 以userId为key保存账号信息
            const savedAccounts = wx.getStorageSync('savedAccounts') || {};
            savedAccounts[userId] = accountData;
            wx.setStorageSync('savedAccounts', savedAccounts);
            
            console.log('账号信息已保存:', userId, accountData);
          }
          
          // 清除当前登录状态（但不清除问卷草稿，因为已经保存到账号信息中）
          wx.removeStorageSync('token');
          wx.removeStorageSync('userId');
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('userRole');
          wx.removeStorageSync('authStatus');
          wx.removeStorageSync('memberLevel');
          wx.removeStorageSync('memberExpiresAt');
          wx.removeStorageSync('questionnaireCompleted');
          
          // 清除当前用户的所有问卷草稿（因为已经保存到账号信息中）
          if (userId) {
            wx.removeStorageSync(`questionnaire_draft_${userId}_male_student`);
            wx.removeStorageSync(`questionnaire_draft_${userId}_female`);
          }
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          
          // 跳转到登录页
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index'
            });
          }, 1500);
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
