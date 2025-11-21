#!/bin/bash

# ==============================================
# 快速推送到GitHub
# 使用：./push.sh "提交说明"
# ==============================================

set -e

# 获取提交信息
COMMIT_MSG="${1:-更新代码}"

echo "📤 准备推送到GitHub..."
echo "提交信息: $COMMIT_MSG"
echo ""

# 检查是否已初始化Git
if [ ! -d ".git" ]; then
    echo "🔧 初始化Git仓库..."
    git init
    git branch -M main
    git remote add origin git@github.com:Awfp1314/-.git
fi

# 添加所有更改
echo "📝 添加文件..."
git add .

# 提交
echo "💾 提交更改..."
git commit -m "$COMMIT_MSG" || echo "没有新的更改"

# 推送
echo "🚀 推送到GitHub..."
git push -u origin main

echo ""
echo "✅ 推送完成！"
echo "🌐 查看仓库: https://github.com/Awfp1314/-"
