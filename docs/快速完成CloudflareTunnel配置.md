# 快速完成 Cloudflare Tunnel 配置

## 📋 当前状态

- ✅ DNS 服务器已配置（hank.ns.cloudflare.com 和 tara.ns.cloudflare.com）
- ✅ 小程序代码已配置（api.puppyrun.site）
- ❌ Cloudflare Tunnel 还未配置（导致连接失败）

---

## 🚀 快速配置步骤（5-10分钟）

### 步骤 1：安装 cloudflared

#### Windows 安装：

1. **下载**
   - 访问：https://github.com/cloudflare/cloudflared/releases/latest
   - 下载：`cloudflared-windows-amd64.exe`

2. **安装到系统**
   - 以管理员身份打开 PowerShell
   - 运行（替换为你的下载路径）：
   ```powershell
   copy C:\Users\$env:USERNAME\Downloads\cloudflared-windows-amd64.exe C:\Windows\System32\cloudflared.exe
   ```

3. **验证**
   ```powershell
   cloudflared --version
   ```

---

### 步骤 2：登录 Cloudflare

```powershell
cloudflared tunnel login
```

**这会：**
1. 打开浏览器
2. 要求你登录（使用 yaoliangbian@gmail.com）
3. 选择域名 `puppyrun.site`
4. 授权 Tunnel 访问

完成后会生成证书文件。

---

### 步骤 3：创建隧道

```powershell
cloudflared tunnel create puppyrun-backend
```

**记录显示的隧道 ID**（类似：`abc123def456ghi789...`）

---

### 步骤 4：创建配置文件

创建文件：`C:\Users\你的用户名\.cloudflared\config.yml`

**查找你的用户名：**
```powershell
echo $env:USERNAME
```

**配置文件内容：**

```yaml
tunnel: YOUR_TUNNEL_ID_HERE
credentials-file: C:\Users\你的用户名\.cloudflared\YOUR_TUNNEL_ID.json

ingress:
  - hostname: api.puppyrun.site
    service: http://localhost:3000
  - service: http_status:404
```

**需要修改：**
1. `YOUR_TUNNEL_ID_HERE` → 步骤 3 获得的隧道 ID
2. `你的用户名` → 替换为实际的 Windows 用户名
3. `localhost:3000` → 如果你的后端不是 3000 端口，请修改

**示例（假设用户名是 admin，隧道 ID 是 abc123...）：**

```yaml
tunnel: abc123def456ghi789jkl012mno345pqr678
credentials-file: C:\Users\admin\.cloudflared\abc123def456ghi789jkl012mno345pqr678.json

ingress:
  - hostname: api.puppyrun.site
    service: http://localhost:3000
  - service: http_status:404
```

---

### 步骤 5：创建 DNS 记录

```powershell
cloudflared tunnel route dns puppyrun-backend api.puppyrun.site
```

---

### 步骤 6：启动后端服务

确保你的后端服务正在运行：

```powershell
# 在你的后端项目目录
npm start
# 或
node server.js
```

**验证后端是否运行：**
- 在浏览器访问：`http://localhost:3000/api/test`
- 或使用 curl：`curl http://localhost:3000/api/test`

---

### 步骤 7：启动隧道

```powershell
cloudflared tunnel run puppyrun-backend
```

**如果成功，会显示：**
```
Your quick Tunnel has been created! Visit it:
https://api.puppyrun.site
```

**保持这个窗口打开！** 隧道需要持续运行。

---

### 步骤 8：测试

1. **浏览器测试**
   ```
   https://api.puppyrun.site/api/test
   ```

2. **小程序测试**
   - 重新运行小程序
   - 尝试提交问卷
   - 应该可以正常工作了

---

## ⚠️ 重要提示

### 1. 后端服务必须运行

- 确保后端在 `localhost:3000`（或配置的端口）运行
- 隧道只是转发请求，不是运行后端

### 2. 隧道需要持续运行

- 关闭 PowerShell 窗口，隧道会停止
- 需要时重新运行 `cloudflared tunnel run puppyrun-backend`

### 3. 设置为系统服务（可选）

如果需要开机自启：

```powershell
# 以管理员身份运行
cloudflared service install
Start-Service cloudflared
```

---

## 🔧 常见问题

### Q1: 找不到配置文件路径？

**A:** 
```powershell
# 查看用户名
echo $env:USERNAME

# 创建配置目录（如果不存在）
mkdir C:\Users\$env:USERNAME\.cloudflared -Force
```

### Q2: 后端端口不是 3000？

**A:** 修改配置文件中的端口：
```yaml
service: http://localhost:你的端口
```

### Q3: 如何查看隧道 ID？

**A:** 
```powershell
cloudflared tunnel list
```

### Q4: 连接还是失败？

**A:** 检查：
- 后端服务是否在运行？
- 隧道是否在运行？
- 配置文件是否正确？
- DNS 记录是否创建成功？

---

## 📝 完整命令序列

```powershell
# 1. 安装（如果还没安装）
# 下载 cloudflared-windows-amd64.exe 后：
copy C:\Users\$env:USERNAME\Downloads\cloudflared-windows-amd64.exe C:\Windows\System32\cloudflared.exe

# 2. 登录
cloudflared tunnel login

# 3. 创建隧道
cloudflared tunnel create puppyrun-backend
# 记录隧道 ID

# 4. 创建配置文件（手动创建 config.yml）
# 位置：C:\Users\你的用户名\.cloudflared\config.yml

# 5. 创建 DNS 记录
cloudflared tunnel route dns puppyrun-backend api.puppyrun.site

# 6. 启动后端（在另一个终端）
npm start

# 7. 启动隧道
cloudflared tunnel run puppyrun-backend
```

---

完成这些步骤后，`api.puppyrun.site` 就可以正常访问了！

