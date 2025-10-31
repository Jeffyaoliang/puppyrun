# 修改 DNS 服务器为 Cloudflare 步骤

## 📋 前提条件

Cloudflare 会提供两个 DNS 服务器地址，通常类似：
- `hank.ns.cloudflare.com`
- `cora.ns.cloudflare.com`（或类似）

**重要：** 需要将两个 DNS 服务器都添加，不能只添加一个！

---

## 🔧 各平台修改步骤

### 方法 1：阿里云（万网）

#### 步骤 1：登录阿里云

1. 访问：https://www.aliyun.com
2. 登录你的账号

#### 步骤 2：进入域名管理

1. 鼠标悬停在右上角头像
2. 点击 "控制台"
3. 在左侧菜单找到 "域名" -> "域名"
4. 或在搜索框搜索 "域名"

#### 步骤 3：找到你的域名

1. 在域名列表中找到 `puppyrun.site`
2. 点击域名名称进入详情

#### 步骤 4：修改 DNS 服务器

1. 点击 "DNS 修改" 或 "修改 DNS"
2. 选择 "修改 DNS 服务器"
3. 删除现有的 DNS 服务器地址
4. 添加 Cloudflare 提供的 DNS 服务器：
   - 第一个：`hank.ns.cloudflare.com`
   - 第二个：`cora.ns.cloudflare.com`（或 Cloudflare 提供的另一个）
5. 点击 "确认" 或 "保存"

#### 步骤 5：等待生效

- 通常几分钟到几小时生效
- 可以在 Cloudflare Dashboard 中查看状态

---

### 方法 2：腾讯云（DNSPod）

#### 步骤 1：登录腾讯云

1. 访问：https://cloud.tencent.com
2. 登录你的账号

#### 步骤 2：进入域名管理

1. 点击右上角 "控制台"
2. 在左侧菜单找到 "域名注册" -> "我的域名"
3. 或在搜索框搜索 "域名"

#### 步骤 3：找到你的域名

1. 在域名列表中找到 `puppyrun.site`
2. 点击 "解析" 或 "管理"

#### 步骤 4：修改 DNS 服务器

1. 点击 "DNS 服务器" 或 "修改 DNS 服务器"
2. 选择 "自定义 DNS"
3. 删除现有的 DNS 服务器
4. 添加 Cloudflare 提供的 DNS 服务器：
   - 第一个：`hank.ns.cloudflare.com`
   - 第二个：`cora.ns.cloudflare.com`（或 Cloudflare 提供的另一个）
5. 点击 "保存"

---

### 方法 3：华为云

#### 步骤 1：登录华为云

1. 访问：https://www.huaweicloud.com
2. 登录你的账号

#### 步骤 2：进入域名管理

1. 点击 "控制台"
2. 在左侧菜单找到 "域名与网站" -> "域名注册"
3. 找到你的域名 `puppyrun.site`

#### 步骤 3：修改 DNS 服务器

1. 点击域名进入详情
2. 找到 "DNS 服务器" 设置
3. 点击 "修改"
4. 删除现有 DNS 服务器
5. 添加 Cloudflare 的 DNS 服务器
6. 保存

---

### 方法 4：Namecheap（国外）

#### 步骤 1：登录 Namecheap

1. 访问：https://www.namecheap.com
2. 登录你的账号

#### 步骤 2：进入域名列表

1. 点击 "Domain List"
2. 找到 `puppyrun.site`

#### 步骤 3：修改 DNS 服务器

1. 点击域名旁边的 "Manage"
2. 找到 "Nameservers" 部分
3. 选择 "Custom DNS"
4. 添加：
   - `hank.ns.cloudflare.com`
   - `cora.ns.cloudflare.com`（或 Cloudflare 提供的另一个）
5. 点击 "Save"

---

### 方法 5：GoDaddy（国外）

#### 步骤 1：登录 GoDaddy

1. 访问：https://www.godaddy.com
2. 登录你的账号

#### 步骤 2：进入域名管理

1. 点击 "My Products"
2. 找到 `puppyrun.site`
3. 点击 "DNS" 或 "Manage DNS"

#### 步骤 3：修改 DNS 服务器

1. 找到 "Nameservers" 部分
2. 点击 "Change"
3. 选择 "Custom"
4. 添加：
   - `hank.ns.cloudflare.com`
   - `cora.ns.cloudflare.com`（或 Cloudflare 提供的另一个）
5. 点击 "Save"

---

## ⚠️ 重要提示

### 1. 必须添加两个 DNS 服务器

Cloudflare 要求至少添加两个 DNS 服务器：
- ✅ `hank.ns.cloudflare.com`
- ✅ `cora.ns.cloudflare.com`（或 Cloudflare 提供的另一个）

**不要只添加一个！**

### 2. 等待 DNS 传播

修改后需要等待：
- **最快：** 几分钟
- **通常：** 1-2 小时
- **最长：** 24-48 小时（很少见）

### 3. 验证 DNS 是否生效

#### 方法 A：在 Cloudflare Dashboard 查看

1. 登录 Cloudflare Dashboard
2. 选择你的域名 `puppyrun.site`
3. 如果显示 "Active" 或 "绿色对勾"，说明已生效

#### 方法 B：使用命令行检查

在 PowerShell 中运行：

```powershell
nslookup puppyrun.site
```

如果显示 Cloudflare 的 DNS 服务器，说明已生效。

#### 方法 C：使用在线工具

访问：https://www.whatsmydns.net
- 输入域名：`puppyrun.site`
- 选择 "NS" 记录类型
- 查看是否显示 Cloudflare 的 DNS 服务器

---

## 🔍 如何找到 Cloudflare 提供的第二个 DNS 服务器？

### 在 Cloudflare Dashboard 中查看

1. 登录 Cloudflare Dashboard
2. 添加域名 `puppyrun.site` 时
3. Cloudflare 会显示两个 DNS 服务器地址

通常格式：
- 第一个：`hank.ns.cloudflare.com`
- 第二个：`cora.ns.cloudflare.com` 或类似

**常见 Cloudflare DNS 服务器：**
- `hank.ns.cloudflare.com`
- `cora.ns.cloudflare.com`
- `dave.ns.cloudflare.com`
- `emma.ns.cloudflare.com`

**重要：** 使用 Cloudflare 在添加域名时提供的两个地址！

---

## 📝 完整示例（阿里云）

假设 Cloudflare 提供的 DNS 服务器是：
- `hank.ns.cloudflare.com`
- `cora.ns.cloudflare.com`

### 在阿里云中的操作：

1. 登录阿里云
2. 进入域名管理
3. 找到 `puppyrun.site`
4. 点击 "DNS 修改"
5. 删除现有的 DNS 服务器（如果有）
6. 添加：
   ```
   hank.ns.cloudflare.com
   cora.ns.cloudflare.com
   ```
7. 保存

---

## ✅ 修改完成后的检查

### 检查清单：

- [ ] 已添加两个 Cloudflare DNS 服务器
- [ ] 已保存修改
- [ ] 等待了足够的时间（至少几分钟）
- [ ] 在 Cloudflare Dashboard 中显示 "Active"
- [ ] 使用 nslookup 验证成功

---

## 🆘 常见问题

### Q1: 只看到一个 DNS 服务器地址？

**A:** Cloudflare 要求至少两个。检查 Cloudflare Dashboard，应该会显示两个地址。

### Q2: 修改后多久生效？

**A:** 
- 最快几分钟
- 通常 1-2 小时
- 最多 24-48 小时

### Q3: 如何确认是否生效？

**A:** 
- 在 Cloudflare Dashboard 查看状态
- 使用 `nslookup puppyrun.site` 命令
- 使用在线工具检查

### Q4: 修改后还能恢复吗？

**A:** 可以。记住原来的 DNS 服务器地址，需要时可以改回去。

### Q5: 找不到 DNS 服务器设置？

**A:** 
- 不同平台界面可能不同
- 查找 "DNS 服务器"、"Nameservers"、"DNS 修改" 等关键词
- 或联系域名注册商的客服

---

## 📚 下一步

DNS 服务器修改完成后：

1. ✅ 等待 DNS 传播（通常几分钟到几小时）
2. ✅ 在 Cloudflare Dashboard 确认状态为 "Active"
3. ✅ 继续配置 Cloudflare Tunnel

参考文档：
- [puppyrun.site配置指南.md](./puppyrun.site配置指南.md)
- [Cloudflare Tunnel详细指南.md](./Cloudflare Tunnel详细指南.md)

