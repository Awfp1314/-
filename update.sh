#!/bin/bash

# ==============================================
# 物联网刷题系统 - 一键热更新脚本
# 功能：自动备份、无损迁移、热重载
# 使用：./update.sh
# ==============================================

set -e

SERVER_IP="47.108.72.126"
SERVER_PORT="2233"
SERVER_USER="root"
SERVER_PASS="Wjj19312985136..."

echo "🔄 开始热更新（用户无感知）..."
echo ""

# 1. 本地打包
echo "📦 [1/3] 打包新版本..."
npm install
npm run build

# 2. 创建更新包（不包含数据）
echo "📦 [2/3] 创建更新包..."
tar -czf update.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='*.md' \
    --exclude='server/data.json' \
    dist/ server/ package.json package-lock.json

# 3. 上传并热更新
echo "🚀 [3/3] 执行热更新..."
sshpass -p "$SERVER_PASS" scp -P $SERVER_PORT update.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

sshpass -p "$SERVER_PASS" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP << 'EOF'
set -e

APP_DIR="/var/www/iot-quiz"
DATA_FILE="$APP_DIR/server/data.json"
BACKUP_DIR="/var/backups/iot-quiz"

cd $APP_DIR

# === 1. 自动备份数据 ===
echo "💾 自动备份数据库..."
mkdir -p $BACKUP_DIR
BACKUP_FILE="data.$(date +%Y%m%d_%H%M%S).json"
cp $DATA_FILE $BACKUP_DIR/$BACKUP_FILE
echo "✓ 备份保存至: $BACKUP_DIR/$BACKUP_FILE"

# 保留最近20个备份
cd $BACKUP_DIR && ls -t data.*.json | tail -n +21 | xargs -r rm && cd $APP_DIR

# === 2. 临时保存数据 ===
echo "📋 保存当前数据..."
cp $DATA_FILE /tmp/data.current.json

# === 3. 解压新版本 ===
echo "📦 解压新版本..."
tar -xzf /tmp/update.tar.gz -C $APP_DIR

# === 4. 智能数据迁移 ===
echo "🔄 数据迁移中..."

# 使用Node.js进行智能合并
node << 'NODESCRIPT'
const fs = require('fs');
const oldData = JSON.parse(fs.readFileSync('/tmp/data.current.json', 'utf-8'));
const newStructure = JSON.parse(fs.readFileSync('/var/www/iot-quiz/server/data.json', 'utf-8') || '{}');

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
        console.log(`✓ 添加新字段: ${key}`);
    }
}

fs.writeFileSync('/var/www/iot-quiz/server/data.json', JSON.stringify(merged, null, 2));
console.log('✓ 数据迁移完成');
NODESCRIPT

# === 5. 更新依赖 ===
echo "📥 更新依赖..."
npm install --production

# === 6. 热重载（零停机）===
echo "♻️  热重载服务..."
pm2 reload all

echo ""
echo "✅ 热更新完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ 数据库：完整保留"
echo "✓ 用户状态：无中断"
echo "✓ 新功能：已生效"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status
EOF

# 清理
rm -f update.tar.gz

echo ""
echo "✨ 更新完成！用户无感知，数据完整！"
