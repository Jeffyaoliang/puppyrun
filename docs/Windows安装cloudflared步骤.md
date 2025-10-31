# Windows 安装 cloudflared 步骤

## 方法 1：直接下载（推荐）

### 步骤 1：下载 cloudflared

1. 访问：https://github.com/cloudflare/cloudflared/releases/latest
2. 找到 `cloudflared-windows-amd64.exe`
3. 点击下载

### 步骤 2：安装到系统

**方式 A：放到 System32（推荐）**

1. 以管理员身份打开 PowerShell：
   - 按 `Win + X`
   - 选择 "Windows PowerShell (管理员)" 或 "终端 (管理员)"

2. 运行以下命令（替换为你的下载路径）：
   ```powershell
   # 假设下载到了 Downloads 文件夹
   copy C:\Users\$env:USERNAME\Downloads\cloudflared-windows-amd64.exe C:\Windows\System32\cloudflared.exe
   ```

**方式 B：创建专用文件夹**

1. 创建文件夹：
   ```powershell
   mkdir C:\cloudflared
   ```

2. 移动文件：
   ```powershell
   move C:\Users\$env:USERNAME\Downloads\cloudflared-windows-amd64.exe C:\cloudflared\cloudflared.exe
   ```

3. 添加到 PATH：
   - 按 `Win + R`，输入 `sysdm.cpl`，回车
   - 点击 "环境变量"
   - 在 "系统变量" 中找到 `Path`，点击 "编辑"
   - 点击 "新建"，输入 `C:\cloudflared`
   - 点击 "确定" 保存

### 步骤 3：验证安装

打开新的 PowerShell 窗口：

```powershell
cloudflared --version
```

如果显示版本号，说明安装成功！

---

## 方法 2：使用 Chocolatey（如果已安装）

```powershell
choco install cloudflared
```

---

## 方法 3：使用 Scoop（如果已安装）

```powershell
scoop install cloudflared
```

---

## 验证安装

```powershell
cloudflared --version
```

应该显示类似：
```
cloudflared version 2024.x.x (built 2024-xx-xx)
```

