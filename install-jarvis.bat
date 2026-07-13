@echo off
title Vigil AI - Windows Edge Installer
color 0B
cls

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                                                              ║
echo  ║      ░░░░░░░  V.I.G.I.L  ░░░░░░░                             ║
echo  ║      Vigil AI — Chrome/Edge Multi-Swarm Agent IDE            ║
echo  ║                                                              ║
echo  ║      VERSION  18.0  ──  SOVEREIGN INTELLIGENCE               ║
echo  ║      Agents · Multi-Swarm · PSE · NeuroCore · Side Panel     ║
echo  ║                                                              ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
echo  [ INSTALLING INTO MICROSOFT EDGE ]
echo.
echo  Prefers a local build if present, otherwise downloads from main.
echo  No admin rights required.
echo.
pause

:: ── Locate Edge ──────────────────────────────────────────────
set "EDGE64=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "EDGE86=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
set "EDGE_PATH="

if exist "%EDGE64%" set "EDGE_PATH=%EDGE64%"
if exist "%EDGE86%" set "EDGE_PATH=%EDGE86%"

if "%EDGE_PATH%"=="" (
  echo.
  echo  [!] Microsoft Edge not found.
  echo      Get it at: https://microsoft.com/edge
  echo.
  pause
  exit /b 1
)

echo  [✓] Edge found: %EDGE_PATH%

set "INSTALL_DIR=%LOCALAPPDATA%\VigilAI"
set "ZIP_FILE=%TEMP%\vigil-ai-extension.zip"
set "SCRIPT_DIR=%~dp0"
set "LOCAL_V18=%SCRIPT_DIR%dist\extensions\vigil-ai-v18.0.0.zip"
set "LOCAL_JARVIS=%SCRIPT_DIR%dist\extensions\jarvis.zip"
set "DL_V18=https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/vigil-ai-v18.0.0.zip"
set "DL_JARVIS=https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/jarvis.zip"

:: ── Source: local dist first, then GitHub main ───────────────
set "SOURCE_ZIP="
if exist "%LOCAL_V18%" (
  set "SOURCE_ZIP=%LOCAL_V18%"
  echo  [*] Using local package: dist\extensions\vigil-ai-v18.0.0.zip
) else if exist "%LOCAL_JARVIS%" (
  set "SOURCE_ZIP=%LOCAL_JARVIS%"
  echo  [*] Using local package: dist\extensions\jarvis.zip
) else (
  echo  [*] Downloading Vigil AI from GitHub main...
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "try { Invoke-WebRequest -Uri '%DL_V18%' -OutFile '%ZIP_FILE%' -UseBasicParsing; exit 0 } catch { try { Invoke-WebRequest -Uri '%DL_JARVIS%' -OutFile '%ZIP_FILE%' -UseBasicParsing; exit 0 } catch { Write-Host '  [ERR] ' + $_.Exception.Message; exit 1 } }"
  if errorlevel 1 (
    echo.
    echo  [!] Download failed. Check your connection, or clone the repo
    echo      and run this script from the repo root so local dist\ is used.
    pause
    exit /b 1
  )
  set "SOURCE_ZIP=%ZIP_FILE%"
  echo  [OK] Download complete.
)

:: ── Extract ───────────────────────────────────────────────────
echo.
echo  [*] Installing to %INSTALL_DIR%...

if exist "%INSTALL_DIR%" rd /s /q "%INSTALL_DIR%" 2>nul
mkdir "%INSTALL_DIR%" 2>nul

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$src='%SOURCE_ZIP%'; $dest='%INSTALL_DIR%'; Expand-Archive -Path $src -DestinationPath $dest -Force; $m = Get-ChildItem -Path $dest -Recurse -Filter manifest.json | Select-Object -First 1; if (-not $m) { Write-Host '  [ERR] manifest.json not found after extract'; exit 1 }; $root = $m.Directory.FullName; if ($root -ne (Resolve-Path $dest).Path) { Get-ChildItem $root | Move-Item -Destination $dest -Force; $orphan = Get-ChildItem $dest -Directory | Where-Object { -not (Test-Path (Join-Path $_.FullName 'manifest.json')) }; foreach ($o in $orphan) { if (-not (Get-ChildItem $o.FullName -Recurse -Filter manifest.json -EA SilentlyContinue)) { Remove-Item $o.FullName -Recurse -Force -EA SilentlyContinue } } }; if (-not (Test-Path (Join-Path $dest 'manifest.json'))) { Write-Host '  [ERR] Could not normalize extension root'; exit 1 }; Write-Host '  [OK] Extension ready at' $dest"

if errorlevel 1 (
  echo  [!] Extraction failed.
  pause
  exit /b 1
)

:: ── Launch ────────────────────────────────────────────────────
echo.
echo  [*] Launching Edge with Vigil AI loaded...

start "" "%EDGE_PATH%" --load-extension="%INSTALL_DIR%" --no-first-run

timeout /t 3 /nobreak >nul

:: ── Done ──────────────────────────────────────────────────────
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                                                              ║
echo  ║   VIGIL AI  ──  ONLINE                                       ║
echo  ║                                                              ║
echo  ║   Multi-swarm agents · Side panel · Nexus · Offline core     ║
echo  ║   Talk naturally · She does the rest                         ║
echo  ║                                                              ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
echo  HOW TO PIN THE SIDE PANEL:
echo.
echo    1. Look for the puzzle-piece icon in the Edge toolbar
echo    2. Find "Vigil AI" — click the pin icon
echo    3. Or: press  Ctrl+Shift+Y  to open the side panel
echo.
echo  MULTI-SWARM (examples):
echo.
echo    "Deploy a swarm on quantum computing"
echo    "Dispatch multi-agent research on MSAP protocol"
echo    "Launch researcher, scout, and analyst on this topic"
echo.
echo  SINGLE AGENTS:
echo.
echo    "Deploy a researcher on AI, open a writing tab, and scan this page"
echo    "Dispatch mission: crawl this site and synthesize the findings"
echo.
echo  Extension installed at:  %INSTALL_DIR%
echo  Repo: https://github.com/FreddyCreates/potential-succotash
echo.
pause
