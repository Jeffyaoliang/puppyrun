# 腾讯云修改 DNS 服务器为 Cloudflare 详细步骤

## 📋 当前状态

你的域名 `puppyrun.site` 当前使用的 DNS 服务器：
- `kay.dnspod.net`（腾讯云/DNSPod）
- `nine.dnspod.net`（腾讯云/DNSPod）

需要修改为 Cloudflare 的 DNS 服务器。

---

## 🚀 详细步骤

### 步骤 1：登录腾讯云

1. 访问：https://cloud.tencent.com
2. 使用你的账号登录

### 步骤 2：进入域名管理

**方式 A：通过控制台**
1. 点击右上角 "控制台"
2. 在左侧菜单找到 "域名注册" -> "我的域名"
3. 或在搜索框搜索 "域名"

**方式 B：直接访问**
- 访问：https://console.cloud.tencent.com/domain

### 步骤 3：找到你的域名

1. 在域名列表中找到 `puppyrun.site`
2. 点击域名进入详情页

### 步骤 4：修改 DNS 服务器

#### 方法 1：在域名详情页修改

1. **找到 DNS 服务器设置**
   - 在域名详情页，找到 "DNS 服务器" 或 "Nameservers" 部分
   - 点击 "修改" 或 "更改 DNS 服务器"

2. **选择自定义 DNS**
   - 选择 "自定义 DNS" 或 "使用其他 DNS 服务器"
   - 不要选择 "使用 DNSPod"

3. **添加 Cloudflare DNS 服务器**
   - 删除现有的 DNS 服务器（`kay.dnspod.net` 和 `nine.dnspod.net`）
   - 添加 Cloudflare 提供的两个 DNS 服务器：
     - 第一个：`hank.ns.cloudflare.com`
     - 第二个：`cora.ns.cloudflare.com`（或 Cloudflare 提供的另一个）
   - **重要：必须添加两个，不能只添加一个！**

4. **保存**
   - 点击 "确定" 或 "保存"
   - 确认修改

#### 方法 2：通过 DNSPod 控制台修改

1. **进入 DNSPod 控制台**
   - 访问：https://console.dnspod.cn
   - 或从腾讯云控制台进入 DNSPod

2. **找到域名**
   - 在域名列表中找到 `puppyrun.site`

3. **修改 DNS 服务器**
   - 点击域名进入详情
   - 找到 "DNS 服务器" 设置
   - 修改为 Cloudflare 的 DNS 服务器

---

## ⚠️ 重要提示

### 1. 必须添加两个 DNS 服务器

Cloudflare 要求至少两个 DNS 服务器：
- ✅ `hank.ns.cloudflare.com`
- ✅ `cora.ns.cloudflare.com`（或 Cloudflare 提供的另一个）

**不要只添加一个！**

### 2. 确认第二个 DNS 服务器地址

在 Cloudflare Dashboard 中：
1. 登录：https://dash.cloudflare.com
2. 点击域名 `puppyrun.site`
3. 查看 "DNS" 或 "Overview" 页面
4. 找到显示的第二个 DNS 服务器地址

通常格式：`xxx.ns.cloudflare.com`（xxx 可能是 cora, dave, emma 等）

---

## ⏳ 步骤 5：等待 DNS 传播

修改后需要等待：
- **最快：** 几分钟
- **通常：** 1-2 小时
- **最长：** 24-48 小时（很少见）

---

## ✅ 步骤 6：验证是否生效

### 方法 1：使用命令行检查

在 PowerShell 中运行：

```powershell
nslookup -type=NS puppyrun.site
```

**如果成功，应该显示：**
```
puppyrun.site    nameserver = hank.ns.cloudflare.com
puppyrun.site    nameserver = cora.ns.cloudflare.com
```

**如果还是显示 `kay.dnspod.net` 和 `nine.dnspod.net`，说明还没生效，继续等待。**

### 方法 2：在 Cloudflare Dashboard 查看

1. 登录 Cloudflare Dashboard
2. 查看域名 `puppyrun.site` 的状态
3. 如果从 "Invalid nameservers" 变为 "Active"，说明已生效

### 方法 3：使用在线工具

访问：https://www.whatsmydns.net
- 输入域名：`puppyrun.site`
- 选择 "NS" 记录类型
- 查看是否显示 Cloudflare 的 DNS 服务器

---

## 🔍 找不到修改选项？

### 常见位置：

1. **域名详情页**
   - 点击域名进入详情
   - 查找 "DNS 服务器"、"Nameservers"、"DNS 设置" 等

2. **DNSPod 控制台**
   - 如果域名使用 DNSPod 解析
   - 需要先在 DNSPod 中修改

3. **域名管理页面**
   - 在域名列表页面
   - 点击域名右侧的 "管理" 或 "设置"

### 如果找不到：

1. 查看腾讯云帮助文档
2. 联系腾讯云客服
3. 或告诉我具体的页面内容，我可以帮你找

---

## 📝 操作清单

- [ ] 已登录腾讯云
- [ ] 已找到域名 `puppyrun.site`
- [ ] 已找到 DNS 服务器设置
- [ ] 已确认 Cloudflare 提供的两个 DNS 服务器地址
- [ ] 已删除现有的 DNS 服务器（kay.dnspod.net 和 nine.dnspod.net）
- [ ] 已添加 Cloudflare 的两个 DNS 服务器
- [ ] 已保存修改
- [ ] 已等待足够时间（至少几分钟）
- [ ] 已验证 DNS 是否生效

---

## 🆘 常见问题

### Q1: 找不到 DNS 服务器设置？

**A:** 
- 尝试访问 DNSPod 控制台：https://console.dnspod.cn
- 或在腾讯云控制台搜索 "DNS 服务器" 或 "Nameservers"

### Q2: 不知道第二个 DNS 服务器地址？

**A:** 
- 在 Cloudflare Dashboard 查看
- 或告诉我，我可以帮你查找

### Q3: 修改后多久生效？

**A:** 
- 最快几分钟
- 通常 1-2 小时
- 可以随时用 `nslookup -type=NS puppyrun.site` 检查

### Q4: 修改后还能恢复吗？

**A:** 
- 可以
- 记住原来的 DNS 服务器（kay.dnspod.net 和 nine.dnspod.net）
- 需要时可以改回去

---

## 🎯 下一步

DNS 服务器修改完成后：

1. ✅ 等待 DNS 传播（几分钟到几小时）
2. ✅ 验证是否生效（使用 nslookup 命令）
3. ✅ 在 Cloudflare Dashboard 确认状态为 "Active"
4. ✅ 继续配置 Cloudflare Tunnel

修改完成后告诉我，我继续帮你配置 Cloudflare Tunnel！

