# 简单的照片上传测试脚本

$baseUrl = "http://localhost:3000"
$uploadApi = "$baseUrl/api/questionnaire/upload-photo"

# 查找测试图片
$testImage = Get-ChildItem -Path ".\uploads" -Filter "*.jpg","*.png","*.jpeg" -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $testImage) {
    Write-Host "未找到测试图片，请确保 uploads 目录中有 .jpg 或 .png 文件" -ForegroundColor Yellow
    exit 1
}

Write-Host "测试照片上传接口..." -ForegroundColor Cyan
Write-Host "使用图片: $($testImage.Name)" -ForegroundColor Gray
Write-Host ""

try {
    $form = @{
        photo = Get-Item -Path $testImage.FullName
    }
    
    $response = Invoke-RestMethod -Uri $uploadApi -Method Post -Form $form
    
    Write-Host "✓ 上传成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "响应数据:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host "✗ 上传失败: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

