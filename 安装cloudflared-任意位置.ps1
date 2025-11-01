# Cloudflare Tunnel 安装脚本（支持任意下载位置）
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

# 让用户选择文件位置
Write-Host "请选择 cloudflared-windows-amd64.exe 的保存位置：" -ForegroundColor Yellow
Write-Host ""
Write-Host "如果已下载，请输入完整路径" -ForegroundColor Gray
Write-Host "例如: C:\Users\ustc\Downloads\cloudflared-windows-amd64.exe" -ForegroundColor Gray
Write-Host "或: E:\cloudflared-windows-amd64.exe" -ForegroundColor Gray
Write-Host ""

$filePath = Read-Host "请输入文件路径（或直接回车使用默认位置）"

# 如果没有输入，使用默认位置
if ([string]::IsNullOrWhiteSpace($filePath)) {
    $filePath = "$env:USERPROFILE\Downloads\cloudflared-windows-amd64.exe"
    Write-Host "使用默认位置: $filePath" -ForegroundColor Gray
}

# 检查文件是否存在
if (-not (Test-Path $filePath)) {
    Write-Host ""
    Write-Host "❌ 文件不存在: $filePath" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先下载 cloudflared:" -ForegroundColor Yellow
    Write-Host "1. 访问: https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor Gray
    Write-Host "2. 下载: cloudflared-windows-amd64.exe" -ForegroundColor Gray
    Write-Host "3. 保存到任意位置" -ForegroundColor Gray
    Write-Host "4. 重新运行此脚本并输入文件路径" -ForegroundColor Gray
    pause
    exit
}

Write-Host ""
Write-Host "✓ 找到文件: $filePath" -ForegroundColor Green
Write-Host ""

# 安装到系统
$installPath = "C:\Windows\System32\cloudflared.exe"
Write-Host "正在安装到: $installPath" -ForegroundColor Yellow

try {
    Copy-Item -Path $filePath -Destination $installPath -Force
    Write-Host "✓ 安装成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 安装失败: $_" -ForegroundColor Red
    pause
    exit
}

Write-Host ""

# 验证安装
Write-Host "验证安装..." -ForegroundColor Yellow
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

