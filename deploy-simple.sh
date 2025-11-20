#!/bin/bash

# 简化版部署脚本 - 仅上传文件
# 使用方法: bash deploy-simple.sh

set -e

echo "🚀 开始上传文件到服务器..."

# 配置（请修改为你的服务器信息）
SERVER_USER="root"
SERVER_HOST="your-server-ip"
DEPLOY_PATH="/var/www/iot-quiz"

# 检查dist目录
if [ ! -d "dist" ]; then
  echo "❌ 错误: dist目录不存在，请先运行 npm run build"
  exit 1
fi

# 使用rsync上传（更高效）
echo "📤 使用rsync同步文件..."
rsync -avz --delete dist/ $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/

echo "✅ 上传完成！"
echo "🌐 访问地址: http://$SERVER_HOST"
