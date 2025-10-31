// pages/payment/payment.ts
// 支付解锁页面
Page({
  data: {
    matchId: '',
    paymentType: 'single', // 'single' | 'monthly' | 'yearly'
    packages: [
      {
        type: 'single',
        name: '单次解锁',
        price: 99,
        desc: '解锁1个联系人'
      },
      {
        type: 'monthly',
        name: '月度会员',
        price: 299,
        desc: '3次免费解锁 + 优先匹配 + 活动折扣',
        originalPrice: 297
      },
      {
        type: 'yearly',
        name: '年度会员',
        price: 2599,
        desc: '30次免费解锁 + 专属客服 + 活动优先参与',
        originalPrice: 2970
      }
    ],
    selectedPackage: {} as any,
    platformFee: 0,
    paying: false
  },

  onLoad(options: any) {
    const matchId = options.matchId;
    const type = options.type || 'single';
    
    const selectedPkg = this.data.packages.find(p => p.type === type) || this.data.packages[0];
    const platformFee = parseFloat((selectedPkg.price * 0.3).toFixed(2));
    
    this.setData({
      matchId,
      paymentType: type,
      selectedPackage: selectedPkg,
      platformFee: platformFee
    });
  },

  // 选择套餐
  selectPackage(e: any) {
    const type = e.currentTarget.dataset.type;
    const pkg = this.data.packages.find(p => p.type === type);
    if (pkg) {
      const platformFee = parseFloat((pkg.price * 0.3).toFixed(2));
      this.setData({ 
        selectedPackage: pkg,
        platformFee: platformFee
      });
    }
  },

  // 创建订单并支付
  createOrder() {
    if (this.data.paying) return;

    this.setData({ paying: true });

    wx.request({
      url: 'https://api.example.com/api/payment/create-unlock-order',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        matchId: this.data.matchId,
        type: this.data.selectedPackage.type
      },
      success: (res: any) => {
        if (res.data.code === 200) {
          const paymentParams = res.data.data.paymentParams;
          this.requestPayment(paymentParams, res.data.data.orderId);
        } else {
          wx.showToast({
            title: res.data.message || '创建订单失败',
            icon: 'none'
          });
          this.setData({ paying: false });
        }
      },
      fail: () => {
        this.setData({ paying: false });
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 发起微信支付
  requestPayment(paymentParams: any, orderId: string) {
    wx.requestPayment({
      timeStamp: paymentParams.timeStamp,
      nonceStr: paymentParams.nonceStr,
      package: paymentParams.package,
      signType: paymentParams.signType,
      paySign: paymentParams.paySign,
      success: () => {
        // 支付成功，等待回调
        this.checkOrderStatus(orderId);
      },
      fail: (err) => {
        this.setData({ paying: false });
        if (err.errMsg !== 'requestPayment:fail cancel') {
          wx.showToast({
            title: '支付失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 检查订单状态
  checkOrderStatus(orderId: string) {
    const checkInterval = setInterval(() => {
      wx.request({
        url: `https://api.example.com/api/payment/order/${orderId}`,
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        },
        success: (res: any) => {
          if (res.data.code === 200) {
            const status = res.data.data.status;
            if (status === 'paid') {
              clearInterval(checkInterval);
              this.setData({ paying: false });
              
              // 发起联系方式共享请求
              this.requestContactShare(orderId);
            } else if (status === 'failed') {
              clearInterval(checkInterval);
              this.setData({ paying: false });
              wx.showToast({
                title: '支付失败',
                icon: 'none'
              });
            }
          }
        }
      });
    }, 2000);

    // 30秒后停止检查
    setTimeout(() => {
      clearInterval(checkInterval);
      this.setData({ paying: false });
    }, 30000);
  },

  // 请求联系方式共享
  requestContactShare(orderId: string) {
    wx.request({
      url: 'https://api.example.com/api/payment/request-contact-share',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        matchId: this.data.matchId,
        orderId: orderId
      },
      success: (res: any) => {
        if (res.data.code === 200) {
          wx.showModal({
            title: '支付成功',
            content: '已向对方发起联系方式共享请求，等待对方确认',
            showCancel: false,
            success: () => {
              wx.navigateBack();
            }
          });
        }
      }
    });
  }
});
