@echo off
chcp 65001 >nul
echo ========================================
echo 后端 API 测试
echo ========================================
echo.

echo [测试 1] 基础连接测试...
curl -s http://localhost:3000/api/test
echo.
echo.

echo [测试 2] 候选人详情接口测试...
curl -s http://localhost:3000/api/match/candidate/1
echo.
echo.

echo [测试 3] 候选人列表接口测试...
curl -s http://localhost:3000/api/match/candidates
echo.
echo.

echo ========================================
echo 测试完成！
echo ========================================
pause

