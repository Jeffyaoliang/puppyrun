# 解决 "Invalid nameservers" 问题

## 📋 问题说明

在 Cloudflare Dashboard 中看到 "Invalid nameservers" 表示：
- ✅ 域名已添加到 Cloudflare
- ❌ 域名注册商的 DNS 服务器还没有修改为 Cloudflare 提供的地址

---

## 🔍 步骤 1：查看 Cloudflare 提供的 DNS 服务器地址

### 方法 1：在 Cloudflare Dashboard 查看

1. **在域名概览页面**
   - 域名 `puppyrun.site` 下方应该会显示 DNS 服务器地址
   - 或者点击域名进入详情页

2. **在 DNS 设置页面**
   - 点击左侧菜单 "DNS"
   - 在页面顶部或底部会显示当前使用的 DNS 服务器
   - 会显示类似：
     ```
     Nameservers
     hank.ns.cloudflare.com
     cora.ns.cloudflare.com
     ```

3. **在概览页面**
   - 点击域名 `puppyrun.site` 进入详情
   - 在 "Overview" 页面可能会显示需要的 DNS 服务器

### 方法 2：查看初始添加时的提示

如果刚刚添加域名，Cloudflare 在添加过程中会显示两个 DNS 服务器地址。

### 方法 3：在域名列表页面

1. 在域名列表页面，点击 `puppyrun.site` 域名
2. 在域名卡片或详情中查找 "Nameservers" 或 "DNS 服务器"

---

## 🔧 步骤 2：修改域名注册商的 DNS 服务器

### 如果是在阿里云购买的

1. **登录阿里云**
   - 访问：https://www.aliyun.com
   - 登录账号

2. **进入域名管理**
   - 控制台 -> 域名 -> 域名
   - 找到 `puppyrun.site`

3. **修改 DNS 服务器**
   - 点击域名进入详情
   - 点击 "DNS 修改" 或 "修改 DNS"
   - 选择 "修改 DNS 服务器"
   - 删除现有的 DNS 服务器
   - 添加 Cloudflare 提供的两个地址：
     - `hank.ns.cloudflare.com`
     - `cora.ns.cloudflare.com`（或 Cloudflare 显示的另一個）
   - 保存

### 如果是在腾讯云购买的

1. **登录腾讯云**
   - 访问：https://cloud.tencent.com
   - 登录账号

2. **进入域名管理**
   - 控制台 -> 域名注册 -> 我的域名
   - 找到 `puppyrun.site`

3. **修改 DNS 服务器**
   - 点击 "解析" 或 "管理"
   - 点击 "DNS 服务器" 或 "修改 DNS 服务器"
   - 选择 "自定义 DNS"
   - 添加 Cloudflare 的两个 DNS 服务器
   - 保存

### 如果是在其他平台购买的

参考我之前创建的文档：`docs/修改DNS服务器为Cloudflare步骤.md`

---

## ⏳ 步骤 3：等待 DNS 传播

修改后需要等待：

- **最快：** 几分钟
- **通常：** 1-2 小时
- **最长：** 24-48 小时（很少见）

---

## ✅ 步骤 4：验证是否生效

### 方法 1：在 Cloudflare Dashboard 查看

1. 刷新 Cloudflare Dashboard 页面
2. 状态应该从 "Invalid nameservers" 变为 "Active"
3. 或显示绿色对勾 ✅

### 方法 2：使用命令行检查

在 PowerShell 中运行：

```powershell
nslookup puppyrun.site
```

如果显示 Cloudflare 的 DNS 服务器（如 `hank.ns.cloudflare.com`），说明已生效。

### 方法 3：使用在线工具

访问：https://www.whatsmydns.net
- 输入域名：`puppyrun.site`
- 选择 "NS" 记录类型
- 查看是否显示 Cloudflare 的 DNS 服务器

---

## 🆘 如果还是显示 "Invalid nameservers"

### 检查清单：

- [ ] 是否添加了两个 DNS 服务器？（必须两个）
- [ ] DNS 服务器地址是否正确？（完全匹配，包括大小写）
- [ ] 是否保存了修改？
- [ ] 是否等待了足够的时间？（至少几分钟）
- [ ] 是否在正确的域名注册商平台修改？

### 常见错误：

1. **只添加了一个 DNS 服务器**
   - ❌ 错误：只添加 `hank.ns.cloudflare.com`
   - ✅ 正确：添加两个，如 `hank.ns.cloudflare.com` 和 `cora.ns.cloudflare.com`

2. **DNS 服务器地址错误**
   - ❌ 错误：`hank.cloudflare.com`（缺少 .ns）
   - ✅ 正确：`hank.ns.cloudflare.com`

3. **忘记保存**
   - 修改后必须点击 "保存" 或 "确认"

---

## 📝 快速操作步骤

1. **在 Cloudflare Dashboard 查看 DNS 服务器地址**
   - 记录两个地址（如 `hank.ns.cloudflare.com` 和 `cora.ns.cloudflare.com`）

2. **登录域名注册商**
   - 找到域名 `puppyrun.site`
   - 进入 DNS 服务器设置

3. **修改为 Cloudflare 的 DNS 服务器**
   - 删除现有的
   - 添加 Cloudflare 提供的两个地址
   - 保存

4. **等待并验证**
   - 等待几分钟到几小时
   - 在 Cloudflare Dashboard 查看状态
   - 应该变为 "Active"

---

## 💡 提示

**如果你不确定第二个 DNS 服务器地址：**

1. 在 Cloudflare Dashboard 中，点击域名 `puppyrun.site`
2. 查看页面上显示的 DNS 服务器信息
3. 或者联系 Cloudflare 支持

**通常 Cloudflare 的 DNS 服务器格式：**
- `xxx.ns.cloudflare.com`（xxx 是名字，如 hank, cora, dave, emma 等）

---

完成 DNS 服务器修改后，告诉我，我会继续帮你配置 Cloudflare Tunnel！

