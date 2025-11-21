#!/bin/bash

# ==============================================
# 一键发布到生产环境
# 功能：推送到GitHub + 部署到服务器
# 使用：./一键发布.sh "更新说明"
# ==============================================

set -e

COMMIT_MSG="${1:-更新代码}"

echo "╔═══════════════════════════════════════╗"
echo "║     物联网刷题系统 - 一键发布         ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# 第1步：推送到GitHub
echo "📤 [1/2] 推送到GitHub..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查Git初始化
if [ ! -d ".git" ]; then
    echo "🔧 首次使用，初始化Git..."
    git init
    git branch -M main
    git remote add origin git@github.com:Awfp1314/-.git
fi

git add .
git commit -m "$COMMIT_MSG" || echo "⚠️  没有新的更改"
git push -u origin main

echo "✓ GitHub推送完成"
echo ""

# 第2步：部署到服务器
echo "🚀 [2/2] 部署到服务器..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 判断是否首次部署
SERVER_IP="47.108.72.126"
SERVER_PORT="2233"
SERVER_USER="root"
SERVER_PASS="Wjj19312985136..."

CHECK_RESULT=$(sshpass -p "$SERVER_PASS" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP "[ -d '/var/www/iot-quiz/.git' ] && echo 'exists' || echo 'new'")

if [ "$CHECK_RESULT" = "new" ]; then
    echo "🆕 首次部署，执行完整部署..."
    ./deploy-github.sh
else
    echo "🔄 执行热更新..."
    ./update-github.sh
fi

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║            ✨ 发布完成！              ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "📍 访问地址:"
echo "   🌐 前端: http://47.108.72.126:4000"
echo "   🔧 后端: http://47.108.72.126:3030"
echo ""
echo "📝 提交信息: $COMMIT_MSG"
echo "🌐 GitHub: https://github.com/Awfp1314/-"
echo ""
