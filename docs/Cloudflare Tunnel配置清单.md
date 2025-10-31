# Cloudflare Tunnel 配置清单

## 📋 准备工作

在开始之前，请确认：

- [ ] 有 Cloudflare 账号（如果没有，先注册：https://dash.cloudflare.com/sign-up）
- [ ] 有域名（或准备购买）
- [ ] 后端代码已准备好
- [ ] 本地可以运行后端服务

---

## 🚀 配置步骤

### 步骤 1：注册 Cloudflare 账号

如果还没有账号：

1. 访问：https://dash.cloudflare.com/sign-up
2. 使用邮箱注册
3. 验证邮箱

### 步骤 2：添加域名到 Cloudflare

#### 选项 A：已有域名

1. 登录 Cloudflare Dashboard
2. 点击 "Add a Site"
3. 输入你的域名（如 `example.com`）
4. 选择免费计划（Free）
5. 按照提示修改域名的 DNS 服务器为 Cloudflare 提供的地址

#### 选项 B：购买域名

推荐购买便宜的域名：
- **.xyz**：约 10-20元/年（最便宜）
- **.top**：约 20-30元/年
- **.site**：约 30-50元/年

购买平台：
- 阿里云：https://wanwang.aliyun.com
- 腾讯云：https://dnspod.cloud.tencent.com

购买后，按照选项 A 的步骤添加到 Cloudflare。

### 步骤 3：安装 Cloudflare Tunnel

根据你的系统选择：

#### Windows

1. 访问：https://github.com/cloudflare/cloudflared/releases/latest
2. 下载 `cloudflared-windows-amd64.exe`
3. 重命名为 `cloudflared.exe`
4. 放到 `C:\Windows\System32\` 或添加到 PATH

#### Mac

```bash
brew install cloudflared
```

#### Linux

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

验证安装：
```bash
cloudflared --version
```

### 步骤 4：登录 Cloudflare

```bash
cloudflared tunnel login
```

这会打开浏览器，要求你：
1. 登录 Cloudflare
2. 选择要使用的域名
3. 授权 Tunnel 访问

完成后会生成证书文件。

### 步骤 5：创建隧道

```bash
cloudflared tunnel create my-backend
```

**记录下显示的隧道 ID**（类似：`abc123def456...`）

### 步骤 6：配置隧道

创建配置文件：

**Windows 路径：** `C:\Users\YourUsername\.cloudflared\config.yml`  
**Mac/Linux 路径：** `~/.cloudflared/config.yml`

配置文件内容：

```yaml
tunnel: YOUR_TUNNEL_ID_HERE
credentials-file: C:\Users\YourUsername\.cloudflared\YOUR_TUNNEL_ID.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

**需要修改的地方：**
1. `YOUR_TUNNEL_ID_HERE` → 替换为步骤 5 获得的隧道 ID
2. `credentials-file` → 替换为证书文件的完整路径
3. `api.yourdomain.com` → 替换为你的域名
4. `localhost:3000` → 替换为你的后端端口

### 步骤 7：创建 DNS 记录

```bash
cloudflared tunnel route dns my-backend api.yourdomain.com
```

将 `api.yourdomain.com` 替换为你的域名。

### 步骤 8：启动后端服务

```bash
# 在你的后端项目目录
npm start
# 或
node server.js
```

确保后端运行在配置的端口（如 3000）。

### 步骤 9：启动隧道

```bash
cloudflared tunnel run my-backend
```

如果成功，会显示：
```
Your quick Tunnel has been created! Visit it:
https://api.yourdomain.com
```

### 步骤 10：配置小程序

打开 `miniprogram/utils/config.ts`：

```typescript
export const API_BASE_URL = 'https://api.yourdomain.com';
```

### 步骤 11：测试

1. **浏览器测试**
   ```
   https://api.yourdomain.com/api/test
   ```

2. **小程序测试**
   - 在微信开发者工具中运行
   - 尝试提交问卷
   - 查看是否成功

---

## ✅ 检查清单

配置完成后，检查：

- [ ] Cloudflare 账号已注册
- [ ] 域名已添加到 Cloudflare
- [ ] cloudflared 已安装
- [ ] 已登录 Cloudflare
- [ ] 隧道已创建
- [ ] 配置文件已创建并正确填写
- [ ] DNS 记录已创建
- [ ] 后端服务正在运行
- [ ] 隧道正在运行
- [ ] 小程序配置已更新
- [ ] 浏览器可以访问 API
- [ ] 小程序可以正常调用 API

---

## 🆘 常见问题

### 问题 1：配置文件路径不对？

**Windows：**
```yaml
credentials-file: C:\Users\YourUsername\.cloudflared\TUNNEL_ID.json
```

**Mac/Linux：**
```yaml
credentials-file: /Users/yourname/.cloudflared/TUNNEL_ID.json
```

### 问题 2：DNS 记录未生效？

等待几分钟，DNS 传播需要时间。可以用以下命令检查：

```bash
nslookup api.yourdomain.com
```

### 问题 3：连接失败？

检查：
- 后端服务是否在运行？
- 端口是否正确？
- 配置文件中的端口是否匹配？

### 问题 4：如何设置为系统服务？

**Linux：**
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
```

**Mac：**
```bash
sudo cloudflared service install
```

**Windows：**
```powershell
# 以管理员身份运行
cloudflared service install
```

---

## 📚 下一步

配置成功后：

1. ✅ 将隧道设置为系统服务（开机自启）
2. ✅ 在小程序中测试所有功能
3. ✅ 配置微信小程序合法域名（真机测试）
4. ✅ 监控隧道运行状态

详细说明请参考：`docs/Cloudflare Tunnel详细指南.md`

