# 图片上传功能修复说明

## 问题描述

之前上传照片后返回的URL无法访问，出现404错误：
```
Failed to load image https://api.puppyrun.site/uploads/e019d684fd2169f2a8f2004ac498157a
the server responded with a status of 404 (HTTP/1.1 404)
```

## 修复内容

### 1. 添加静态文件服务

在后端添加了Express静态文件中间件，使 `/uploads` 目录下的文件可以通过HTTP访问：

```javascript
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    // 设置正确的Content-Type和缓存头
  }
}));
```

### 2. 改进文件上传配置

- 保留原始文件名和扩展名
- 添加文件类型验证（只允许图片）
- 生成唯一文件名避免冲突

### 3. 智能URL生成

根据请求来源自动生成正确的URL：
- 本地开发：`http://localhost:3000/uploads/xxx`
- Cloudflare Tunnel：`https://api.puppyrun.site/uploads/xxx`

### 4. 信任代理配置

添加了 `trust proxy` 配置，确保正确读取Cloudflare Tunnel的请求头。

## 测试方法

### 1. 重启后端服务

```bash
cd backend
npm start
```

### 2. 测试图片上传

在小程序中：
1. 进入问卷页面
2. 上传一张照片
3. 检查是否能正常显示

### 3. 直接访问测试

如果上传的文件名是 `test-1234567890.jpg`，可以通过以下URL访问：

**本地开发：**
```
http://localhost:3000/uploads/test-1234567890.jpg
```

**生产环境（通过Cloudflare Tunnel）：**
```
https://api.puppyrun.site/uploads/test-1234567890.jpg
```

### 4. 使用curl测试

```bash
# 测试静态文件服务
curl -I http://localhost:3000/uploads/文件名

# 应该返回200状态码和正确的Content-Type
```

## 注意事项

1. **文件存储位置**：上传的文件保存在 `backend/uploads/` 目录
2. **文件大小限制**：最大10MB
3. **支持格式**：jpeg, jpg, png, gif, webp
4. **生产环境建议**：实际生产环境应该将文件上传到云存储（如OSS、COS、S3等），而不是本地存储

## 后续优化建议

1. **云存储集成**：将文件上传到云存储服务
2. **图片压缩**：上传前压缩图片以减少存储空间
3. **CDN加速**：使用CDN加速图片访问
4. **权限控制**：添加文件访问权限验证

