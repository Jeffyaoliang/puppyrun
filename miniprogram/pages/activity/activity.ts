// pages/activity/activity.ts
// 活动页面
Page({
  data: {
    activities: [] as any[],
    filterType: 'all', // 'all' | 'weekly' | 'monthly' | 'quarterly'
    loading: false
  },

  onLoad() {
    this.loadActivities();
  },

  onShow() {
    this.loadActivities();
  },

  // 加载活动列表
  loadActivities() {
    this.setData({ loading: true });
    
    // 临时：使用模拟数据（实际项目中应该调用后端API）
    setTimeout(() => {
      this.setData({
        activities: [],
        loading: false
      });
    }, 300);

    // 实际项目中应该调用后端API
    // const url = this.data.filterType === 'all' 
    //   ? 'https://api.example.com/api/activity/list'
    //   : `https://api.example.com/api/activity/list?type=${this.data.filterType}`;
    // 
    // wx.request({
    //   url: url,
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res: any) => {
    //     if (res.data.code === 200) {
    //       this.setData({
    //         activities: res.data.data.activities || [],
    //         loading: false
    //       });
    //     }
    //   },
    //   fail: () => {
    //     this.setData({ loading: false });
    //   }
    // });
  },

  // 筛选活动类型
  filterActivities(e: any) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      filterType: type
    });
    this.loadActivities();
  },

  // 查看活动详情
  viewActivity(e: any) {
    const activityId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/activity-detail?activityId=${activityId}`
    });
  },

  // 报名活动
  enrollActivity(e: any) {
    const activityId = e.currentTarget.dataset.id;
    const activity = this.data.activities.find(a => a.activityId === activityId);
    
    if (!activity) return;
    
    if (activity.status === 'full') {
      wx.showToast({
        title: '活动已满员',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: 'https://api.example.com/api/activity/enroll',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        activityId: activityId
      },
      success: (res: any) => {
        if (res.data.code === 200) {
          if (res.data.data.needPayment) {
            // 需要付费，跳转到支付页面
            wx.navigateTo({
              url: `/pages/payment/payment?type=activity&activityId=${activityId}&orderId=${res.data.data.orderId}`
            });
          } else {
            wx.showToast({
              title: '报名成功',
              icon: 'success'
            });
            this.loadActivities();
          }
        }
      }
    });
  }
});
