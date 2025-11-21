# 🚀 物联网刷题系统 - 部署指南

## 📋 配置信息

✅ **已配置完成，开箱即用！**

- **GitHub仓库**: https://github.com/Awfp1314/-
- **服务器IP**: 47.108.72.126
- **SSH端口**: 2233
- **访问地址**: http://47.108.72.126:4000

---

## ⚡ 快速使用

### 方式1：一键发布（推荐）⭐

修改代码后，一条命令完成所有操作：

```bash
chmod +x 一键发布.sh
./一键发布.sh "更新说明"
```

或

```bash
npm run 发布 "更新说明"
```

**自动完成：**
1. ✅ 推送代码到GitHub
2. ✅ 部署到服务器
3. ✅ 热更新（用户无感知）

---

### 方式2：分步操作

#### 第一次使用：

```bash
# 1. 推送到GitHub
chmod +x push.sh
./push.sh "初始化项目"

# 2. 部署到服务器
chmod +x deploy-github.sh
./deploy-github.sh
```

#### 日常更新：

```bash
# 1. 推送到GitHub
./push.sh "修复bug"

# 2. 更新服务器
chmod +x update-github.sh
./update-github.sh
```

---

## 📝 NPM命令速查

| 命令 | 说明 | 适用场景 |
|------|------|----------|
| `npm run 发布 "说明"` | 一键发布 | ⭐ 最常用 |
| `npm run push "说明"` | 推送到GitHub | 只推送不部署 |
| `npm run deploy:github` | GitHub首次部署 | 第一次部署 |
| `npm run update:github` | GitHub热更新 | 已部署的更新 |

---

## 🎯 典型场景

### 场景1：添加了新功能

```bash
# 一条命令搞定
npm run 发布 "添加公告系统"
```

### 场景2：修复了bug

```bash
npm run 发布 "修复多选题判断错误"
```

### 场景3：更新了题库

```bash
npm run 发布 "更新题库到1000题"
```

### 场景4：只想推送到GitHub，不部署

```bash
npm run push "保存工作进度"
```

---

## 🔐 SSH密钥说明

✅ **服务器已有SSH密钥，无需额外配置！**

脚本会自动：
- 使用服务器现有的SSH密钥
- 配置GitHub访问权限
- 跳过主机验证

---

## 📂 项目结构

```
iot-quiz/
├── 一键发布.sh          ⭐ 最常用！推送+部署
├── push.sh              推送到GitHub
├── deploy-github.sh     首次部署
├── update-github.sh     热更新
├── src/                 前端源码
├── server/              后端源码
└── dist/                构建输出
```

---

## 🔄 工作流程

```
本地修改代码
    ↓
./一键发布.sh "更新说明"
    ↓
自动推送到GitHub
    ↓
自动部署到服务器
    ↓
用户看到新功能（无感知）
```

---

## 🛡️ 数据安全

- ✅ `server/data.json` 不会上传到GitHub
- ✅ 每次更新自动备份（保留20个版本）
- ✅ 热更新不会丢失用户数据
- ✅ 智能数据迁移（新字段自动添加）

**备份位置**: `/var/backups/iot-quiz/`

---

## 📊 服务器管理

### SSH登录

```bash
ssh -p 2233 root@47.108.72.126
```

### 查看服务状态

```bash
pm2 status
```

### 查看日志

```bash
pm2 logs
```

### 重启服务

```bash
pm2 restart all
```

---

## ❓ 常见问题

### Q: 推送失败，提示权限错误？

**A**: 检查SSH密钥是否已添加到GitHub：
```bash
# 在服务器上查看公钥
cat ~/.ssh/id_rsa.pub

# 复制公钥，添加到GitHub
# GitHub → Settings → SSH keys → New SSH key
```

### Q: 部署失败？

**A**: 查看详细错误信息：
```bash
# SSH登录服务器
ssh -p 2233 root@47.108.72.126

# 查看日志
pm2 logs

# 查看Git状态
cd /var/www/iot-quiz
git status
```

### Q: 想回滚到之前的版本？

**A**:
```bash
# SSH登录
ssh -p 2233 root@47.108.72.126
cd /var/www/iot-quiz

# 查看历史
git log --oneline

# 回滚
git reset --hard <commit_id>
pm2 reload all
```

---

## 🎉 完成！

**现在你只需要记住一个命令：**

```bash
npm run 发布 "更新说明"
```

就能完成从开发到上线的所有步骤！

---

## 📞 访问地址

- 🌐 **前端**: http://47.108.72.126:4000
- 🔧 **后端API**: http://47.108.72.126:3030
- 📦 **GitHub**: https://github.com/Awfp1314/-

---

**开始使用吧！** 🚀
