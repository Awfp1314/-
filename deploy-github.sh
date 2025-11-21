#!/bin/bash

# ==============================================
# 物联网刷题系统 - GitHub自动部署脚本
# 功能：从GitHub克隆项目并自动部署
# 使用：./deploy-github.sh
# ==============================================

set -e

SERVER_IP="47.108.72.126"
SERVER_PORT="2233"
SERVER_USER="root"
SERVER_PASS="Wjj19312985136..."

# GitHub仓库地址（已配置）
GITHUB_REPO="git@github.com:Awfp1314/-.git"

echo "🚀 开始从GitHub部署..."
echo ""

sshpass -p "$SERVER_PASS" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP << EOF
set -e

APP_DIR="/var/www/iot-quiz"
GITHUB_REPO="$GITHUB_REPO"

echo "🔍 检查运行环境..."

# 安装Git
if ! command -v git &> /dev/null; then
    echo "📥 安装Git..."
    apt-get update
    apt-get install -y git
fi

# 配置Git SSH（使用已有密钥）
echo "🔑 配置GitHub SSH访问..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 配置SSH以跳过主机验证
if ! grep -q "github.com" ~/.ssh/config 2>/dev/null; then
    cat >> ~/.ssh/config << 'SSHCONFIG'
Host github.com
    HostName github.com
    User git
    StrictHostKeyChecking no
    UserKnownHostsFile=/dev/null
SSHCONFIG
    chmod 600 ~/.ssh/config
fi

# 设置Git配置（如果还没有）
git config --global user.email "admin@iot-quiz.com" || true
git config --global user.name "IOT Quiz Admin" || true

# 安装Node.js
if ! command -v node &> /dev/null; then
    echo "📥 安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# 安装PM2
if ! command -v pm2 &> /dev/null; then
    echo "📥 安装PM2..."
    npm install -g pm2
fi

# 克隆或更新代码
if [ -d "\$APP_DIR/.git" ]; then
    echo "📂 项目已存在，更新代码..."
    cd \$APP_DIR
    
    # 备份数据
    if [ -f "server/data.json" ]; then
        echo "💾 备份数据..."
        mkdir -p /var/backups/iot-quiz
        cp server/data.json /var/backups/iot-quiz/data.\$(date +%Y%m%d_%H%M%S).json
        cp server/data.json /tmp/data.backup.json
    fi
    
    git pull origin main || git pull origin master
    
    # 恢复数据
    if [ -f "/tmp/data.backup.json" ]; then
        echo "♻️  恢复数据..."
        cp /tmp/data.backup.json server/data.json
        rm /tmp/data.backup.json
    fi
else
    echo "📥 从GitHub克隆项目..."
    rm -rf \$APP_DIR
    git clone \$GITHUB_REPO \$APP_DIR
    cd \$APP_DIR
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建前端
echo "🔨 构建前端..."
npm run build

# 安装serve
npm install -g serve

# 停止旧进程
echo "🛑 停止旧进程..."
pm2 delete all 2>/dev/null || true

# 启动后端
echo "🚀 启动后端..."
pm2 start server/server.js --name "iot-backend" \\
    --log /var/log/iot-backend.log \\
    --error /var/log/iot-backend-error.log

# 启动前端
echo "🚀 启动前端..."
pm2 start "npx serve -s dist -l 4000" --name "iot-frontend" \\
    --log /var/log/iot-frontend.log

# 保存PM2配置
pm2 save
pm2 startup | tail -1 | bash || true

echo ""
echo "✅ 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 访问地址:"
echo "   前端: http://47.108.72.126:4000"
echo "   后端: http://47.108.72.126:3030"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status
EOF

echo ""
echo "✨ 部署完成！"
