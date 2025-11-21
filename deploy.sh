#!/bin/bash

# ==============================================
# 物联网刷题系统 - 一键自动部署脚本
# 功能：自动检查依赖、安装、启动服务
# 使用：./deploy.sh
# ==============================================

set -e

SERVER_IP="47.108.72.126"
SERVER_PORT="2233"
SERVER_USER="root"
SERVER_PASS="Wjj19312985136..."

echo "🚀 开始自动部署..."
echo ""

# 1. 本地打包
echo "📦 [1/3] 打包前端..."
npm install
npm run build

# 2. 创建部署包（排除数据文件）
echo "📦 [2/3] 创建部署包..."
tar -czf deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='*.md' \
    dist/ server/ package.json package-lock.json

# 3. 上传并自动部署
echo "🚀 [3/3] 上传并部署到服务器..."
sshpass -p "$SERVER_PASS" scp -P $SERVER_PORT deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

sshpass -p "$SERVER_PASS" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP << 'EOF'
set -e

APP_DIR="/var/www/iot-quiz"
DATA_FILE="$APP_DIR/server/data.json"

echo "📂 准备应用目录..."
mkdir -p $APP_DIR

# 备份现有数据
if [ -f "$DATA_FILE" ]; then
    echo "💾 备份数据库..."
    mkdir -p /var/backups/iot-quiz
    cp $DATA_FILE /var/backups/iot-quiz/data.$(date +%Y%m%d_%H%M%S).json
    mv $DATA_FILE /tmp/data.json.backup
fi

# 解压新版本
echo "📦 解压应用..."
cd $APP_DIR
tar -xzf /tmp/deploy.tar.gz

# 恢复数据
if [ -f "/tmp/data.json.backup" ]; then
    echo "♻️  恢复数据库..."
    mv /tmp/data.json.backup $DATA_FILE
fi

# 自动检查和安装依赖
echo "🔍 检查运行环境..."

# 安装Node.js (如果没有)
if ! command -v node &> /dev/null; then
    echo "📥 安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# 安装PM2 (如果没有)
if ! command -v pm2 &> /dev/null; then
    echo "📥 安装PM2..."
    npm install -g pm2
fi

# 安装项目依赖
echo "📥 安装项目依赖..."
cd $APP_DIR
npm install --production

# 安装serve（前端静态服务）
npm install -g serve

# 停止旧进程
echo "🛑 停止旧进程..."
pm2 delete all 2>/dev/null || true

# 启动后端
echo "🚀 启动后端服务..."
cd $APP_DIR
pm2 start server/server.js --name "iot-backend" \
    --log /var/log/iot-backend.log \
    --error /var/log/iot-backend-error.log

# 启动前端
echo "🚀 启动前端服务..."
pm2 start "npx serve -s dist -l 4000" --name "iot-frontend" \
    --log /var/log/iot-frontend.log

# 保存PM2配置
pm2 save
pm2 startup | tail -1 | bash || true

echo ""
echo "✅ 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 访问地址:"
echo "   前端: http://$SERVER_IP:4000"
echo "   后端: http://$SERVER_IP:3030"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status
EOF

# 清理
rm -f deploy.tar.gz

echo ""
echo "✨ 全部完成！"
