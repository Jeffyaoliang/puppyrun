// pages/auth/auth.ts
// 用户认证页面
Page({
  data: {
    step: 1, // 当前步骤：1-选择角色，2-上传证件，3-人脸识别，4-完成
    userRole: '', // 'male_student' | 'female'
    authStatus: 'pending', // 'pending' | 'verified' | 'rejected'
    studentCardImage: '',
    idCardImage: '',
    faceImage: '',
    assetProofImage: '',
    uploading: false,
    errorMessage: ''
  },

  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('token');
    if (!token) {
      // 如果没有token，模拟登录（实际项目中应该跳转到登录页）
      // 临时设置一个token用于测试
      wx.setStorageSync('token', 'test_token_' + Date.now());
    }
    
    // 检查本地存储的认证状态
    const authStatus = wx.getStorageSync('authStatus');
    if (authStatus === 'verified') {
      // 已认证，直接跳转到问卷页面
      wx.redirectTo({
        url: '/pages/questionnaire/questionnaire'
      });
      return;
    } else if (authStatus === 'rejected') {
      this.setData({
        step: 2,
        errorMessage: '认证未通过，请重新上传'
      });
    }
    
    // 实际项目中应该调用后端API检查认证状态
    // this.checkAuthStatus();
  },

  // 检查认证状态（实际项目中应该调用后端API）
  checkAuthStatus() {
    wx.request({
      url: 'https://api.example.com/api/user/info',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res: any) => {
        if (res.data.code === 200) {
          const authStatus = res.data.data.authStatus;
          if (authStatus === 'verified') {
            // 保存到本地
            wx.setStorageSync('authStatus', 'verified');
            // 已认证，跳转到问卷页面
            wx.redirectTo({
              url: '/pages/questionnaire/questionnaire'
            });
          } else if (authStatus === 'rejected') {
            wx.setStorageSync('authStatus', 'rejected');
            this.setData({
              step: 2,
              errorMessage: '认证未通过，请重新上传'
            });
          }
        }
      },
      fail: () => {
        // API调用失败，不影响页面正常显示
        console.log('检查认证状态失败，使用本地状态');
      }
    });
  },

  // 选择角色
  selectRole(e: any) {
    const role = e.currentTarget.dataset.role;
    this.setData({
      userRole: role,
      step: 2
    });
  },

  // 上传学生证（男生）
  uploadStudentCard() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.uploadImage(tempFilePath, 'studentCard');
      }
    });
  },

  // 上传身份证（女生和男生）
  uploadIdCard() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.uploadImage(tempFilePath, 'idCard');
      }
    });
  },

  // 上传资产证明（女生可选）
  uploadAssetProof() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.uploadImage(tempFilePath, 'assetProof');
      }
    });
  },

  // 上传图片
  uploadImage(filePath: string, type: string) {
    this.setData({ uploading: true });
    
    // 先显示预览（使用本地路径）
    this.setData({
      [`${type}Image`]: filePath
    });

    // 如果后端API不可用，先使用本地路径（实际项目中应该上传到服务器）
    // 这里先保存本地路径，后续在人脸识别时一起上传
    wx.showToast({
      title: '图片已选择',
      icon: 'success',
      duration: 1500
    });
    
    this.setData({ uploading: false });

    // 实际项目中应该调用后端API上传
    // wx.uploadFile({
    //   url: 'https://api.example.com/api/auth/upload',
    //   filePath: filePath,
    //   name: 'image',
    //   formData: {
    //     type: type
    //   },
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res: any) => {
    //     try {
    //       const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    //       if (data.code === 200) {
    //         const imageUrl = data.data.url;
    //         this.setData({
    //           [`${type}Image`]: imageUrl,
    //           uploading: false
    //         });
    //         wx.showToast({
    //           title: '上传成功',
    //           icon: 'success'
    //         });
    //       } else {
    //         wx.showToast({
    //           title: data.message || '上传失败',
    //           icon: 'none',
    //           duration: 2000
    //         });
    //         this.setData({ uploading: false });
    //         // 清除预览
    //         this.setData({
    //           [`${type}Image`]: ''
    //         });
    //       }
    //     } catch (e) {
    //       console.error('解析响应失败:', e);
    //       wx.showToast({
    //         title: '服务器响应异常',
    //         icon: 'none'
    //       });
    //       this.setData({ uploading: false });
    //       this.setData({
    //         [`${type}Image`]: ''
    //       });
    //     }
    //   },
    //   fail: (err) => {
    //     console.error('上传失败:', err);
    //     wx.showToast({
    //       title: err.errMsg || '上传失败，请检查网络',
    //       icon: 'none',
    //       duration: 2000
    //     });
    //     this.setData({ uploading: false });
    //     // 清除预览
    //     this.setData({
    //       [`${type}Image`]: ''
    //     });
    //   }
    // });
  },

  // 开始人脸识别
  startFaceRecognition() {
    if (this.data.userRole === 'male_student' && !this.data.studentCardImage) {
      wx.showToast({
        title: '请先上传学生证',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.userRole === 'female' && !this.data.idCardImage) {
      wx.showToast({
        title: '请先上传身份证',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '认证中...',
      mask: true
    });

    // 实际项目中应该先上传图片到服务器，再调用认证API
    // 这里先模拟认证流程
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟认证成功（实际应该调用后端API）
      // 实际代码应该是：
      // wx.request({
      //   url: 'https://api.example.com/api/auth/face-recognition',
      //   method: 'POST',
      //   header: {
      //     'Authorization': `Bearer ${wx.getStorageSync('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   data: {
      //     role: this.data.userRole,
      //     studentCard: this.data.studentCardImage,
      //     idCard: this.data.idCardImage,
      //     assetProof: this.data.assetProofImage || null
      //   },
      //   success: (res: any) => {
      //     wx.hideLoading();
      //     if (res.data.code === 200) {
      //       if (res.data.data.status === 'approved') {
      //         this.setData({
      //           step: 4,
      //           authStatus: 'verified'
      //         });
      //         setTimeout(() => {
      //           wx.redirectTo({
      //             url: '/pages/questionnaire/questionnaire'
      //           });
      //         }, 3000);
      //       } else {
      //         this.setData({
      //           authStatus: 'rejected',
      //           errorMessage: res.data.data.rejectReason || '认证失败'
      //         });
      //       }
      //     }
      //   },
      //   fail: (err) => {
      //     wx.hideLoading();
      //     wx.showToast({
      //       title: '认证失败，请重试',
      //       icon: 'none'
      //     });
      //   }
      // });

      // 临时：模拟认证成功
      this.setData({
        step: 4,
        authStatus: 'verified'
      });
      
      // 保存认证状态到本地存储
      wx.setStorageSync('authStatus', 'verified');
      wx.setStorageSync('userRole', this.data.userRole);
      
      wx.showToast({
        title: '认证成功',
        icon: 'success',
        duration: 2000
      });
      
      // 2秒后跳转到问卷页面
      setTimeout(() => {
        wx.hideToast();
        wx.navigateTo({
          url: '/pages/questionnaire/questionnaire',
          success: () => {
            console.log('跳转成功');
          },
          fail: (err) => {
            console.error('跳转失败:', err);
            wx.showToast({
              title: '跳转失败，请重试',
              icon: 'none'
            });
          }
        });
      }, 2000);
    }, 2000);
  },

  // 提交认证
  submitAuth() {
    if (this.data.userRole === 'male_student') {
      if (!this.data.studentCardImage) {
        wx.showToast({
          title: '请上传学生证',
          icon: 'none'
        });
        return;
      }
    } else {
      if (!this.data.idCardImage) {
        wx.showToast({
          title: '请上传身份证',
          icon: 'none'
        });
        return;
      }
    }

    this.startFaceRecognition();
  }
});
