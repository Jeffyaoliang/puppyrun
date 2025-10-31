// pages/chat/chat.ts
// 聊天页面
Page({
  data: {
    matchId: '',
    targetUser: {} as any,
    messages: [] as any[],
    inputValue: '',
    contactUnlocked: false,
    sending: false
  },

  onLoad(options: any) {
    const matchId = options.matchId;
    if (!matchId) {
      wx.navigateBack();
      return;
    }

    this.setData({ matchId });
    this.loadChatInfo();
    this.loadMessages();
  },

  // 加载聊天信息
  loadChatInfo() {
    wx.request({
      url: `https://api.example.com/api/match/matches`,
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res: any) => {
        if (res.data.code === 200) {
          const match = res.data.data.matches.find((m: any) => m.matchId === this.data.matchId);
          if (match) {
            this.setData({
              targetUser: match.targetUser,
              contactUnlocked: match.contactUnlocked
            });
          }
        }
      }
    });
  },

  // 加载消息列表
  loadMessages() {
    wx.request({
      url: `https://api.example.com/api/chat/messages/${this.data.matchId}`,
      data: {
        page: 1,
        limit: 50
      },
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res: any) => {
        if (res.data.code === 200) {
          this.setData({
            messages: res.data.data.messages.reverse()
          });
          this.scrollToBottom();
        }
      }
    });
  },

  // 输入内容
  onInput(e: any) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 发送消息
  sendMessage() {
    const content = this.data.inputValue.trim();
    if (!content || this.data.sending) return;

    // 实时内容审核
    wx.request({
      url: 'https://api.example.com/api/chat/audit',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        content: content
      },
      success: (auditRes: any) => {
        if (auditRes.data.code === 200 && auditRes.data.data.status === 'passed') {
          this.doSendMessage(content);
        } else {
          wx.showModal({
            title: '消息被拦截',
            content: auditRes.data.data.reason || '内容包含敏感信息',
            showCancel: false
          });
        }
      }
    });
  },

  // 执行发送
  doSendMessage(content: string) {
    this.setData({ sending: true, inputValue: '' });

    wx.request({
      url: 'https://api.example.com/api/chat/send',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        matchId: this.data.matchId,
        content: content,
        type: 'text'
      },
      success: (res: any) => {
        if (res.data.code === 200) {
          // 添加到消息列表
          const newMessage = {
            messageId: res.data.data.messageId,
            senderId: wx.getStorageSync('userId'),
            content: content,
            type: 'text',
            sentAt: new Date().toISOString(),
            auditStatus: 'passed'
          };
          this.setData({
            messages: [...this.data.messages, newMessage],
            sending: false
          });
          this.scrollToBottom();
        } else {
          wx.showToast({
            title: res.data.message || '发送失败',
            icon: 'none'
          });
          this.setData({ sending: false });
        }
      },
      fail: () => {
        this.setData({ sending: false });
        wx.showToast({
          title: '发送失败',
          icon: 'none'
        });
      }
    });
  },

  // 滚动到底部
  scrollToBottom() {
    setTimeout(() => {
      wx.createSelectorQuery()
        .select('.messages-container')
        .boundingClientRect((rect: any) => {
          if (rect) {
            wx.pageScrollTo({
              scrollTop: rect.height,
              duration: 300
            });
          }
        })
        .exec();
    }, 100);
  },

  // 解锁联系方式
  unlockContact() {
    wx.navigateTo({
      url: `/pages/payment/payment?matchId=${this.data.matchId}&type=unlock`
    });
  },

  // 举报用户
  reportUser() {
    wx.showModal({
      title: '举报用户',
      content: '确定要举报该用户吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: 'https://api.example.com/api/chat/report',
            method: 'POST',
            header: {
              'Authorization': `Bearer ${wx.getStorageSync('token')}`,
              'Content-Type': 'application/json'
            },
            data: {
              matchId: this.data.matchId,
              targetUserId: this.data.targetUser.userId,
              reason: '其他'
            },
            success: () => {
              wx.showToast({
                title: '举报成功',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  }
});
