// pages/questionnaire/questionnaire.ts
// 问卷填写页面
import { getApiUrl, API_PATHS, isDevMode, API_BASE_URL } from '../../utils/config';

Page({
  data: {
    currentStep: 1, // 当前步骤：1-5
    totalSteps: 5,
    userId: '', // 用户ID
    userRole: '', // 用户角色 'male_student' | 'female'
    
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
    consumptionOptions: ['5000以下', '5000-10000', '10000以上'], // 男生默认
    consumptionLabel: '消费水平', // 男生默认
    boundaryOptions: ['严格边界', '适度边界', '开放边界'],
    boundaryLabel: '社交边界', // 男生默认
    communicationOptions: ['直接沟通', '委婉沟通', '灵活沟通'],
    
    // 步骤4: 外貌偏好（原步骤5）
    appearancePref: {
      acceptance: '',
      heightRequirement: ''
    },
    acceptanceOptions: ['顶级颜控', '有点要求', '更看重内在'],
    acceptanceLabel: '你属于', // 男生默认
    heightRequirementOptions: ['160以下', '160-170', '170+'], // 男生默认选项
    ageOptions: [18, 19, 20, 21, 22, 23, 24, 25], // 男生默认年龄选项
    
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
    
    // 获取用户ID和角色
    const userId = wx.getStorageSync('userId') || '';
    const userRole = wx.getStorageSync('userRole') || '';
    
    if (!userId || !userRole) {
      wx.showModal({
        title: '提示',
        content: '用户信息不完整，请重新登录',
        showCancel: false,
        success: () => {
          wx.reLaunch({
            url: '/pages/index/index'
          });
        }
      });
      return;
    }
    
    // 根据角色设置不同的选项
    let ageOptions: number[] = [];
    let heightRequirementOptions: string[] = [];
    let consumptionOptions: string[] = [];
    let consumptionLabel: string = '';
    let boundaryLabel: string = '';
    let acceptanceLabel: string = '';
    
    if (userRole === 'female') {
      // 女生：年龄18-38，身高要求：1米7以下，1米7~1米85，1米85以上
      ageOptions = Array.from({ length: 21 }, (_, i) => 18 + i); // 18-38
      heightRequirementOptions = ['1米7以下', '1米7~1米85', '1米85以上'];
      consumptionOptions = ['短期伴侣', '长期soul mate', '命定姻缘'];
      consumptionLabel = '你期待的关系性质';
      boundaryLabel = '异性社交边界';
      acceptanceLabel = '颜值要求';
    } else {
      // 男生：年龄18-25，身高要求：160以下，160-170，170+
      ageOptions = [18, 19, 20, 21, 22, 23, 24, 25];
      heightRequirementOptions = ['160以下', '160-170', '170+'];
      consumptionOptions = ['短期伴侣', '长期soul mate', '命定姻缘'];
      consumptionLabel = '你期待的关系性质';
      boundaryLabel = '异性社交边界';
      acceptanceLabel = '颜值要求';
    }
    
    // 保存到data中
    this.setData({
      userId: userId,
      userRole: userRole,
      ageOptions: ageOptions,
      heightRequirementOptions: heightRequirementOptions,
      consumptionOptions: consumptionOptions,
      consumptionLabel: consumptionLabel,
      boundaryLabel: boundaryLabel,
      acceptanceLabel: acceptanceLabel
    });
    
    // 检查是否已认证（可选，因为可能从认证页面跳转过来）
    const authStatus = wx.getStorageSync('authStatus');
    if (authStatus !== 'verified') {
      // 如果未认证，提示但不强制跳转（因为可能正在认证流程中）
      console.log('认证状态:', authStatus);
    }
    
    // 加载已保存的问卷数据（按用户ID和角色）
    this.loadSavedData();
    
    // 确保选项正确设置（加载数据后可能覆盖，需要重新设置）
    this.setData({
      ageOptions: ageOptions,
      heightRequirementOptions: heightRequirementOptions,
      consumptionOptions: consumptionOptions,
      consumptionLabel: consumptionLabel,
      boundaryLabel: boundaryLabel,
      acceptanceLabel: acceptanceLabel
    });
    
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

  // 获取问卷存储key（按用户ID和角色）
  getQuestionnaireKey(): string {
    const userId = this.data.userId || wx.getStorageSync('userId') || '';
    const userRole = this.data.userRole || wx.getStorageSync('userRole') || '';
    if (!userId || !userRole) {
      console.error('无法获取用户ID或角色');
      return 'questionnaire_draft'; // 降级到旧key
    }
    return `questionnaire_draft_${userId}_${userRole}`;
  },

  // 加载已保存的数据（按用户ID和角色）
  loadSavedData() {
    const key = this.getQuestionnaireKey();
    const savedData = wx.getStorageSync(key);
    if (savedData) {
      console.log('加载问卷数据:', key, savedData);
      this.setData(savedData);
    } else {
      console.log('未找到保存的问卷数据:', key);
    }
  },

  // 保存当前数据（按用户ID和角色）
  saveData() {
    const userId = this.data.userId || wx.getStorageSync('userId') || '';
    const userRole = this.data.userRole || wx.getStorageSync('userRole') || '';
    
    if (!userId || !userRole) {
      console.error('无法保存问卷数据：用户ID或角色缺失');
      return;
    }
    
    const key = this.getQuestionnaireKey();
    const dataToSave = {
      currentStep: this.data.currentStep,
      basicInfo: this.data.basicInfo,
      interests: this.data.interests,
      values: this.data.values,
      appearancePref: this.data.appearancePref,
      photos: this.data.photos,
      userId: userId,
      userRole: userRole
    };
    wx.setStorageSync(key, dataToSave);
    console.log('保存问卷数据:', key, dataToSave);
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
    const ageOptions = this.data.ageOptions || [18, 19, 20, 21, 22, 23, 24, 25];
    const selectedIndex = parseInt(e.detail.value);
    const selectedAge = ageOptions[selectedIndex];
    
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
            // 更新对应位置的URL - 查找临时路径并替换
            const updatedPhotos = [...this.data.photos];
            const serverUrl = data.data.url;
            
            // 查找临时路径（http://tmp/ 或 wxfile:// 开头）
            const tempPathIndex = updatedPhotos.findIndex((photo: string) => 
              photo === filePath || 
              photo.startsWith('http://tmp/') || 
              photo.startsWith('wxfile://')
            );
            
            if (tempPathIndex > -1) {
              const oldUrl = updatedPhotos[tempPathIndex];
              updatedPhotos[tempPathIndex] = serverUrl;
              console.log('照片URL已更新:', {
                index: tempPathIndex,
                oldUrl: oldUrl,
                newUrl: serverUrl,
                urlLength: serverUrl.length,
                urlValid: serverUrl.startsWith('http://') || serverUrl.startsWith('https://')
              });
            } else {
              // 如果找不到，尝试添加到最后
              console.warn('未找到临时路径，添加到数组末尾');
              // 移除临时路径，添加服务器URL
              const filteredPhotos = updatedPhotos.filter((photo: string) => 
                photo !== filePath && 
                !photo.startsWith('http://tmp/') && 
                !photo.startsWith('wxfile://')
              );
              filteredPhotos.push(serverUrl);
              updatedPhotos.length = 0;
              updatedPhotos.push(...filteredPhotos);
            }
            
            this.setData({ photos: updatedPhotos });
            this.saveData();
            
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
        
        // 检查是否是域名校验错误
        const errMsg = error.errMsg || '';
        const isDomainError = errMsg.includes('合法域名') || 
                             errMsg.includes('domain') ||
                             errMsg.includes('not in domain list');
        const isTimeout = errMsg.includes('timeout');
        
        // 检测是否为开发环境
        const isDevApi = API_BASE_URL.includes('api.example.com') || 
                        API_BASE_URL.includes('api.puppyrun.site') ||
                        API_BASE_URL.includes('httpbin.org') ||
                        API_BASE_URL.includes('jsonplaceholder.typicode.com');
        
        if (isDomainError) {
          wx.showModal({
            title: '域名配置错误',
            content: '请在微信开发者工具中勾选"不校验合法域名"，或在微信小程序后台配置 uploadFile 合法域名。详见：docs/微信小程序域名配置说明.md',
            showCancel: false
          });
        } else if (isTimeout) {
          // 上传超时：在开发环境中允许继续使用临时路径
          if (isDevMode && isDevApi) {
            wx.showToast({
              title: '上传超时，照片已保存在本地（开发环境）',
              icon: 'none',
              duration: 3000
            });
            // 在开发环境中，即使上传失败也保留临时路径，允许提交
            console.log('开发环境：上传超时，保留临时路径照片，允许提交');
          } else {
            wx.showModal({
              title: '上传超时',
              content: '照片上传超时，请检查网络后重试上传',
              showCancel: true,
              confirmText: '重试',
              cancelText: '取消',
              success: (res) => {
                if (res.confirm) {
                  // 移除临时路径，允许用户重新上传
                  const updatedPhotos = this.data.photos.filter((photo: string) => 
                    photo !== filePath
                  );
                  this.setData({ photos: updatedPhotos });
                  this.saveData();
                  // 提示用户重新选择照片
                  wx.showToast({
                    title: '请重新选择照片',
                    icon: 'none'
                  });
                }
              }
            });
          }
        } else {
          // 其他上传失败：在开发环境中允许继续使用临时路径
          if (isDevMode && isDevApi) {
            wx.showToast({
              title: '上传失败，照片已保存在本地（开发环境）',
              icon: 'none',
              duration: 3000
            });
            console.log('开发环境：上传失败，保留临时路径照片，允许提交');
          } else {
            wx.showToast({
              title: '上传失败，照片已保存在本地',
              icon: 'none',
              duration: 2000
            });
          }
        }
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

    // 检测是否为开发环境
    const isDevApi = API_BASE_URL.includes('api.example.com') || 
                    API_BASE_URL.includes('api.puppyrun.site') ||
                    API_BASE_URL.includes('httpbin.org') ||
                    API_BASE_URL.includes('jsonplaceholder.typicode.com');
    
    // 检查是否有照片还在上传中（临时路径）
    const tempPhotos = this.data.photos.filter((photo: string) => 
      photo.startsWith('http://tmp/') || 
      photo.startsWith('wxfile://') ||
      photo.startsWith('file://')
    );
    
    // 在开发环境中，允许临时路径的照片提交
    if (tempPhotos.length > 0 && !(isDevMode && isDevApi)) {
      wx.showModal({
        title: '照片上传中',
        content: `还有 ${tempPhotos.length} 张照片正在上传，请稍候再提交`,
        showCancel: false
      });
      return;
    }
    
    // 在开发环境中，如果有临时路径照片，给出提示但允许提交
    if (tempPhotos.length > 0 && isDevMode && isDevApi) {
      console.log('开发环境：检测到临时路径照片，允许提交');
    }

    // 验证照片URL完整性（开发环境中允许临时路径）
    const invalidPhotos = this.data.photos.filter((photo: string) => {
      // 检查URL是否完整（至少包含协议和域名）
      if (!photo || typeof photo !== 'string') {
        return true; // 无效
      }
      const trimmed = photo.trim();
      
      // 在开发环境中，临时路径也算有效
      if (isDevMode && isDevApi) {
        if (trimmed.startsWith('http://tmp/') || 
            trimmed.startsWith('wxfile://') ||
            trimmed.startsWith('file://')) {
          return false; // 临时路径在开发环境中有效
        }
      }
      
      if (trimmed.length < 20) {
        return true; // URL太短可能不完整
      }
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return true; // 不是有效的HTTP(S) URL
      }
      return false; // 有效
    });
    
    // 在开发环境中，如果有无效照片但数量不多，给出提示但允许提交
    if (invalidPhotos.length > 0) {
      if (isDevMode && isDevApi) {
        console.warn('开发环境：检测到无效照片URL，但允许提交');
        // 在开发环境中，如果只有临时路径照片，允许提交
        const onlyTempPhotos = invalidPhotos.every((photo: string) => 
          photo.startsWith('http://tmp/') || 
          photo.startsWith('wxfile://') ||
          photo.startsWith('file://')
        );
        if (!onlyTempPhotos) {
          wx.showModal({
            title: '照片URL错误（开发环境）',
            content: `有 ${invalidPhotos.length} 张照片的URL无效，但允许提交。生产环境需要有效URL。`,
            showCancel: false
          });
        }
      } else {
        console.error('发现无效的照片URL:', invalidPhotos);
        wx.showModal({
          title: '照片URL错误',
          content: `有 ${invalidPhotos.length} 张照片的URL无效，请重新上传`,
          showCancel: false
        });
        return;
      }
    }
    
    // 记录提交的数据用于调试
    console.log('提交问卷数据:', {
      photos: this.data.photos,
      photosCount: this.data.photos.length,
      photoUrls: this.data.photos.map((p: string, i: number) => ({
        index: i,
        url: p,
        length: p.length,
        isValid: p.startsWith('http://') || p.startsWith('https://')
      }))
    });

    wx.showLoading({
      title: '提交中...'
    });

    // 确保photos数组中的URL都是完整的
    const photosToSubmit = this.data.photos.map((photo: string) => {
      // 确保URL是字符串且完整
      if (typeof photo !== 'string') {
        console.warn('照片URL不是字符串:', photo);
        return String(photo);
      }
      // 移除可能的空白字符
      return photo.trim();
    }).filter((photo: string) => {
      // 过滤掉无效的URL
      return photo && photo.length > 0 && 
             (photo.startsWith('http://') || photo.startsWith('https://'));
    });

    console.log('准备提交的照片URL:', photosToSubmit);
    
    wx.request({
      url: getApiUrl(API_PATHS.QUESTIONNAIRE_SUBMIT),
      method: 'POST',
      timeout: isDevMode && isDevApi ? 30000 : 60000, // 开发环境30秒超时，生产环境60秒（Cloudflare Tunnel可能需要更长时间）
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        basicInfo: this.data.basicInfo,
        interests: this.data.interests,
        values: this.data.values,
        appearancePref: this.data.appearancePref,
        photos: photosToSubmit
      },
      success: (res: any) => {
        wx.hideLoading();
        
        // 检测是否为测试服务
        const isTestService = API_BASE_URL.includes('httpbin.org') || 
                              API_BASE_URL.includes('jsonplaceholder.typicode.com');
        
        // 跳转到匹配页面的通用函数
        const navigateToMatch = () => {
          // 优先使用页面中的 userRole，然后尝试从存储中读取
          const userRole = this.data.userRole || wx.getStorageSync('userRole') || '';
          
          console.log('问卷提交成功，准备跳转:', {
            userRoleFromData: this.data.userRole,
            userRoleFromStorage: wx.getStorageSync('userRole'),
            finalUserRole: userRole
          });
          
          // 确保 userRole 被正确保存到存储中（以防万一）
          if (userRole && userRole !== '') {
            wx.setStorageSync('userRole', userRole);
          }
          
          const matchUrl = userRole === 'female' 
            ? '/pages/match-male/match-male'  // 女生跳转到发现男生页面
            : '/pages/match-female/match-female'; // 男生跳转到发现女生页面
          
          console.log('跳转到匹配页面:', matchUrl, '用户角色:', userRole);
          
          wx.redirectTo({
            url: matchUrl
          });
        };
        
        if (isTestService) {
          // 测试服务：即使接口不存在，也模拟提交成功（数据已保存在本地）
          console.log('测试环境：问卷数据已保存在本地存储');
          
          // 清除当前用户和角色的问卷草稿
          const key = this.getQuestionnaireKey();
          wx.removeStorageSync(key);
          console.log('已清除问卷草稿:', key);
          
          // 直接跳转，显示简短提示
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 1000
          });
          setTimeout(() => {
            navigateToMatch();
          }, 800);
          return;
        }
        
        // 正常后端服务
        if (res.data && res.data.code === 200) {
          // 清除当前用户和角色的问卷草稿
          const key = this.getQuestionnaireKey();
          wx.removeStorageSync(key);
          console.log('已清除问卷草稿:', key);
          
          // 显示成功提示并快速跳转
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 1000
          });
          
          setTimeout(() => {
            navigateToMatch();
          }, 800);
        } else {
          // 后端返回失败，但在开发环境中仍然允许跳转
          if (isDevMode && isDevApi) {
            console.log('开发环境：后端API返回失败，但允许继续跳转');
            const key = this.getQuestionnaireKey();
            wx.removeStorageSync(key);
            
            // 直接跳转，不显示modal
            wx.showToast({
              title: '提交完成，跳转中...',
              icon: 'success',
              duration: 1000
            });
            setTimeout(() => {
              navigateToMatch();
            }, 800);
          } else {
            wx.showToast({
              title: res.data?.message || '提交失败',
              icon: 'none'
            });
          }
        }
      },
      fail: (error: any) => {
        wx.hideLoading();
        console.error('提交失败:', error);
        
        // 在开发环境中，即使API失败也允许跳转
        if (isDevMode && isDevApi) {
          console.log('开发环境：API请求失败，但允许继续跳转');
          const key = this.getQuestionnaireKey();
          wx.removeStorageSync(key);
          
          // 获取用户角色并准备跳转
          const userRole = this.data.userRole || wx.getStorageSync('userRole') || '';
          
          console.log('开发环境：准备跳转:', {
            userRoleFromData: this.data.userRole,
            userRoleFromStorage: wx.getStorageSync('userRole'),
            finalUserRole: userRole
          });
          
          // 确保 userRole 被正确保存到存储中（以防万一）
          if (userRole && userRole !== '') {
            wx.setStorageSync('userRole', userRole);
          }
          
          const matchUrl = userRole === 'female' 
            ? '/pages/match-male/match-male'  // 女生跳转到发现男生页面
            : '/pages/match-female/match-female'; // 男生跳转到发现女生页面
          
          console.log('准备跳转到:', matchUrl, '用户角色:', userRole);
          
          // 直接跳转，显示简短提示
          wx.showToast({
            title: '提交完成，跳转中...',
            icon: 'success',
            duration: 1000
          });
          
          setTimeout(() => {
            console.log('开始执行跳转:', matchUrl);
            wx.redirectTo({
              url: matchUrl,
              success: () => {
                console.log('跳转成功');
              },
              fail: (err: any) => {
                console.error('跳转失败:', err);
                wx.showToast({
                  title: '跳转失败，请手动进入发现页面',
                  icon: 'none',
                  duration: 3000
                });
              }
            });
          }, 800);
        } else {
          // 生产环境：显示错误，不允许跳转
          const errorMsg = '网络错误，请稍后重试';
          wx.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          });
        }
      }
    });
  }
});
