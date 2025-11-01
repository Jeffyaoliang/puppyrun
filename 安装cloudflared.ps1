# Cloudflare Tunnel 自动安装脚本
# 需要以管理员身份运行

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cloudflare Tunnel 安装脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ 需要管理员权限！" -ForegroundColor Red
    Write-Host "请右键点击 PowerShell，选择'以管理员身份运行'" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "✅ 管理员权限确认" -ForegroundColor Green
Write-Host ""

# 下载链接（最新版本）
$downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
$downloadPath = "$env:USERPROFILE\Downloads\cloudflared-windows-amd64.exe"
$installPath = "C:\Windows\System32\cloudflared.exe"

# 步骤 1: 下载
Write-Host "步骤 1: 下载 cloudflared..." -ForegroundColor Yellow
Write-Host "下载地址: $downloadUrl" -ForegroundColor Gray
Write-Host "保存位置: $downloadPath" -ForegroundColor Gray
Write-Host ""

try {
    # 检查是否已存在
    if (Test-Path $downloadPath) {
        Write-Host "✓ 文件已存在，跳过下载" -ForegroundColor Green
    } else {
        Write-Host "正在下载..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $downloadUrl -OutFile $downloadPath -UseBasicParsing
        Write-Host "✓ 下载完成" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ 下载失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请手动下载:" -ForegroundColor Yellow
    Write-Host "1. 访问: https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor Gray
    Write-Host "2. 下载: cloudflared-windows-amd64.exe" -ForegroundColor Gray
    Write-Host "3. 保存到: $downloadPath" -ForegroundColor Gray
    pause
    exit
}

Write-Host ""

# 步骤 2: 安装到系统
Write-Host "步骤 2: 安装到系统..." -ForegroundColor Yellow
Write-Host "目标位置: $installPath" -ForegroundColor Gray
Write-Host ""

try {
    Copy-Item -Path $downloadPath -Destination $installPath -Force
    Write-Host "✓ 安装成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 安装失败: $_" -ForegroundColor Red
    Write-Host "请确保以管理员身份运行此脚本" -ForegroundColor Yellow
    pause
    exit
}

Write-Host ""

# 步骤 3: 验证安装
Write-Host "步骤 3: 验证安装..." -ForegroundColor Yellow
Write-Host ""

try {
    $version = & cloudflared --version 2>&1
    Write-Host "✓ 验证成功" -ForegroundColor Green
    Write-Host ""
    Write-Host "版本信息:" -ForegroundColor Cyan
    Write-Host $version -ForegroundColor White
} catch {
    Write-Host "⚠️  验证失败，但文件已安装" -ForegroundColor Yellow
    Write-Host "请关闭并重新打开 PowerShell 后再试" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "安装完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步: 运行以下命令登录 Cloudflare" -ForegroundColor Yellow
Write-Host "cloudflared tunnel login" -ForegroundColor White
Write-Host ""
pause

