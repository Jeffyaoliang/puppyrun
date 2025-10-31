# Cloudflare Tunnel 详细部署指南

## 📋 概述

Cloudflare Tunnel（原 Argo Tunnel）是 Cloudflare 提供的免费内网穿透服务，**完全免费且提供固定域名**，是替代 ngrok 的最佳选择。

**优势：**
- ✅ 完全免费
- ✅ 固定域名，不会变化
- ✅ 全球 CDN，速度快
- ✅ 自动 HTTPS
- ✅ 无需公网 IP
- ✅ 可以绑定自己的域名

---

## 🚀 完整部署步骤

### 步骤 1：注册 Cloudflare 账号

1. 访问：https://dash.cloudflare.com/sign-up
2. 使用邮箱注册（完全免费）
3. 验证邮箱

### 步骤 2：添加域名到 Cloudflare

#### 选项 A：使用已有域名

如果你已经有域名：
1. 登录 Cloudflare Dashboard
2. 点击 "Add a Site"
3. 输入你的域名（如 `example.com`）
4. 选择免费计划（Free）
5. 按照提示修改域名的 DNS 服务器为 Cloudflare 提供的地址

#### 选项 B：购买便宜域名

如果没有域名，可以购买：
- **.xyz 域名**：约 10-20元/年（最便宜）
- **.top 域名**：约 20-30元/年
- **.site 域名**：约 30-50元/年

推荐购买平台：
- 阿里云：https://wanwang.aliyun.com
- 腾讯云：https://dnspod.cloud.tencent.com
- Namecheap：https://www.namecheap.com

购买后，按照选项 A 的步骤添加到 Cloudflare。

#### 选项 C：使用免费二级域名（不推荐）

可以使用 Freenom 的免费域名（.tk, .ml, .ga 等），但：
- ⚠️ 可能不稳定
- ⚠️ 可能不被微信小程序认可
- ⚠️ 仅适合测试

---

### 步骤 3：安装 Cloudflare Tunnel

#### Windows

1. **下载客户端**
   - 访问：https://github.com/cloudflare/cloudflared/releases
   - 下载 `cloudflared-windows-amd64.exe`
   - 重命名为 `cloudflared.exe`

2. **添加到 PATH**
   - 将 `cloudflared.exe` 放到 `C:\Windows\System32\`
   - 或创建文件夹 `C:\cloudflared\`，添加到 PATH

3. **验证安装**
   ```bash
   cloudflared --version
   ```

#### Mac

```bash
# 使用 Homebrew
brew install cloudflared

# 验证
cloudflared --version
```

#### Linux

```bash
# 下载
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64

# 安装
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared

# 验证
cloudflared --version
```

---

### 步骤 4：登录 Cloudflare

```bash
# 打开浏览器登录
cloudflared tunnel login
```

这会：
1. 打开浏览器
2. 要求你登录 Cloudflare
3. 选择要使用的域名
4. 授权 Tunnel 访问

完成后会在 `~/.cloudflared/` 目录生成证书文件。

---

### 步骤 5：创建隧道

```bash
# 创建隧道（my-backend 是隧道名称，可以自定义）
cloudflared tunnel create my-backend
```

**输出示例：**
```
Created tunnel my-backend with id: abc123def456ghi789jkl012mno345pqr678
```

**步骤 6：配置隧道**

创建配置文件 `~/.cloudflared/config.yml`：

**Windows 路径：** `C:\Users\YourUsername\.cloudflared\config.yml`  
**Mac/Linux 路径：** `~/.cloudflared/config.yml`

**配置文件内容：**

```yaml
tunnel: abc123def456ghi789jkl012mno345pqr678  # 你的隧道 ID
credentials-file: /Users/yourname/.cloudflared/abc123def456ghi789jkl012mno345pqr678.json

ingress:
  # 你的 API 域名
  - hostname: api.yourdomain.com
    service: http://localhost:3000  # 你的后端端口
  
  # 默认规则（必须）
  - service: http_status:404
```

**注意事项：**
- 替换 `tunnel` 为你的隧道 ID
- 替换 `credentials-file` 路径为你的证书文件路径
- 替换 `hostname` 为你的域名
- 替换 `service` 端口为你的后端端口

---

### 步骤 7：创建 DNS 记录

```bash
# 创建 CNAME 记录，将 api.yourdomain.com 指向隧道
cloudflared tunnel route dns my-backend api.yourdomain.com
```

**输出示例：**
```
✓ DNS record created: api.yourdomain.com -> abc123def456ghi789jkl012mno345pqr678.cfargotunnel.com
```

---

### 步骤 8：启动后端服务

确保你的后端服务正在运行：

```bash
# 在你的后端项目目录
npm start
# 应该看到：Server running on http://localhost:3000
```

---

### 步骤 9：启动隧道

```bash
# 启动隧道
cloudflared tunnel run my-backend
```

**输出示例：**
```
2024-01-01T12:00:00Z INF Starting metrics server
2024-01-01T12:00:00Z INF +--------------------------------------------------------------------------------------------+
2024-01-01T12:00:00Z INF |  Your quick Tunnel has been created! Visit it:                                            |
2024-01-01T12:00:00Z INF |  https://api.yourdomain.com                                                               |
2024-01-01T12:00:00Z INF +--------------------------------------------------------------------------------------------+
```

**成功！** 现在你的 API 可以通过 `https://api.yourdomain.com` 访问了。

---

### 步骤 10：配置为系统服务（可选，推荐）

这样隧道会在后台运行，开机自启。

#### Linux

```bash
# 安装为系统服务
sudo cloudflared service install

# 启动服务
sudo systemctl start cloudflared

# 设置开机自启
sudo systemctl enable cloudflared

# 查看状态
sudo systemctl status cloudflared
```

#### Mac

```bash
# 安装为 Launch Agent
sudo cloudflared service install

# 启动服务
sudo launchctl load /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
```

#### Windows

```bash
# 以管理员身份运行 PowerShell
cloudflared service install

# 启动服务
Start-Service cloudflared
```

---

### 步骤 11：配置小程序

打开 `miniprogram/utils/config.ts`：

```typescript
export const API_BASE_URL = 'https://api.yourdomain.com';
```

---

### 步骤 12：测试

1. **浏览器测试**
   ```
   https://api.yourdomain.com/api/test
   ```

2. **小程序测试**
   - 在微信开发者工具中运行
   - 尝试提交问卷
   - 查看是否成功

---

## 🔧 配置多个服务

如果需要多个子域名：

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /path/to/credentials.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:3000
  
  - hostname: admin.yourdomain.com
    service: http://localhost:3001
  
  - service: http_status:404
```

然后为每个域名创建 DNS 记录：

```bash
cloudflared tunnel route dns my-backend api.yourdomain.com
cloudflared tunnel route dns my-backend admin.yourdomain.com
```

---

## 🛠️ 常用命令

```bash
# 列出所有隧道
cloudflared tunnel list

# 查看隧道信息
cloudflared tunnel info my-backend

# 删除隧道
cloudflared tunnel delete my-backend

# 查看日志
cloudflared tunnel run my-backend --loglevel debug

# 更新 DNS 记录
cloudflared tunnel route dns my-backend api.yourdomain.com
```

---

## ⚠️ 常见问题

### Q1: 连接失败？

**检查清单：**
- ✅ 后端服务是否在运行？
- ✅ 端口是否正确（config.yml 中的端口）？
- ✅ DNS 记录是否已创建？
- ✅ 隧道是否在运行？

**解决方法：**
```bash
# 检查后端
curl http://localhost:3000/api/test

# 检查 DNS
nslookup api.yourdomain.com

# 检查隧道状态
cloudflared tunnel info my-backend
```

### Q2: DNS 记录未生效？

**可能原因：**
- DNS 传播需要时间（通常几分钟到几小时）
- DNS 服务器配置错误

**解决方法：**
```bash
# 检查 DNS 记录
dig api.yourdomain.com
# 或
nslookup api.yourdomain.com

# 如果未生效，等待一段时间后重试
```

### Q3: 证书文件路径错误？

**Windows：**
```yaml
credentials-file: C:\Users\YourUsername\.cloudflared\TUNNEL_ID.json
```

**Mac/Linux：**
```yaml
credentials-file: /Users/yourname/.cloudflared/TUNNEL_ID.json
```

### Q4: 如何查看日志？

```bash
# 实时日志
cloudflared tunnel run my-backend --loglevel debug

# 系统服务日志（Linux）
sudo journalctl -u cloudflared -f

# 系统服务日志（Mac）
log show --predicate 'process == "cloudflared"' --info
```

---

## 💡 最佳实践

### 1. 使用系统服务

配置为系统服务后，隧道会在后台运行，无需手动启动。

### 2. 监控和日志

定期查看日志，确保隧道正常运行。

### 3. 备份配置

备份 `config.yml` 和证书文件，避免丢失。

### 4. 安全配置

- 不要在配置文件中硬编码敏感信息
- 使用环境变量管理配置
- 定期更新 cloudflared 客户端

---

## 📚 相关资源

- Cloudflare Tunnel 文档：https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- GitHub 仓库：https://github.com/cloudflare/cloudflared
- 官方示例：https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/

---

## 🎉 总结

Cloudflare Tunnel 是**免费获得固定域名**的最佳方案：

1. ✅ 完全免费
2. ✅ 固定域名（不会变化）
3. ✅ 全球 CDN（速度快）
4. ✅ 自动 HTTPS
5. ✅ 可以绑定自己的域名

**推荐用于：**
- 开发环境
- 测试环境
- 小型项目生产环境

**相比 ngrok 的优势：**
- 免费版就有固定域名
- 全球 CDN，速度更快
- 可以绑定自己的域名

现在就开始使用 Cloudflare Tunnel 吧！

