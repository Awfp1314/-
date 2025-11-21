# 物联网刷题系统 - 自动部署到云服务器

$SERVER = "47.108.72.126"
$PORT = "2233"
$USER = "root"
$PASS = "Wjj19312985136..."

Write-Host "🚀 开始自动部署..." -ForegroundColor Green
Write-Host ""

# 创建部署脚本
$deployScript = @"
#!/bin/bash
set -e

echo '📂 准备环境...'

# 安装Git
if ! command -v git &> /dev/null; then
    echo '📥 安装Git...'
    apt-get update
    apt-get install -y git
fi

# 配置SSH
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat >> ~/.ssh/config << 'SSHCONFIG'
Host github.com
    HostName github.com
    User git
    StrictHostKeyChecking no
    UserKnownHostsFile=/dev/null
SSHCONFIG
chmod 600 ~/.ssh/config

# 配置Git
git config --global user.email 'admin@iot-quiz.com'
git config --global user.name 'IOT Quiz Admin'

# 安装Node.js
if ! command -v node &> /dev/null; then
    echo '📥 安装Node.js...'
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# 安装PM2
if ! command -v pm2 &> /dev/null; then
    echo '📥 安装PM2...'
    npm install -g pm2
fi

# 安装serve
npm install -g serve

# 克隆或更新项目
APP_DIR='/var/www/iot-quiz'
if [ -d \$APP_DIR ]; then
    echo '🔄 项目已存在，更新代码...'
    cd \$APP_DIR
    
    # 备份数据
    if [ -f 'server/data.json' ]; then
        mkdir -p /var/backups/iot-quiz
        cp server/data.json /var/backups/iot-quiz/data.\$(date +%Y%m%d_%H%M%S).json
        cp server/data.json /tmp/data.backup.json
    fi
    
    git pull origin main || git pull origin master
    
    # 恢复数据
    if [ -f '/tmp/data.backup.json' ]; then
        cp /tmp/data.backup.json server/data.json
    fi
else
    echo '📥 克隆项目...'
    mkdir -p /var/www
    cd /var/www
    git clone git@github.com:Awfp1314/-.git iot-quiz
    cd iot-quiz
fi

cd /var/www/iot-quiz

# 安装依赖
echo '📦 安装依赖...'
npm install

# 构建前端
echo '🔨 构建前端...'
npm run build

# 停止旧进程
echo '🛑 停止旧进程...'
pm2 delete all 2>/dev/null || true

# 启动后端
echo '🚀 启动后端...'
pm2 start server/server.js --name 'iot-backend' --log /var/log/iot-backend.log --error /var/log/iot-backend-error.log

# 启动前端
echo '🚀 启动前端...'
pm2 start 'npx serve -s dist -l 4000' --name 'iot-frontend' --log /var/log/iot-frontend.log

# 保存配置
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

echo ''
echo '✅ 部署完成！'
echo '━━━━━━━━━━━━━━━━━━━━━━━━'
echo '🌐 前端: http://47.108.72.126:4000'
echo '🔧 后端: http://47.108.72.126:3030'
echo '━━━━━━━━━━━━━━━━━━━━━━━━'
pm2 status
"@

# 保存脚本到临时文件
$tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
$deployScript | Out-File -FilePath $tempScript -Encoding UTF8

Write-Host "📝 部署脚本已创建" -ForegroundColor Cyan
Write-Host "📤 正在连接服务器..." -ForegroundColor Cyan

# 使用plink (PuTTY的命令行工具)
Write-Host ""
Write-Host "⚠️  请使用以下命令手动部署：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 打开 Git Bash (如果安装了Git)" -ForegroundColor White
Write-Host "2. 运行: bash deploy-github.sh" -ForegroundColor White
Write-Host ""
Write-Host "或者" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. SSH登录服务器: ssh -p 2233 root@47.108.72.126" -ForegroundColor White
Write-Host "2. 运行以下命令:" -ForegroundColor White
Write-Host ""
Write-Host $deployScript -ForegroundColor Gray
