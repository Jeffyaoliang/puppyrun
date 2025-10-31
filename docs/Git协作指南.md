# Git 协作指南

## 仓库信息

- **GitHub 仓库地址**: https://github.com/Jeffyaoliang/puppyrun
- **SSH 地址**: git@github.com:Jeffyaoliang/puppyrun.git
- **HTTPS 地址**: https://github.com/Jeffyaoliang/puppyrun.git
- **主分支**: main

## 仓库设置（已完成）

✅ 远程仓库已连接
✅ 代码已推送到 GitHub
✅ 分支跟踪已设置

### 查看远程仓库

```bash
git remote -v
```

### 3. 多人协作工作流

#### 日常开发流程

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建功能分支
git checkout -b feature/功能名称

# 3. 开发并提交
git add .
git commit -m "描述你的更改"

# 4. 推送到远程分支
git push origin feature/功能名称

# 5. 在 GitHub 上创建 Pull Request
```

#### 合并代码

1. 在 GitHub 上创建 Pull Request
2. 代码审查后合并到 main 分支
3. 本地更新 main 分支：
   ```bash
   git checkout main
   git pull origin main
   ```

### 4. 常用 Git 命令

```bash
# 查看状态
git status

# 查看提交历史
git log --oneline

# 查看分支
git branch -a

# 切换分支
git checkout 分支名

# 合并分支
git merge 分支名

# 查看远程仓库
git remote -v

# 更新远程仓库地址
git remote set-url origin https://github.com/jeffyaoliang/YOUR_REPO_NAME.git
```

## 分支命名规范

- `main` - 主分支，稳定版本
- `develop` - 开发分支
- `feature/功能名称` - 功能开发分支
- `bugfix/问题描述` - 问题修复分支
- `hotfix/紧急修复` - 紧急修复分支

## 提交信息规范

使用清晰的中文或英文描述：

```
feat: 添加用户喜欢功能
fix: 修复网络请求错误
docs: 更新 API 文档
style: 代码格式调整
refactor: 重构匹配算法
test: 添加单元测试
chore: 更新依赖包
```

## 注意事项

1. **不要提交敏感信息**：
   - API 密钥
   - 密码
   - 个人 token
   - 已在 `.gitignore` 中配置

2. **提交前检查**：
   - 运行测试确保代码正常
   - 检查是否有编译错误
   - 确认没有提交临时文件

3. **定期同步**：
   - 每天开始工作前先 `git pull`
   - 完成功能后及时推送

4. **冲突处理**：
   - 如果遇到冲突，先拉取最新代码
   - 手动解决冲突后提交
   - 无法解决时寻求帮助

## 当前状态

✅ Git 仓库已初始化
✅ 代码已提交到本地仓库
✅ `.gitignore` 已配置
✅ 远程仓库已连接（https://github.com/Jeffyaoliang/puppyrun）
✅ 代码已推送到 GitHub main 分支

