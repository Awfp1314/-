# 🚀 GitHub部署 - 快速开始

## 第一步：创建GitHub仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 `+` → `New repository`
3. 填写：
   - Repository name: `iot-quiz`（或其他名字）
   - 选择 `Public`（公开）或 `Private`（私有）
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 `Create repository`

---

## 第二步：修改部署脚本

打开 `deploy-github.sh`，找到第17行：

```bash
GITHUB_REPO="https://github.com/你的用户名/iot-quiz.git"
```

改成你的仓库地址，例如：

```bash
GITHUB_REPO="https://github.com/zhangsan/iot-quiz.git"
```

**如果是私有仓库**，需要使用token：

1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. 勾选 `repo` 权限
4. 复制生成的token（ghp_xxxxxxxxxxxx）
5. 修改为：

```bash
GITHUB_REPO="https://zhangsan:ghp_xxxxxxxxxxxx@github.com/zhangsan/iot-quiz.git"
```

---

## 第三步：推送代码到GitHub

在项目目录运行：

```bash
git init
git add .
git commit -m "初始化物联网刷题系统"
git branch -M main
git remote add origin https://github.com/你的用户名/iot-quiz.git
git push -u origin main
```

---

## 第四步：首次部署到服务器

```bash
chmod +x deploy-github.sh
./deploy-github.sh
```

或者

```bash
npm run deploy:github
```

**脚本会自动：**
- ✅ 在服务器安装Git、Node.js、PM2
- ✅ 从GitHub克隆项目
- ✅ 构建和启动服务

---

## 第五步：日常更新流程

### 1. 修改代码后，推送到GitHub：

```bash
git add .
git commit -m "修复了某个bug"
git push
```

### 2. 部署到服务器：

```bash
chmod +x update-github.sh
./update-github.sh
```

或者

```bash
npm run update:github
```

**脚本会自动：**
- ✅ 从GitHub拉取最新代码
- ✅ 备份数据库
- ✅ 智能数据迁移
- ✅ 热重载（用户无感知）

---

## 🎯 完整工作流程

```
1. 本地修改代码
   ↓
2. git commit + git push → GitHub
   ↓
3. ./update-github.sh → 服务器自动更新
   ↓
4. 用户看到新功能（无需刷新）
```

---

## 📍 访问地址

部署完成后访问：

- **前端**：http://47.108.72.126:4000
- **后端API**：http://47.108.72.126:3030

---

## 🔒 数据安全说明

**重要：`server/data.json` 不会上传到GitHub**

- ✅ `.gitignore` 已配置忽略数据文件
- ✅ 每次更新自动备份（保留20个版本）
- ✅ 数据只存在服务器，GitHub上看不到

备份位置：`/var/backups/iot-quiz/`

---

## 🆚 两种部署方式对比

| 特性 | GitHub方式 | 直接上传方式 |
|------|-----------|-------------|
| 版本控制 | ✅ 有 | ❌ 无 |
| 团队协作 | ✅ 方便 | ❌ 不便 |
| 可回滚 | ✅ 可以 | ❌ 不行 |
| 速度 | 🐢 慢一点 | 🚀 快 |
| 依赖 | GitHub | 无 |

**推荐：**
- 多人协作 → GitHub方式
- 个人项目 → 直接上传方式

---

## ❓ 常见问题

### Q1: 如何回滚到之前的版本？

```bash
# SSH登录服务器
ssh -p 2233 root@47.108.72.126

# 进入项目目录
cd /var/www/iot-quiz

# 查看提交历史
git log --oneline

# 回滚到指定版本
git reset --hard <commit_id>

# 重启服务
pm2 reload all
```

### Q2: 如何查看服务器上的Git状态？

```bash
ssh -p 2233 root@47.108.72.126
cd /var/www/iot-quiz
git status
git log -3
```

### Q3: Private repository访问被拒绝？

确保使用了Personal Access Token：
```
https://用户名:token@github.com/用户名/仓库名.git
```

---

## 📞 需要帮助？

1. 查看服务器日志：`ssh登录后 pm2 logs`
2. 查看Git状态：`ssh登录后 git status`
3. 查看最近提交：`ssh登录后 git log -5`

---

**就是这么简单！现在开始部署吧！** 🎉
