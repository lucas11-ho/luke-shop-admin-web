@echo off
setlocal
cd /d "%~dp0"
echo =============================================================
echo Luke Shop Admin Web v0.8.0 - Visual Store Designer v3
echo =============================================================
where node >nul 2>&1 || (echo ERROR: Node.js is required.& pause & exit /b 1)
for /f "tokens=*" %%i in ('node -p "process.versions.node"') do set NODEVER=%%i
echo Node: %NODEVER%
if not exist .env (
  copy /y .env.example .env >nul
  echo Created .env from .env.example
)
echo.
echo [1/4] Installing dependencies...
call npm install --no-audit --no-fund
if errorlevel 1 (echo ERROR: npm install failed.& pause & exit /b 1)
echo [2/4] Verifying source...
call npm run verify
if errorlevel 1 (echo ERROR: verify failed.& pause & exit /b 1)
echo [3/4] Building production bundle...
call npm run build
if errorlevel 1 (echo ERROR: production build failed.& pause & exit /b 1)
echo [4/4] Starting Admin Web on http://localhost:4173 ...
echo Press Ctrl+C to stop.
call npm run dev
endlocal
