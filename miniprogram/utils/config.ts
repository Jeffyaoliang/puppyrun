// API 配置文件
// ============================================
// 配置说明：
// 1. 格式要求：必须是完整的 HTTPS URL，例如：'https://your-api-domain.com'
// 2. 不要包含路径：只配置域名，不要包含 /api 等路径
// 3. 开发环境：可以使用本地代理或测试服务器地址
// 4. 生产环境：必须在微信小程序后台配置合法域名
// ============================================

// 开发环境 API 地址
// ============================================
// 临时测试方案（免费国外API服务）：
// 1. JSONPlaceholder - REST API测试服务（推荐用于测试基本请求）
//    'https://jsonplaceholder.typicode.com'
//
// 2. httpbin.org - HTTP请求测试服务（推荐用于测试上传）
//    'https://httpbin.org'
//
// 3. MockAPI.io - 可自定义的Mock API（需要注册）
//    'https://your-project-id.mockapi.io'
//
// 4. Postman Mock Server - 需要Postman账号
//    'https://your-project-id.mock.pstmn.io'
//
// 注意：这些是临时测试方案，实际开发需要自己的后端服务器
// ============================================

// ============================================
// ⚠️ 配置真实后端 API 地址
// ============================================
// 当前使用的是测试服务（仅用于开发测试，不支持实际功能）
// 要使用真实后端，请按以下步骤配置：
//
// 步骤1：将下面的地址改为你的后端 API 地址
// 例如：export const API_BASE_URL = 'https://api.yourdomain.com';
//
// 步骤2：确保后端地址支持 HTTPS（微信小程序强制要求）
//
// 步骤3：在微信小程序后台配置合法域名（生产环境必须）
//   路径：开发 -> 开发管理 -> 开发设置 -> 服务器域名
//   添加你的域名到「request合法域名」
//
// 步骤4：开发环境可在微信开发者工具中勾选「不校验合法域名」
//   路径：详情 -> 项目设置 -> 不校验合法域名...
// ============================================

// 当前配置（测试服务 - 不支持实际功能）
export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

// ⬇️ 取消注释并修改为你的真实后端地址 ⬇️
// export const API_BASE_URL = 'https://api.yourdomain.com';

// 如果需要测试文件上传，可以使用：
// export const API_BASE_URL = 'https://httpbin.org';

// 如果需要区分开发/生产环境，可以这样配置：
// const isDev = true; // 开发环境
// export const API_BASE_URL = isDev 
//   ? 'https://dev-api.yourdomain.com'  // 开发环境地址
//   : 'https://api.yourdomain.com';      // 生产环境地址

// 或者使用环境变量（如果项目支持）
// export const API_BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';

// API 接口路径
export const API_PATHS = {
  // 问卷相关
  QUESTIONNAIRE_SUBMIT: '/api/questionnaire/submit',
  QUESTIONNAIRE_UPLOAD_PHOTO: '/api/questionnaire/upload-photo',
  
  // 认证相关
  WECHAT_LOGIN: '/api/auth/wechat-login',
  BIND_PHONE: '/api/auth/bind-phone',
  STUDENT_VERIFY: '/api/auth/student-verify',
  IDCARD_VERIFY: '/api/auth/idcard-verify',
  
  // 匹配相关
  MATCH_CANDIDATES: '/api/match/candidates',
  MATCH_LIKE: '/api/match/like',
  MATCH_CANDIDATE_DETAIL: '/api/match/candidate',
  
  // 支付相关
  PAYMENT_CREATE_ORDER: '/api/payment/create-unlock-order',
  PAYMENT_ORDER_STATUS: '/api/payment/order',
  PAYMENT_REQUEST_CONTACT: '/api/payment/request-contact-share',
  
  // 聊天相关
  CHAT_AUDIT: '/api/chat/audit',
  CHAT_SEND: '/api/chat/send',
  CHAT_MESSAGES: '/api/chat/messages',
  CHAT_REPORT: '/api/chat/report',
  MATCH_MATCHES: '/api/match/matches',
  
  // 用户相关
  USER_INFO: '/api/user/info',
  USER_EXPORT_DATA: '/api/user/export-data',
  USER_DELETE_ACCOUNT: '/api/user/delete-account',
  
  // 活动相关
  ACTIVITY_LIST: '/api/activity/list',
  ACTIVITY_ENROLL: '/api/activity/enroll',
};

// 获取完整的 API URL
export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

// 开发模式检查
export const isDevMode = true; // 设置为 false 在生产环境

