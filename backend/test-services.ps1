# 服务模块测试脚本 (PowerShell版本)
# 用于测试AI服务和匹配服务模块

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "服务模块测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js是否安装
try {
    $nodeVersion = node --version
    Write-Host "Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "错误: 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "运行测试脚本..." -ForegroundColor Yellow
Write-Host ""

# 运行测试
node test-services.js

# 检查退出代码
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "测试完成！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "测试失败！" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    exit 1
}

