# 📡 物联网安调在线刷题系统

基于 **React + Vite** 的现代化刷题系统，自动解析本地 Markdown 题库文件。

## ✨ 功能特性

- 🎯 **全库顺序练习** - 按序刷所有题目
- ⏱️ **限时随机模考** - 模拟真实考试
- ⚡ **闪电刷题模式** - 动画抽题，趣味学习
- 📔 **智能错题本** - 自动记录错题，答对自动移除
- 📊 **学习统计** - 累计刷题数、正确率统计
- 📥 **多格式导出** - 支持PDF、Word、Markdown、TXT

## 🚀 快速开始

### 1. 安装依赖

```bash
# 进入项目目录
cd c:\Users\wang\Desktop\sort

# 安装Node.js依赖
npm install
```

### 2. 解析题库

系统会自动解析 `题库ProMax.md` 文件：

```bash
npm run parse
```

成功后会在 `src/questionBank.js` 生成题库文件。

### 3. 本地运行

```bash
npm run dev
```

浏览器访问：`http://localhost:3000`

### 4. 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 📂 项目结构

```
sort/
├── index.html              # HTML入口
├── package.json            # 项目配置
├── vite.config.js          # Vite配置
├── tailwind.config.js      # Tailwind配置
├── postcss.config.js       # PostCSS配置
├── 题库ProMax.md           # 原始题库文件（Markdown）
├── scripts/
│   └── parseQuestions.js   # 题库解析脚本
├── src/
│   ├── main.jsx            # React入口
│   ├── App.jsx             # 主应用组件
│   ├── index.css           # 全局样式
│   └── questionBank.js     # 自动生成的题库（运行parse后生成）
├── dist/                   # 构建输出目录
├── deploy.sh               # Ubuntu完整部署脚本
├── deploy-simple.sh        # 简化部署脚本
└── README.md               # 本文件
```

## 🌐 Ubuntu 服务器部署

### 方案一：完整自动化部署

**前置要求：**
- Ubuntu 20.04+ 服务器
- 已安装 Nginx
- 已配置SSH密钥认证

**步骤：**

1. **修改部署配置**

   编辑 `deploy.sh`，修改以下变量：
   ```bash
   SERVER_USER="root"              # 你的服务器用户名
   SERVER_HOST="your-server-ip"    # 你的服务器IP
   DEPLOY_PATH="/var/www/iot-quiz" # 部署路径
   ```

2. **构建并部署**

   ```bash
   npm run build    # 构建项目
   bash deploy.sh   # 部署到服务器
   ```

3. **配置域名（可选）**

   登录服务器，编辑Nginx配置：
   ```bash
   sudo nano /etc/nginx/sites-available/iot-quiz
   ```
   
   修改 `server_name` 为你的域名：
   ```nginx
   server_name iot.example.com;
   ```
   
   重启Nginx：
   ```bash
   sudo systemctl reload nginx
   ```

### 方案二：手动部署

1. **服务器上安装Nginx**

   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```

2. **上传构建文件**

   在本地构建：
   ```bash
   npm run build
   ```
   
   上传到服务器：
   ```bash
   scp -r dist/* root@your-server:/var/www/iot-quiz/
   ```

3. **配置Nginx**

   创建配置文件：
   ```bash
   sudo nano /etc/nginx/sites-available/iot-quiz
   ```
   
   添加以下内容：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       root /var/www/iot-quiz;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # 启用gzip
       gzip on;
       gzip_types text/plain text/css application/json application/javascript;
       
       # 缓存静态资源
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```
   
   启用站点：
   ```bash
   sudo ln -s /etc/nginx/sites-available/iot-quiz /etc/nginx/sites-enabled/
   sudo nginx -t          # 测试配置
   sudo systemctl reload nginx
   ```

4. **配置SSL（推荐）**

   使用 Let's Encrypt 免费证书：
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

### 方案三：Docker部署（推荐）

1. **创建 Dockerfile**

   在项目根目录创建：
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run parse && npm run build
   
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **创建 nginx.conf**

   ```nginx
   server {
       listen 80;
       location / {
           root /usr/share/nginx/html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **构建并运行**

   ```bash
   docker build -t iot-quiz .
   docker run -d -p 80:80 --name iot-quiz-app iot-quiz
   ```

## 📝 题库格式说明

系统自动解析 `题库ProMax.md`，格式如下：

```markdown
## 分类名称

### 题目 1
题目内容？
A. 选项A
B. 选项B
C. 选项C
D. 选项D
答案：C ✅
**解析**: 这里是解析内容。

---

### 题目 2
...
```

**注意事项：**
- 每次修改题库后需重新运行 `npm run parse`
- 支持单选题和多选题（答案用逗号分隔）
- 解析会自动识别分类和题目编号

## 🔧 开发说明

### 技术栈

- **前端框架**: React 18
- **构建工具**: Vite 5
- **样式**: Tailwind CSS 3
- **图标**: Lucide React
- **存储**: LocalStorage

### 修改配置

**修改考试倒计时日期**

编辑 `src/App.jsx` 第231行：
```javascript
let targetDate = new Date(currentYear, 10, 22, 8, 0, 0);
// 月份从0开始，10代表11月，修改为你的考试日期
```

**修改模考题数和时长**

编辑 `src/App.jsx` 第426-428行：
```javascript
const shuffled = shuffleArray(QUESTION_BANK).slice(0, 10); // 题数
setTimeLeft(600); // 时间（秒），600秒=10分钟
```

## 🐛 常见问题

### 1. 安装依赖失败

```bash
# 清理缓存
npm cache clean --force
# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

### 2. 题库解析失败

检查 `题库ProMax.md` 格式是否正确，运行：
```bash
npm run parse
```
查看控制台输出的错误信息。

### 3. 服务器部署后无法访问

- 检查服务器防火墙是否开放80端口
- 检查Nginx是否正常运行：`sudo systemctl status nginx`
- 查看Nginx错误日志：`sudo tail -f /var/log/nginx/error.log`

### 4. 刷新页面404错误

确保Nginx配置了 `try_files $uri $uri/ /index.html;`

## 📊 性能优化

- ✅ Gzip压缩
- ✅ 静态资源缓存
- ✅ 代码分割（Vite自动）
- ✅ 按需加载

## 📄 许可证

MIT License

## 👨‍💻 作者

GitHub: [@Awfp1314](https://github.com/Awfp1314)

---

**祝你考试顺利！ 🎉**
