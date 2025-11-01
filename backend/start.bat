@echo off
chcp 65001 >nul
echo ========================================
echo 正在启动后端服务...
echo ========================================

REM 查找并关闭占用端口 3000-3010 的 Node.js 进程
echo 检查端口占用情况...
for /L %%p in (3000,1,3010) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING 2^>nul') do (
        echo 发现端口 %%p 被进程 %%a 占用，正在关闭...
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo 启动后端服务...
npm start

pause

