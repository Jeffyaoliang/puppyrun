// pages/profile/profile.ts
// 个人主页（查看对方资料）
import { getApiUrl, API_PATHS, API_BASE_URL } from '../../utils/config';

Page({
  data: {
    userId: '',
    userInfo: {} as any,
    matchScore: 0,
    matchReasons: [] as string[]
  },

  onLoad(options: any) {
    const userId = options.userId;
    if (!userId) {
      wx.navigateBack();
      return;
    }

    this.setData({ userId });
    this.loadUserProfile();
  },

  // 加载用户资料
  loadUserProfile() {
    // 检测是否为测试服务
    const isTestService = API_BASE_URL.includes('httpbin.org') || 
                          API_BASE_URL.includes('jsonplaceholder.typicode.com') ||
                          API_BASE_URL.includes('api.example.com');
    
    if (isTestService) {
      // 测试环境：使用模拟数据
      console.log('测试环境：使用模拟用户数据');
      this.setData({
        userInfo: {
          nickname: '测试用户',
          age: 22,
          city: '北京',
          avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
          interests: ['运动', '读书', '旅行'],
          socialNeeds: ['陪伴聊天', '线下活动']
        },
        matchScore: 85,
        matchReasons: ['共同兴趣：运动', '价值观相似']
      });
      return;
    }
    
    wx.request({
      url: `${getApiUrl(API_PATHS.MATCH_CANDIDATE_DETAIL)}/${this.data.userId}`,
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res: any) => {
        if (res.data && res.data.code === 200) {
          this.setData({
            userInfo: res.data.data,
            matchScore: res.data.data.matchScore,
            matchReasons: res.data.data.matchReasons || []
          });
        }
      },
      fail: (error: any) => {
        console.error('加载用户资料失败:', error);
      }
    });
  },

  // 喜欢
  onLike() {
    // 检测是否为测试服务
    const isTestService = API_BASE_URL.includes('httpbin.org') || 
                          API_BASE_URL.includes('jsonplaceholder.typicode.com') ||
                          API_BASE_URL.includes('api.example.com');
    
    if (isTestService) {
      // 测试环境：使用模拟响应
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
        targetUserId: this.data.userId,
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

  // 举报
  onReport() {
    wx.showModal({
      title: '举报用户',
      content: '确定要举报该用户吗？',
      success: (res) => {
        if (res.confirm) {
          // 检测是否为测试服务
          const isTestService = API_BASE_URL.includes('httpbin.org') || 
                                API_BASE_URL.includes('jsonplaceholder.typicode.com') ||
                                API_BASE_URL.includes('api.example.com');
          
          if (isTestService) {
            // 测试环境：使用模拟响应
            console.log('测试环境：模拟举报操作');
            setTimeout(() => {
              wx.showToast({
                title: '举报成功',
                icon: 'success'
              });
            }, 300);
            return;
          }

          wx.request({
            url: getApiUrl(API_PATHS.CHAT_REPORT),
            method: 'POST',
            header: {
              'Authorization': `Bearer ${wx.getStorageSync('token')}`,
              'Content-Type': 'application/json'
            },
            data: {
              targetUserId: this.data.userId,
              reason: '其他'
            },
            success: (res: any) => {
              if (res.data && res.data.code === 200) {
                wx.showToast({
                  title: '举报成功',
                  icon: 'success'
                });
              } else {
                wx.showToast({
                  title: res.data?.message || '举报失败',
                  icon: 'none'
                });
              }
            },
            fail: (error: any) => {
              console.error('举报操作失败:', error);
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  }
});
