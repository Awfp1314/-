@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ╔═══════════════════════════════════════╗
echo ║     物联网刷题系统 - 一键发布         ║
echo ╚═══════════════════════════════════════╝
echo.

set "COMMIT_MSG=%~1"
if "%COMMIT_MSG%"=="" set "COMMIT_MSG=更新代码"

echo 📤 [1/2] 推送到GitHub...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM 检查Git是否初始化
if not exist ".git" (
    echo 🔧 首次使用，初始化Git...
    git init
    git branch -M main
    git remote add origin git@github.com:Awfp1314/-.git
)

git add .
git commit -m "%COMMIT_MSG%"
if errorlevel 1 echo ⚠️  没有新的更改
git push -u origin main

echo.
echo ✓ GitHub推送完成
echo.

echo 🚀 [2/2] 部署到服务器...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM 使用WSL运行部署脚本
bash update-github.sh

echo.
echo ╔═══════════════════════════════════════╗
echo ║            ✨ 发布完成！              ║
echo ╚═══════════════════════════════════════╝
echo.
echo 📍 访问地址:
echo    🌐 前端: http://47.108.72.126:4000
echo    🔧 后端: http://47.108.72.126:3030
echo.
echo 📝 提交信息: %COMMIT_MSG%
echo 🌐 GitHub: https://github.com/Awfp1314/-
echo.

pause
