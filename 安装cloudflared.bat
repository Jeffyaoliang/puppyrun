@echo off
echo ========================================
echo Cloudflare Tunnel 安装脚本
echo ========================================
echo.

echo 步骤 1: 检查是否已下载 cloudflared...
if exist "%USERPROFILE%\Downloads\cloudflared-windows-amd64.exe" (
    echo 找到下载文件！
    echo.
    echo 步骤 2: 安装到系统...
    copy "%USERPROFILE%\Downloads\cloudflared-windows-amd64.exe" "C:\Windows\System32\cloudflared.exe"
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ 安装成功！
        echo.
        echo 步骤 3: 验证安装...
        cloudflared --version
        echo.
        echo ========================================
        echo 安装完成！现在可以运行下一步命令：
        echo cloudflared tunnel login
        echo ========================================
    ) else (
        echo.
        echo ❌ 安装失败！请以管理员身份运行此脚本。
    )
) else (
    echo.
    echo ❌ 未找到下载文件！
    echo.
    echo 请先下载 cloudflared：
    echo 1. 访问: https://github.com/cloudflare/cloudflared/releases/latest
    echo 2. 下载: cloudflared-windows-amd64.exe
    echo 3. 保存到: %USERPROFILE%\Downloads\
    echo 4. 然后以管理员身份运行此脚本
    echo.
    pause
)

