# PowerShell 启动脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "正在启动后端服务..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# 查找并关闭占用端口 3000-3010 的 Node.js 进程
Write-Host "检查端口占用情况..." -ForegroundColor Yellow
for ($port = 3000; $port -le 3010; $port++) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
    foreach ($conn in $connections) {
        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($process -and $process.ProcessName -eq "node") {
            Write-Host "发现端口 $port 被进程 $($conn.OwningProcess) 占用，正在关闭..." -ForegroundColor Yellow
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "启动后端服务..." -ForegroundColor Green
npm start

