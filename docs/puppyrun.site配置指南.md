# puppyrun.site Cloudflare Tunnel 配置指南

## 📋 准备工作

- ✅ 域名：`puppyrun.site`（已购买）
- ⏳ 需要：Cloudflare 账号
- ⏳ 需要：后端服务运行在本地

---

## 🚀 完整配置步骤

### 步骤 1：注册 Cloudflare 账号

1. 访问：https://dash.cloudflare.com/sign-up
2. 使用邮箱注册（免费）
3. 验证邮箱

---

### 步骤 2：添加域名到 Cloudflare

1. **登录 Cloudflare Dashboard**
   - 访问：https://dash.cloudflare.com
   - 登录你的账号

2. **添加站点**
   - 点击 "Add a Site"
   - 输入：`puppyrun.site`
   - 点击 "Add site"

3. **选择计划**
   - 选择 **Free** 计划（免费）
   - 点击 "Continue"

4. **查看 DNS 服务器**
   - Cloudflare 会显示两个 DNS 服务器地址
   - 例如：
     - `cora.ns.cloudflare.com`
     - `dave.ns.cloudflare.com`
   - **记录下来**

5. **修改域名 DNS 服务器**
   - 登录你的域名注册商（阿里云/腾讯云等）
   - 找到域名管理 -> DNS 解析
   - 将 DNS 服务器修改为 Cloudflare 提供的地址
   - 等待生效（通常几分钟到几小时）

6. **验证 DNS**
   - 在 Cloudflare Dashboard 中点击 "Continue"
   - Cloudflare 会自动检测 DNS 服务器是否已更新
   - 如果已更新，会显示 "Active"

---

### 步骤 3：安装 Cloudflare Tunnel

#### Windows 系统

1. **下载 cloudflared**
   - 访问：https://github.com/cloudflare/cloudflared/releases/latest
   - 下载：`cloudflared-windows-amd64.exe`
   - 重命名为：`cloudflared.exe`

2. **添加到 PATH**
   
   **方式 A：放到 System32（推荐）**
   ```powershell
   # 以管理员身份运行 PowerShell
   # 将 cloudflared.exe 复制到 C:\Windows\System32\
   copy cloudflared.exe C:\Windows\System32\
   ```

   **方式 B：创建专用文件夹**
   ```powershell
   # 创建文件夹
   mkdir C:\cloudflared
   # 将 cloudflared.exe 放到这个文件夹
   # 然后添加到 PATH 环境变量
   ```

3. **验证安装**
   ```powershell
   cloudflared --version
   ```

#### Mac 系统

```bash
brew install cloudflared
```

#### Linux 系统

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
cloudflared --version
```

---

### 步骤 4：登录 Cloudflare

```powershell
cloudflared tunnel login
```

**这会：**
1. 打开浏览器
2. 要求你登录 Cloudflare
3. 选择域名 `puppyrun.site`
4. 授权 Tunnel 访问

**完成后会生成证书文件：**
- Windows: `C:\Users\YourUsername\.cloudflared\cert.pem`
- Mac/Linux: `~/.cloudflared/cert.pem`

---

### 步骤 5：创建隧道

```powershell
cloudflared tunnel create puppyrun-backend
```

**输出示例：**
```
Created tunnel puppyrun-backend with id: abc123def456ghi789jkl012mno345pqr678
```

**重要：记录下隧道 ID！**（类似：`abc123def456...`）

---

### 步骤 6：创建配置文件

#### Windows 路径

创建文件：`C:\Users\YourUsername\.cloudflared\config.yml`

**配置文件内容：**

```yaml
tunnel: YOUR_TUNNEL_ID_HERE
credentials-file: C:\Users\YourUsername\.cloudflared\YOUR_TUNNEL_ID.json

ingress:
  - hostname: api.puppyrun.site
    service: http://localhost:3000
  - service: http_status:404
```

**需要修改的地方：**
1. `YOUR_TUNNEL_ID_HERE` → 替换为步骤 5 获得的隧道 ID
2. `YourUsername` → 替换为你的 Windows 用户名
3. `localhost:3000` → 如果你的后端不是 3000 端口，请修改

#### Mac/Linux 路径

创建文件：`~/.cloudflared/config.yml`

```yaml
tunnel: YOUR_TUNNEL_ID_HERE
credentials-file: /Users/yourname/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: api.puppyrun.site
    service: http://localhost:3000
  - service: http_status:404
```

**注意：** 确保 `YOUR_TUNNEL_ID.json` 文件存在（创建隧道时自动生成）

---

### 步骤 7：创建 DNS 记录

```powershell
cloudflared tunnel route dns puppyrun-backend api.puppyrun.site
```

**输出示例：**
```
✓ DNS record created: api.puppyrun.site -> abc123def456...cfargotunnel.com
```

**这会在 Cloudflare 中自动创建 CNAME 记录。**

---

### 步骤 8：启动后端服务

在你的后端项目目录：

```powershell
# 确保后端运行在配置的端口（如 3000）
npm start
# 或
node server.js
```

**验证后端是否运行：**
```powershell
# 在浏览器访问或使用 curl
curl http://localhost:3000/api/test
```

---

### 步骤 9：启动隧道

```powershell
cloudflared tunnel run puppyrun-backend
```

**如果成功，会显示：**
```
2024-01-01T12:00:00Z INF +--------------------------------------------------------------------------------------------+
2024-01-01T12:00:00Z INF |  Your quick Tunnel has been created! Visit it:                                            |
2024-01-01T12:00:00Z INF |  https://api.puppyrun.site                                                               |
2024-01-01T12:00:00Z INF +--------------------------------------------------------------------------------------------+
```

**保持这个终端窗口打开！** 隧道需要持续运行。

---

### 步骤 10：测试 API

在浏览器访问：
```
https://api.puppyrun.site/api/test
```

如果能看到后端返回的数据，说明配置成功！

---

### 步骤 11：配置小程序

打开 `miniprogram/utils/config.ts`：

```typescript
export const API_BASE_URL = 'https://api.puppyrun.site';
```

---

### 步骤 12：配置微信小程序后台

1. **登录微信公众平台**
   - 访问：https://mp.weixin.qq.com/
   - 使用小程序账号登录

2. **配置服务器域名**
   - 进入：开发 -> 开发管理 -> 开发设置
   - 找到「服务器域名」配置
   - 在「request合法域名」中添加：`api.puppyrun.site`
   - 在「uploadFile合法域名」中添加：`api.puppyrun.site`（如果上传文件）

3. **保存配置**

---

### 步骤 13：设置为系统服务（可选，推荐）

这样隧道会在后台运行，开机自启。

#### Windows

```powershell
# 以管理员身份运行 PowerShell
cloudflared service install

# 启动服务
Start-Service cloudflared

# 查看状态
Get-Service cloudflared
```

#### Mac/Linux

```bash
sudo cloudflared service install
sudo systemctl start cloudflared  # Linux
# 或
sudo launchctl load /Library/LaunchDaemons/com.cloudflare.cloudflared.plist  # Mac
```

---

## ✅ 配置完成检查清单

- [ ] Cloudflare 账号已注册
- [ ] 域名 puppyrun.site 已添加到 Cloudflare
- [ ] DNS 服务器已修改为 Cloudflare 的地址
- [ ] cloudflared 已安装
- [ ] 已登录 Cloudflare
- [ ] 隧道已创建（记录隧道 ID）
- [ ] 配置文件已创建并正确填写
- [ ] DNS 记录已创建（api.puppyrun.site）
- [ ] 后端服务正在运行
- [ ] 隧道正在运行
- [ ] 浏览器可以访问 https://api.puppyrun.site
- [ ] 小程序配置已更新
- [ ] 微信后台已添加合法域名

---

## 🔧 常见问题

### Q1: DNS 服务器修改后多久生效？

**A:** 通常几分钟到几小时。可以用以下命令检查：

```powershell
nslookup puppyrun.site
```

如果显示 Cloudflare 的 DNS 服务器，说明已生效。

### Q2: 配置文件路径不对？

**Windows 查找用户名：**
```powershell
echo $env:USERNAME
```

然后使用：`C:\Users\你的用户名\.cloudflared\config.yml`

### Q3: 隧道 ID 在哪里？

隧道 ID 在步骤 5 创建隧道时显示，类似：`abc123def456ghi789jkl012mno345pqr678`

也可以查看：
```powershell
cloudflared tunnel list
```

### Q4: 证书文件路径不对？

证书文件通常在：
- Windows: `C:\Users\你的用户名\.cloudflared\TUNNEL_ID.json`
- Mac/Linux: `~/.cloudflared/TUNNEL_ID.json`

使用完整路径，确保路径正确。

### Q5: 后端端口不是 3000？

修改配置文件中的端口：
```yaml
service: http://localhost:你的端口
```

### Q6: 如何查看隧道日志？

```powershell
cloudflared tunnel run puppyrun-backend --loglevel debug
```

---

## 📝 配置文件完整示例

**Windows 示例（假设用户名是 admin，隧道 ID 是 abc123...）：**

```yaml
tunnel: abc123def456ghi789jkl012mno345pqr678
credentials-file: C:\Users\admin\.cloudflared\abc123def456ghi789jkl012mno345pqr678.json

ingress:
  - hostname: api.puppyrun.site
    service: http://localhost:3000
  - service: http_status:404
```

---

## 🎉 完成！

配置完成后，你的 API 地址将是：
```
https://api.puppyrun.site
```

这个地址：
- ✅ 固定不变
- ✅ 免费使用
- ✅ 全球 CDN
- ✅ 自动 HTTPS
- ✅ 完全支持微信小程序

现在开始配置吧！如果遇到问题，告诉我具体的错误信息。

