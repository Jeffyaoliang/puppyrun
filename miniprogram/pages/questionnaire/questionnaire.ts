// pages/questionnaire/questionnaire.ts
// 问卷填写页面
import { getApiUrl, API_PATHS, isDevMode, API_BASE_URL } from '../../utils/config';

Page({
  data: {
    currentStep: 1, // 当前步骤：1-5
    totalSteps: 5,
    
    // 步骤1: 基础信息
    basicInfo: {
      age: 0,
      education: '',
      city: '',
      height: '',
      weight: ''
    },
    
    // 步骤2: 兴趣偏好
    interests: [] as string[],
    interestOptions: ['运动', '读书', '旅行', '电影', '音乐', '美食', '摄影', '游戏', '艺术', '科技'],
    interestOptionsWithSelected: [] as Array<{name: string, selected: boolean}>,
    
    // 步骤3: 价值观（原步骤4）
    values: {
      consumption: '',
      boundary: '',
      communication: ''
    },
    consumptionOptions: ['5000以下', '5000-10000', '10000以上'],
    boundaryOptions: ['严格边界', '适度边界', '开放边界'],
    communicationOptions: ['直接沟通', '委婉沟通', '灵活沟通'],
    
    // 步骤4: 外貌偏好（原步骤5）
    appearancePref: {
      acceptance: '',
      heightRequirement: ''
    },
    acceptanceOptions: ['顶级颜控', '有点要求', '更看重内在'],
    heightRequirementOptions: ['160以下', '160-170', '170+'],
    
    // 照片
    photos: [] as string[],
    uploadingPhoto: false
  },

  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
      return;
    }
    
    // 检查是否已认证（可选，因为可能从认证页面跳转过来）
    const authStatus = wx.getStorageSync('authStatus');
    if (authStatus !== 'verified') {
      // 如果未认证，提示但不强制跳转（因为可能正在认证流程中）
      console.log('认证状态:', authStatus);
    }
    
    // 加载已保存的问卷数据
    this.loadSavedData();
    
    // 初始化兴趣选项状态
    this.updateInterestOptionsState();
  },
  
  // 更新兴趣选项的选中状态
  updateInterestOptionsState() {
    const interestOptionsWithSelected = this.data.interestOptions.map(opt => ({
      name: opt,
      selected: this.data.interests.indexOf(opt) > -1
    }));
    this.setData({
      interestOptionsWithSelected: interestOptionsWithSelected
    });
  },

  // 加载已保存的数据
  loadSavedData() {
    const savedData = wx.getStorageSync('questionnaire_draft');
    if (savedData) {
      this.setData(savedData);
    }
  },

  // 保存当前数据
  saveData() {
    const dataToSave = {
      currentStep: this.data.currentStep,
      basicInfo: this.data.basicInfo,
      interests: this.data.interests,
      values: this.data.values,
      appearancePref: this.data.appearancePref,
      photos: this.data.photos
    };
    wx.setStorageSync('questionnaire_draft', dataToSave);
  },

  // 下一步
  nextStep() {
    // 验证当前步骤
    if (!this.validateCurrentStep()) {
      return;
    }
    
    if (this.data.currentStep < this.data.totalSteps) {
      this.saveData();
      this.setData({
        currentStep: this.data.currentStep + 1
      });
    } else {
      // 最后一步，提交问卷
      this.submitQuestionnaire();
    }
  },

  // 上一步
  prevStep() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1
      });
    }
  },

  // 步骤1: 基础信息
  onAgeChange(e: any) {
    // e.detail.value 是picker返回的索引值，需要从range数组中获取实际年龄
    const ageRange = [18, 19, 20, 21, 22, 23, 24, 25];
    const selectedIndex = parseInt(e.detail.value);
    const selectedAge = ageRange[selectedIndex];
    
    if (selectedAge !== undefined) {
      this.setData({
        'basicInfo.age': selectedAge
      });
    }
  },

  onEducationChange(e: any) {
    this.setData({
      'basicInfo.education': e.detail.value
    });
  },

  onCityChange(e: any) {
    this.setData({
      'basicInfo.city': e.detail.value
    });
  },

  onHeightChange(e: any) {
    this.setData({
      'basicInfo.height': e.detail.value
    });
    this.saveData();
  },

  onWeightChange(e: any) {
    this.setData({
      'basicInfo.weight': e.detail.value
    });
    this.saveData();
  },


  // 步骤2: 兴趣偏好
  toggleInterest(e: any) {
    const interest = e.currentTarget.dataset.interest;
    if (!interest) {
      console.error('interest数据未传递', e);
      return;
    }
    
    // 创建新数组，避免直接修改data
    const currentInterests = [...this.data.interests];
    const index = currentInterests.indexOf(interest);
    
    if (index > -1) {
      // 已选中，移除
      currentInterests.splice(index, 1);
    } else {
      // 未选中，添加
      currentInterests.push(interest);
    }
    
    // 保存数据
    this.saveData();
    
    this.setData({
      interests: currentInterests
    }, () => {
      // 更新兴趣选项状态
      this.updateInterestOptionsState();
      console.log('当前选中的兴趣:', currentInterests);
      console.log('当前data.interests:', this.data.interests);
    });
  },

  // 步骤3: 价值观（原步骤4）
  onConsumptionChange(e: any) {
    const index = e.detail.value;
    const value = this.data.consumptionOptions[index] || '';
    this.setData({
      'values.consumption': value
    });
    this.saveData();
  },

  onBoundaryChange(e: any) {
    const index = e.detail.value;
    const value = this.data.boundaryOptions[index] || '';
    this.setData({
      'values.boundary': value
    });
    this.saveData();
  },

  onCommunicationChange(e: any) {
    const index = e.detail.value;
    const value = this.data.communicationOptions[index] || '';
    this.setData({
      'values.communication': value
    });
    this.saveData();
  },

  // 步骤5: 外貌偏好
  onAcceptanceChange(e: any) {
    const index = e.detail.value;
    const value = this.data.acceptanceOptions[index] || '';
    this.setData({
      'appearancePref.acceptance': value
    });
    this.saveData();
  },

  onHeightRequirementChange(e: any) {
    const index = e.detail.value;
    const value = this.data.heightRequirementOptions[index] || '';
    this.setData({
      'appearancePref.heightRequirement': value
    });
    this.saveData();
  },

  // 上传照片
  uploadPhoto() {
    if (this.data.uploadingPhoto) return;
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.doUploadPhoto(tempFilePath);
      }
    });
  },

  doUploadPhoto(filePath: string) {
    this.setData({ uploadingPhoto: true });
    
    // 先添加到本地照片列表（使用临时路径）
    const currentPhotos = [...this.data.photos];
    if (currentPhotos.length >= 6) {
      wx.showToast({
        title: '最多只能上传6张照片',
        icon: 'none'
      });
      this.setData({ uploadingPhoto: false });
      return;
    }
    
    // 先使用临时路径显示，然后异步上传
    currentPhotos.push(filePath);
    this.setData({
      photos: currentPhotos,
      uploadingPhoto: false
    });
    this.saveData();
    
    // 异步上传到服务器
    wx.uploadFile({
      url: getApiUrl(API_PATHS.QUESTIONNAIRE_UPLOAD_PHOTO),
      filePath: filePath,
      name: 'photo',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res: any) => {
        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          
          // 检测是否为测试服务（httpbin.org 或 JSONPlaceholder）
          const isTestService = API_BASE_URL.includes('httpbin.org') || 
                                API_BASE_URL.includes('jsonplaceholder.typicode.com');
          
          if (isTestService) {
            // 测试服务：即使返回格式不同，也认为上传成功（照片已在本地显示）
            console.log('测试环境：上传请求已发送（照片已保存在本地）');
            wx.showToast({
              title: '照片已保存（测试环境）',
              icon: 'success',
              duration: 2000
            });
            return;
          }
          
          // 正常后端服务
          if (data.code === 200 && data.data && data.data.url) {
            // 更新对应位置的URL
            const updatedPhotos = [...this.data.photos];
            const index = updatedPhotos.indexOf(filePath);
            if (index > -1) {
              updatedPhotos[index] = data.data.url;
              this.setData({ photos: updatedPhotos });
              this.saveData();
            }
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            });
          } else {
            console.error('上传响应错误:', data);
            wx.showToast({
              title: data.message || '上传失败',
              icon: 'none'
            });
          }
        } catch (error) {
          console.error('解析上传响应失败:', error);
          // 测试服务：即使解析失败，照片也已保存在本地
          const isTestService = API_BASE_URL.includes('httpbin.org') || 
                                API_BASE_URL.includes('jsonplaceholder.typicode.com');
          if (isTestService) {
            wx.showToast({
              title: '照片已保存（测试环境）',
              icon: 'success',
              duration: 2000
            });
          } else {
            wx.showToast({
              title: '上传失败',
              icon: 'none'
            });
          }
        }
      },
      fail: (error: any) => {
        console.error('上传失败:', error);
        // 上传失败时，照片已使用临时路径添加到列表中，用户可以正常看到
        // 检测是否为开发环境的示例 API 地址
        const isExampleApi = API_BASE_URL.includes('api.example.com');
        const errorMsg = isDevMode && isExampleApi
          ? '开发环境：照片已保存（需配置后端 API）'
          : '上传失败，照片已保存在本地';
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 删除照片
  deletePhoto(e: any) {
    const index = e.currentTarget.dataset.index;
    if (index < 0 || index >= this.data.photos.length) {
      return;
    }
    
    // 创建新数组，避免直接修改data
    const currentPhotos = [...this.data.photos];
    currentPhotos.splice(index, 1);
    
    this.setData({
      photos: currentPhotos
    });
    this.saveData();
  },

  // 验证当前步骤
  validateCurrentStep(): boolean {
    const step = this.data.currentStep;
    
    if (step === 1) {
      // 验证基础信息
      if (!this.data.basicInfo.age || !this.data.basicInfo.city || !this.data.basicInfo.height || !this.data.basicInfo.weight) {
        wx.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return false;
      }
    } else if (step === 2) {
      // 验证兴趣偏好
      if (this.data.interests.length === 0) {
        wx.showToast({
          title: '请至少选择一个兴趣',
          icon: 'none'
        });
        return false;
      }
    } else if (step === 3) {
      // 验证恋爱观倾向（原步骤4）
      if (!this.data.values.consumption || !this.data.values.boundary || !this.data.values.communication) {
        wx.showToast({
          title: '请完成所有恋爱观选择',
          icon: 'none'
        });
        return false;
      }
    } else if (step === 4) {
      // 验证外貌偏好（原步骤5）
      if (!this.data.appearancePref.acceptance || !this.data.appearancePref.heightRequirement) {
        wx.showToast({
          title: '请完成外貌偏好选择',
          icon: 'none'
        });
        return false;
      }
    } else if (step === 5) {
      // 验证照片（原步骤6）
      if (this.data.photos.length === 0) {
        wx.showToast({
          title: '请至少上传一张照片',
          icon: 'none'
        });
        return false;
      }
    }
    
    return true;
  },

  // 提交问卷
  submitQuestionnaire() {
    if (!this.validateCurrentStep()) {
      return;
    }

    wx.showLoading({
      title: '提交中...'
    });

    wx.request({
      url: getApiUrl(API_PATHS.QUESTIONNAIRE_SUBMIT),
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        basicInfo: this.data.basicInfo,
        interests: this.data.interests,
        values: this.data.values,
        appearancePref: this.data.appearancePref,
        photos: this.data.photos
      },
      success: (res: any) => {
        wx.hideLoading();
        
        // 检测是否为测试服务
        const isTestService = API_BASE_URL.includes('httpbin.org') || 
                              API_BASE_URL.includes('jsonplaceholder.typicode.com');
        
        if (isTestService) {
          // 测试服务：即使接口不存在，也模拟提交成功（数据已保存在本地）
          console.log('测试环境：问卷数据已保存在本地存储');
          
          // 清除草稿（模拟提交成功）
          wx.removeStorageSync('questionnaire_draft');
          
          wx.showModal({
            title: '提交成功（测试环境）',
            content: '问卷数据已保存在本地。实际环境需要配置真实的后端 API。',
            showCancel: false,
            success: () => {
              // 跳转到匹配页面
              wx.redirectTo({
                url: '/pages/match/match'
              });
            }
          });
          return;
        }
        
        // 正常后端服务
        if (res.data && res.data.code === 200) {
          // 清除草稿
          wx.removeStorageSync('questionnaire_draft');
          
          wx.showToast({
            title: '提交成功',
            icon: 'success'
          });
          
          // 跳转到匹配页面
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/match/match'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.data?.message || '提交失败',
            icon: 'none'
          });
        }
      },
      fail: (error: any) => {
        wx.hideLoading();
        console.error('提交失败:', error);
        // 检测是否为开发环境的示例 API 地址
        const isExampleApi = API_BASE_URL.includes('api.example.com');
        const errorMsg = isDevMode && isExampleApi
          ? '开发环境：需配置实际的后端 API 地址'
          : '网络错误，请稍后重试';
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        });
      }
    });
  }
});
