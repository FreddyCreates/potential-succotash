@echo off
REM ═══════════════════════════════════════════════════════════════
REM  build-desktop.bat — Vigil AI Windows Desktop Builder
REM
REM  Requirements: Node.js 18+  (node, npm on PATH)
REM  Output (version read from desktop/package.json):
REM    dist\desktop\Vigil AI Setup <version>.exe   (NSIS installer)
REM    dist\desktop\Vigil AI <version>.exe         (portable)
REM ═══════════════════════════════════════════════════════════════

setlocal EnableDelayedExpansion

echo.
echo  ██╗   ██╗██╗ ██████╗ ██╗██╗      █████╗ ██╗
echo  ██║   ██║██║██╔════╝ ██║██║     ██╔══██╗██║
echo  ██║   ██║██║██║  ███╗██║██║     ███████║██║
echo  ╚██╗ ██╔╝██║██║   ██║██║██║     ██╔══██║██║
echo   ╚████╔╝ ██║╚██████╔╝██║███████╗██║  ██║██║
echo    ╚═══╝  ╚═╝ ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝
echo.
echo  Desktop App Builder  v18.0.0
echo  ─────────────────────────────────────────────
echo.

REM ── Check Node.js ────────────────────────────────────────────────
where node >nul 2>nul
if errorlevel 1 (
    echo  [ERROR] Node.js not found. Install Node.js 18+ from https://nodejs.org
    exit /b 1
)

for /f "tokens=1 delims=v" %%V in ('node -e "process.stdout.write(process.version)"') do set NODEVER=%%V
echo  [INFO]  Node.js detected: %NODEVER%

REM ── Read version from desktop/package.json ───────────────────────
for /f "tokens=2 delims=:, " %%V in ('node -e "process.stdout.write(require('./desktop/package.json').version)"') do set APPVER=%%~V
if "%APPVER%"=="" set APPVER=18.0.0

REM ── Install desktop dependencies ──────────────────────────────────
echo.
echo  [1/3] Installing Electron dependencies...
echo.
cd /d "%~dp0desktop"
call npm install
if errorlevel 1 (
    echo  [ERROR] npm install failed. Check your internet connection.
    exit /b 1
)

REM ── Build the extension (copy / validate source files) ────────────
echo.
echo  [2/3] Validating Vigil AI extension source...
echo.
cd /d "%~dp0"
if not exist "extensions\jarvis\sidepanel.html" (
    echo  [ERROR] extensions\jarvis\sidepanel.html not found.
    echo          Run this script from the repository root directory.
    exit /b 1
)
if not exist "extensions\jarvis\background.js" (
    echo  [ERROR] extensions\jarvis\background.js not found.
    exit /b 1
)
echo  [INFO]  Extension source OK.

REM ── Package with electron-builder ────────────────────────────────
echo.
echo  [3/3] Building Windows installer and portable executable...
echo.
cd /d "%~dp0desktop"
call npm run dist
if errorlevel 1 (
    echo  [ERROR] electron-builder failed. See output above.
    exit /b 1
)

REM ── Done ──────────────────────────────────────────────────────────
echo.
echo  ─────────────────────────────────────────────
echo  [DONE]  Build complete!
echo.
echo  Output files:
if exist "..\dist\desktop" (
    for %%F in ("..\dist\desktop\*.exe") do echo    %%F
)
echo.
echo  To install: run "Vigil AI Setup %APPVER%.exe"
echo  To run portable: run "Vigil AI %APPVER%.exe"
echo.

cd /d "%~dp0"
endlocal
