# 奶狗快跑 - API接口定义文档

## 1. 用户认证与注册

### 1.1 微信登录
```
POST /api/auth/wechat-login
Request:
{
  "code": "微信授权code",
  "encryptedData": "加密数据",
  "iv": "初始向量"
}
Response:
{
  "code": 200,
  "data": {
    "token": "JWT token",
    "userId": "用户ID",
    "isNewUser": true,
    "authStatus": "pending|verified|rejected"
  }
}
```

### 1.2 手机号绑定
```
POST /api/auth/bind-phone
Headers: Authorization: Bearer {token}
Request:
{
  "phone": "手机号",
  "code": "验证码"
}
Response:
{
  "code": 200,
  "data": {
    "success": true
  }
}
```

### 1.3 身份认证 - 学生证上传（男生）
```
POST /api/auth/student-verify
Headers: Authorization: Bearer {token}
Request: FormData
{
  "studentCard": File,
  "faceImage": File
}
Response:
{
  "code": 200,
  "data": {
    "verifyId": "认证ID",
    "status": "pending|approved|rejected",
    "rejectReason": "拒绝原因（可选）"
  }
}
```

### 1.4 身份认证 - 身份证上传（女生）
```
POST /api/auth/idcard-verify
Headers: Authorization: Bearer {token}
Request: FormData
{
  "idCard": File,
  "faceImage": File,
  "assetProof": File (可选)
}
Response:
{
  "code": 200,
  "data": {
    "verifyId": "认证ID",
    "status": "pending|approved|rejected",
    "ageVerified": true,
    "assetFlag": true (如果上传了资产证明)
  }
}
```

## 2. 问卷与画像

### 2.1 提交问卷
```
POST /api/questionnaire/submit
Headers: Authorization: Bearer {token}
Request:
{
  "basicInfo": {
    "age": 22,
    "education": "本科",
    "city": "北京",
    "schedule": "晚上活跃"
  },
  "interests": ["运动", "读书", "旅行"],
  "socialNeeds": ["陪伴聊天", "线下活动"],
  "values": {
    "consumption": "理性消费",
    "boundary": "适度边界",
    "communication": "直接沟通"
  },
  "appearancePref": {
    "style": "休闲",
    "acceptance": "中等偏上"
  }
}
Response:
{
  "code": 200,
  "data": {
    "questionnaireId": "问卷ID",
    "profileGenerated": true
  }
}
```

### 2.2 上传生活照
```
POST /api/questionnaire/upload-photo
Headers: Authorization: Bearer {token}
Request: FormData
{
  "photo": File,
  "isPrimary": true
}
Response:
{
  "code": 200,
  "data": {
    "photoId": "照片ID",
    "url": "图片URL",
    "qualityScore": 8.5,
    "aiScores": {
      "气质匹配度": 7.5,
      "风格契合度": 8.0,
      "整体协调度": 7.8
    }
  }
}
```

### 2.3 获取用户画像
```
GET /api/questionnaire/profile
Headers: Authorization: Bearer {token}
Response:
{
  "code": 200,
  "data": {
    "profile": {
      "basicInfo": {...},
      "interests": [...],
      "tags": ["标签1", "标签2"],
      "matchVector": [0.1, 0.2, ...] // 向量化特征
    }
  }
}
```

## 3. 匹配与双向选择

### 3.1 获取匹配候选人列表
```
GET /api/match/candidates?page=1&limit=10&city=北京&ageMin=18&ageMax=25
Headers: Authorization: Bearer {token}
Response:
{
  "code": 200,
  "data": {
    "candidates": [
      {
        "userId": "用户ID",
        "avatar": "头像URL",
        "age": 22,
        "city": "北京",
        "schedule": "晚上活跃",
        "interests": ["运动", "读书"],
        "tags": ["标签1", "标签2"],
        "matchScore": 85,
        "mutualInterests": 3
      }
    ],
    "total": 100,
    "hasMore": true
  }
}
```

### 3.2 查看候选人详情
```
GET /api/match/candidate/{userId}
Headers: Authorization: Bearer {token}
Response:
{
  "code": 200,
  "data": {
    "userId": "用户ID",
    "basicInfo": {...},
    "interests": [...],
    "socialNeeds": [...],
    "values": {...},
    "photos": ["URL1", "URL2"],
    "matchScore": 85,
    "matchReasons": ["共同兴趣：运动", "价值观相似"]
  }
}
```

### 3.3 表达喜欢/不感兴趣
```
POST /api/match/like
Headers: Authorization: Bearer {token}
Request:
{
  "targetUserId": "目标用户ID",
  "action": "like|pass",
  "reason": "不感兴趣原因（pass时可选）"
}
Response:
{
  "code": 200,
  "data": {
    "success": true,
    "isMutual": false, // 是否双向匹配
    "matchId": "匹配ID（如果双向）"
  }
}
```

### 3.4 获取匹配成功列表
```
GET /api/match/matches
Headers: Authorization: Bearer {token}
Response:
{
  "code": 200,
  "data": {
    "matches": [
      {
        "matchId": "匹配ID",
        "targetUser": {
          "userId": "用户ID",
          "nickname": "昵称",
          "avatar": "头像"
        },
        "matchedAt": "2024-01-01T10:00:00Z",
        "contactUnlocked": false
      }
    ]
  }
}
```

## 4. 聊天与风控

### 4.1 发送消息
```
POST /api/chat/send
Headers: Authorization: Bearer {token}
Request:
{
  "matchId": "匹配ID",
  "content": "消息内容",
  "type": "text|image"
}
Response:
{
  "code": 200,
  "data": {
    "messageId": "消息ID",
    "sentAt": "2024-01-01T10:00:00Z",
    "auditStatus": "passed|blocked|pending"
  }
}
```

### 4.2 获取聊天记录
```
GET /api/chat/messages/{matchId}?page=1&limit=50
Headers: Authorization: Bearer {token}
Response:
{
  "code": 200,
  "data": {
    "messages": [
      {
        "messageId": "消息ID",
        "senderId": "发送者ID",
        "content": "消息内容",
        "type": "text|image",
        "sentAt": "2024-01-01T10:00:00Z",
        "auditStatus": "passed"
      }
    ],
    "hasMore": false
  }
}
```

### 4.3 举报用户
```
POST /api/chat/report
Headers: Authorization: Bearer {token}
Request:
{
  "matchId": "匹配ID",
  "targetUserId": "被举报用户ID",
  "reason": "举报原因",
  "evidence": ["证据图片URL"]
}
Response:
{
  "code": 200,
  "data": {
    "reportId": "举报ID",
    "status": "submitted"
  }
}
```

### 4.4 拉黑用户
```
POST /api/chat/block
Headers: Authorization: Bearer {token}
Request:
{
  "targetUserId": "目标用户ID"
}
Response:
{
  "code": 200,
  "data": {
    "success": true
  }
}
```

## 5. 支付解锁

### 5.1 创建解锁订单
```
POST /api/payment/create-unlock-order
Headers: Authorization: Bearer {token}
Request:
{
  "matchId": "匹配ID",
  "type": "single|monthly|yearly"
}
Response:
{
  "code": 200,
  "data": {
    "orderId": "订单ID",
    "amount": 99,
    "paymentParams": {
      "timeStamp": "时间戳",
      "nonceStr": "随机字符串",
      "package": "prepay_id=xxx",
      "signType": "RSA",
      "paySign": "签名"
    }
  }
}
```

### 5.2 支付回调（微信）
```
POST /api/payment/wechat-callback
Request: 微信支付回调数据
Response:
{
  "code": 200,
  "data": {
    "success": true
  }
}
```

### 5.3 查询订单状态
```
GET /api/payment/order/{orderId}
Headers: Authorization: Bearer {token}
Response:
{
  "code": 200,
  "data": {
    "orderId": "订单ID",
    "status": "pending|paid|failed|refunded",
    "amount": 99,
    "paidAt": "2024-01-01T10:00:00Z"
  }
}
```

### 5.4 发起联系方式共享请求
```
POST /api/payment/request-contact-share
Headers: Authorization: Bearer {token}
Request:
{
  "matchId": "匹配ID",
  "orderId": "订单ID"
}
Response:
{
  "code": 200,
  "data": {
    "requestId": "请求ID",
    "status": "pending"
  }
}
```

### 5.5 确认/拒绝联系方式共享
```
POST /api/payment/respond-contact-share
Headers: Authorization: Bearer {token}
Request:
{
  "requestId": "请求ID",
  "action": "accept|reject"
}
Response:
{
  "code": 200,
  "data": {
    "success": true,
    "contactInfo": {
      "wechat": "微信号（如果接受）"
    }
  }
}
```

## 6. 活动运营

### 6.1 获取活动列表
```
GET /api/activity/list?type=weekly|monthly|quarterly&page=1&limit=10
Headers: Authorization: Bearer {token}
Response:
{
  "code": 200,
  "data": {
    "activities": [
      {
        "activityId": "活动ID",
        "title": "活动标题",
        "type": "weekly|monthly|quarterly",
        "startTime": "2024-01-01T10:00:00Z",
        "location": "活动地点",
        "fee": 50,
        "memberFree": true,
        "enrolledCount": 5,
        "maxCount": 15,
        "status": "open|full|ended"
      }
    ]
  }
}
```

### 6.2 报名活动
```
POST /api/activity/enroll
Headers: Authorization: Bearer {token}
Request:
{
  "activityId": "活动ID"
}
Response:
{
  "code": 200,
  "data": {
    "enrollmentId": "报名ID",
    "needPayment": true,
    "orderId": "订单ID（如果需要付费）"
  }
}
```

### 6.3 活动签到
```
POST /api/activity/checkin
Headers: Authorization: Bearer {token}
Request:
{
  "activityId": "活动ID",
  "code": "签到码"
}
Response:
{
  "code": 200,
  "data": {
    "success": true
  }
}
```

### 6.4 提交活动反馈
```
POST /api/activity/feedback
Headers: Authorization: Bearer {token}
Request:
{
  "activityId": "活动ID",
  "rating": 5,
  "comment": "反馈内容"
}
Response:
{
  "code": 200,
  "data": {
    "success": true,
    "reward": "优先匹配权"
  }
}
```

## 7. 用户设置与隐私

### 7.1 获取用户信息
```
GET /api/user/info
Headers: Authorization: Bearer {token}
Response:
{
  "code": 200,
  "data": {
    "userId": "用户ID",
    "nickname": "昵称",
    "avatar": "头像",
    "role": "male_student|female",
    "authStatus": "verified",
    "memberLevel": "普通|白银|黄金",
    "memberExpiresAt": "2024-12-31T23:59:59Z"
  }
}
```

### 7.2 更新用户信息
```
PUT /api/user/info
Headers: Authorization: Bearer {token}
Request:
{
  "nickname": "新昵称",
  "avatar": "新头像URL"
}
Response:
{
  "code": 200,
  "data": {
    "success": true
  }
}
```

### 7.3 导出个人数据
```
GET /api/user/export-data
Headers: Authorization: Bearer {token}
Response:
{
  "code": 200,
  "data": {
    "downloadUrl": "数据下载链接",
    "expiresAt": "2024-01-08T10:00:00Z"
  }
}
```

### 7.4 注销账号
```
POST /api/user/delete-account
Headers: Authorization: Bearer {token}
Request:
{
  "reason": "注销原因",
  "password": "确认密码"
}
Response:
{
  "code": 200,
  "data": {
    "success": true,
    "deleteScheduledAt": "2024-01-04T10:00:00Z"
  }
}
```

## 8. 通用响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {...}
}
```

### 错误响应
```json
{
  "code": 400|401|403|404|500,
  "message": "错误描述",
  "data": null,
  "errorCode": "ERROR_CODE"
}
```

### 错误码定义
- `AUTH_REQUIRED`: 需要登录
- `AUTH_FAILED`: 认证失败
- `PERMISSION_DENIED`: 权限不足
- `RESOURCE_NOT_FOUND`: 资源不存在
- `VALIDATION_ERROR`: 参数验证失败
- `PAYMENT_FAILED`: 支付失败
- `CONTENT_BLOCKED`: 内容被拦截
- `RATE_LIMIT`: 请求频率限制
