# 后端 API 测试脚本
# 用于验证后端服务是否正常运行

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "后端 API 测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 测试基础配置
$baseUrl = "http://localhost:3000"
$testApi = "$baseUrl/api/test"

Write-Host "测试服务器: $baseUrl" -ForegroundColor Yellow
Write-Host ""

# 测试1: 基础连接测试
Write-Host "[测试 1] 基础连接测试..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri $testApi -Method Get -ErrorAction Stop
    Write-Host "✓ 连接成功！" -ForegroundColor Green
    Write-Host "  响应数据: " -NoNewline
    Write-Host ($response | ConvertTo-Json -Compress) -ForegroundColor White
    Write-Host "  服务器时间: $($response.data.timestamp)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ 连接失败: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# 测试2: 候选人详情接口
Write-Host "[测试 2] 候选人详情接口测试..." -ForegroundColor Green
try {
    $candidateApi = "$baseUrl/api/match/candidate/1"
    $response = Invoke-RestMethod -Uri $candidateApi -Method Get -ErrorAction Stop
    Write-Host "✓ 接口响应成功！" -ForegroundColor Green
    Write-Host "  用户ID: $($response.data.userId)" -ForegroundColor White
    Write-Host "  昵称: $($response.data.nickname)" -ForegroundColor White
    Write-Host "  匹配分数: $($response.data.matchScore)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ 接口测试失败: $_" -ForegroundColor Red
    Write-Host ""
}

# 测试3: 候选人列表接口
Write-Host "[测试 3] 候选人列表接口测试..." -ForegroundColor Green
try {
    $candidatesApi = "$baseUrl/api/match/candidates"
    $response = Invoke-RestMethod -Uri $candidatesApi -Method Get -ErrorAction Stop
    Write-Host "✓ 接口响应成功！" -ForegroundColor Green
    Write-Host "  候选人数量: $($response.data.total)" -ForegroundColor White
    Write-Host "  是否有更多: $($response.data.hasMore)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ 接口测试失败: $_" -ForegroundColor Red
    Write-Host ""
}

# 测试4: 照片上传接口（AI服务测试）
Write-Host "[测试 4] 照片上传接口（AI服务）测试..." -ForegroundColor Green
try {
    # 检查是否有测试图片
    $testImagePath = Get-ChildItem -Path ".\uploads" -Filter "*.jpg","*.png","*.jpeg" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if ($testImagePath) {
        $uploadApi = "$baseUrl/api/questionnaire/upload-photo"
        $form = @{
            photo = Get-Item -Path $testImagePath.FullName
        }
        
        $response = Invoke-RestMethod -Uri $uploadApi -Method Post -Form $form -ErrorAction Stop
        Write-Host "✓ 照片上传成功！" -ForegroundColor Green
        Write-Host "  图片URL: $($response.data.url)" -ForegroundColor White
        Write-Host "  质量评分: $($response.data.qualityScore)" -ForegroundColor White
        Write-Host "  AI评分:" -ForegroundColor White
        if ($response.data.aiScores) {
            $aiScoresJson = $response.data.aiScores | ConvertTo-Json -Compress
            Write-Host "    $aiScoresJson" -ForegroundColor Gray
        }
        Write-Host "  检测到人脸: $($response.data.faceDetected)" -ForegroundColor White
        Write-Host "  AI分析成功: $($response.data.aiAnalysisSuccess)" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "⚠ 未找到测试图片，跳过照片上传测试" -ForegroundColor Yellow
        Write-Host "  提示: 在 uploads 目录放置 .jpg 或 .png 图片进行测试" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "✗ 照片上传测试失败: $_" -ForegroundColor Red
    Write-Host ""
}

# 测试5: 检查端口占用
Write-Host "[测试 5] 检查服务端口..." -ForegroundColor Green
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
if ($port3000) {
    Write-Host "✓ 端口 3000 正在监听" -ForegroundColor Green
    Write-Host "  进程ID: $($port3000.OwningProcess)" -ForegroundColor Gray
} else {
    Write-Host "✗ 端口 3000 未监听" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

