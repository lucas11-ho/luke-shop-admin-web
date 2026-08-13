@echo off
setlocal
cd /d "%~dp0"
call npm run verify
set CODE=%ERRORLEVEL%
if not "%CODE%"=="0" pause
exit /b %CODE%
