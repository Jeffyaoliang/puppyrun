@echo off
chcp 65001 >nul
echo ========================================
echo 服务模块测试
echo ========================================
echo.

REM 检查Node.js是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js，请先安装 Node.js
    exit /b 1
)

echo 运行测试脚本...
echo.

REM 运行测试
node test-services.js

REM 检查退出代码
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo 测试完成！
    echo ========================================
) else (
    echo.
    echo ========================================
    echo 测试失败！
    echo ========================================
    exit /b 1
)

pause

