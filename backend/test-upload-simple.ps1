# 照片上传测试脚本
# 使用方法: .\test-upload-simple.ps1 "D:\photo\Screenshots\images.jpg"

param(
    [Parameter(Mandatory=$true)]
    [string]$ImagePath
)

$baseUrl = "http://localhost:3000"
$uploadApi = "$baseUrl/api/questionnaire/upload-photo"

# 检查文件是否存在
if (-not (Test-Path $ImagePath)) {
    Write-Host "错误: 文件不存在: $ImagePath" -ForegroundColor Red
    exit 1
}

Write-Host "正在上传图片: $ImagePath" -ForegroundColor Cyan
Write-Host "API地址: $uploadApi" -ForegroundColor Gray
Write-Host ""

try {
    $form = @{
        photo = Get-Item -Path $ImagePath
    }
    
    $response = Invoke-RestMethod -Uri $uploadApi -Method Post -Form $form
    
    Write-Host "上传成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "响应数据:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host "上传失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "错误详情: $responseBody" -ForegroundColor Red
    }
}

