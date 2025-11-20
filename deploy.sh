#!/bin/bash

# 物联网刷题系统 - Ubuntu 服务器部署脚本
# 使用方法: bash deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署物联网刷题系统..."

# 检查dist目录
if [ ! -d "dist" ]; then
  echo "❌ 错误: dist目录不存在，请先运行 npm run build"
  exit 1
fi

# 配置（请根据实际情况修改）
SERVER_USER="root"                    # 服务器用户名
SERVER_HOST="your-server-ip"          # 服务器IP地址
DEPLOY_PATH="/var/www/iot-quiz"       # 部署路径
NGINX_CONF="/etc/nginx/sites-available/iot-quiz"

echo "📦 压缩构建文件..."
cd dist
tar -czf ../dist.tar.gz .
cd ..

echo "📤 上传文件到服务器..."
scp dist.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

echo "🔧 在服务器上配置..."
ssh $SERVER_USER@$SERVER_HOST << 'ENDSSH'
  # 创建部署目录
  sudo mkdir -p /var/www/iot-quiz
  
  # 解压文件
  cd /tmp
  sudo tar -xzf dist.tar.gz -C /var/www/iot-quiz
  sudo rm dist.tar.gz
  
  # 设置权限
  sudo chown -R www-data:www-data /var/www/iot-quiz
  sudo chmod -R 755 /var/www/iot-quiz
  
  # 配置Nginx（如果未配置）
  if [ ! -f /etc/nginx/sites-available/iot-quiz ]; then
    echo "创建Nginx配置..."
    sudo tee /etc/nginx/sites-available/iot-quiz > /dev/null << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名或IP
    
    root /var/www/iot-quiz;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 启用gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/iot-quiz /etc/nginx/sites-enabled/
    
    # 测试Nginx配置
    sudo nginx -t
    
    # 重启Nginx
    sudo systemctl reload nginx
    
    echo "✅ Nginx配置完成"
  else
    echo "Nginx配置已存在，重载服务..."
    sudo systemctl reload nginx
  fi
ENDSSH

# 清理本地临时文件
rm dist.tar.gz

echo "✅ 部署完成！"
echo "🌐 访问地址: http://your-server-ip"
echo ""
echo "📝 后续步骤:"
echo "   1. 修改 deploy.sh 中的服务器配置"
echo "   2. 配置域名（可选）"
echo "   3. 配置SSL证书（推荐使用 Let's Encrypt）"
