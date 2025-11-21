#!/bin/bash

# ==============================================
# 物联网刷题系统 - GitHub热更新脚本
# 功能：从GitHub拉取最新代码并热更新
# 使用：./update-github.sh
# ==============================================

set -e

SERVER_IP="47.108.72.126"
SERVER_PORT="2233"
SERVER_USER="root"
SERVER_PASS="Wjj19312985136..."

echo "🔄 开始从GitHub热更新..."
echo ""

sshpass -p "$SERVER_PASS" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP << 'EOF'
set -e

APP_DIR="/var/www/iot-quiz"
BACKUP_DIR="/var/backups/iot-quiz"

cd $APP_DIR

echo "📋 检查Git状态..."
if [ ! -d ".git" ]; then
    echo "❌ 错误：这不是一个Git项目！"
    echo "请先运行 deploy-github.sh 进行首次部署"
    exit 1
fi

# === 1. 自动备份数据 ===
echo "💾 自动备份数据库..."
mkdir -p $BACKUP_DIR
if [ -f "server/data.json" ]; then
    BACKUP_FILE="data.$(date +%Y%m%d_%H%M%S).json"
    cp server/data.json $BACKUP_DIR/$BACKUP_FILE
    echo "✓ 备份保存至: $BACKUP_DIR/$BACKUP_FILE"
    
    # 保留最近20个备份
    cd $BACKUP_DIR && ls -t data.*.json | tail -n +21 | xargs -r rm && cd $APP_DIR
    
    # 临时保存
    cp server/data.json /tmp/data.current.json
fi

# === 2. 拉取最新代码 ===
echo "📥 从GitHub拉取最新代码..."
git fetch origin
git reset --hard origin/main || git reset --hard origin/master

# === 3. 智能数据迁移 ===
echo "🔄 数据迁移中..."
if [ -f "/tmp/data.current.json" ]; then
    # 使用Node.js进行智能合并
    node << 'NODESCRIPT'
const fs = require('fs');
const oldData = JSON.parse(fs.readFileSync('/tmp/data.current.json', 'utf-8'));
const newStructure = fs.existsSync('/var/www/iot-quiz/server/data.json') 
    ? JSON.parse(fs.readFileSync('/var/www/iot-quiz/server/data.json', 'utf-8'))
    : {};

// 保留所有用户数据
const merged = {
    users: oldData.users || [],
    feedbacks: oldData.feedbacks || [],
    errorReports: oldData.errorReports || [],
    notifications: oldData.notifications || [],
    userProgress: oldData.userProgress || [],
    questionBank: oldData.questionBank || [],
    announcement: oldData.announcement || newStructure.announcement || {}
};

// 检测新字段并自动添加默认值
for (let key in newStructure) {
    if (!merged[key]) {
        merged[key] = newStructure[key];
        console.log(\`✓ 添加新字段: \${key}\`);
    }
}

fs.writeFileSync('/var/www/iot-quiz/server/data.json', JSON.stringify(merged, null, 2));
console.log('✓ 数据迁移完成');
NODESCRIPT
    
    rm /tmp/data.current.json
fi

# === 4. 配置npm镜像并安装依赖 ===
echo "⚡ 配置npm镜像加速..."
npm config set registry https://registry.npmmirror.com

echo "📥 安装依赖（使用淘宝镜像）..."
npm install --production

# === 5. 构建前端 ===
echo "🔨 构建前端..."
npm run build

# === 6. 热重载（零停机）===
echo "♻️  热重载服务..."
pm2 reload all

echo ""
echo "✅ 热更新完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ 代码：已更新到最新版本"
echo "✓ 数据库：完整保留"
echo "✓ 用户状态：无中断"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 当前Git提交:"
git log -1 --oneline
echo ""
echo "🔄 应用状态:"
pm2 status
EOF

echo ""
echo "✨ 更新完成！"
