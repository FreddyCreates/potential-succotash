@echo off
title Vigil AI - Google Chrome Installer
color 0B
cls

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                                                              ║
echo  ║      ░░░░░░░  V.I.G.I.L  ░░░░░░░                             ║
echo  ║      Vigil AI — Chrome Multi-Swarm Agent IDE                 ║
echo  ║                                                              ║
echo  ║      VERSION  18.0  ──  COMMERCIAL PACK                      ║
echo  ║      Agents · Multi-Swarm · Side Panel · Offline core        ║
echo  ║                                                              ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
echo  [ INSTALLING INTO GOOGLE CHROME ]
echo.
echo  Prefers a local build if present, otherwise downloads from main.
echo  No admin rights required.
echo.
pause

:: ── Locate Chrome ────────────────────────────────────────────
set "CHROME64=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "CHROME86=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
set "CHROME_LOCAL=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
set "CHROME_PATH="

if exist "%CHROME64%" set "CHROME_PATH=%CHROME64%"
if exist "%CHROME86%" set "CHROME_PATH=%CHROME86%"
if exist "%CHROME_LOCAL%" set "CHROME_PATH=%CHROME_LOCAL%"

if "%CHROME_PATH%"=="" (
  echo.
  echo  [!] Google Chrome not found.
  echo      Get it at: https://www.google.com/chrome/
  echo      Or use install-jarvis.bat for Microsoft Edge.
  echo.
  pause
  exit /b 1
)

echo  [✓] Chrome found: %CHROME_PATH%

set "INSTALL_DIR=%LOCALAPPDATA%\VigilAI"
set "ZIP_FILE=%TEMP%\vigil-ai-extension.zip"
set "SCRIPT_DIR=%~dp0"
set "LOCAL_V18=%SCRIPT_DIR%dist\extensions\vigil-ai-v18.0.0.zip"
set "LOCAL_JARVIS=%SCRIPT_DIR%dist\extensions\jarvis.zip"
set "LOCAL_EXT=%SCRIPT_DIR%extension\vigil-ai-v18.0.0.zip"
set "DL_V18=https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/vigil-ai-v18.0.0.zip"
set "DL_JARVIS=https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/jarvis.zip"

:: ── Source: local dist first, commercial pack layout, then GitHub ─
set "SOURCE_ZIP="
if exist "%LOCAL_V18%" (
  set "SOURCE_ZIP=%LOCAL_V18%"
  echo  [*] Using local package: dist\extensions\vigil-ai-v18.0.0.zip
) else if exist "%LOCAL_JARVIS%" (
  set "SOURCE_ZIP=%LOCAL_JARVIS%"
  echo  [*] Using local package: dist\extensions\jarvis.zip
) else if exist "%LOCAL_EXT%" (
  set "SOURCE_ZIP=%LOCAL_EXT%"
  echo  [*] Using commercial pack: extension\vigil-ai-v18.0.0.zip
) else (
  echo  [*] Downloading Vigil AI from GitHub main...
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "try { Invoke-WebRequest -Uri '%DL_V18%' -OutFile '%ZIP_FILE%' -UseBasicParsing; exit 0 } catch { try { Invoke-WebRequest -Uri '%DL_JARVIS%' -OutFile '%ZIP_FILE%' -UseBasicParsing; exit 0 } catch { Write-Host '  [ERR] ' + $_.Exception.Message; exit 1 } }"
  if errorlevel 1 (
    echo.
    echo  [!] Download failed. Check your connection, or place the zip under dist\extensions\.
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
  "$src='%SOURCE_ZIP%'; $dest='%INSTALL_DIR%'; Expand-Archive -Path $src -DestinationPath $dest -Force; $m = Get-ChildItem -Path $dest -Recurse -Filter manifest.json | Select-Object -First 1; if (-not $m) { Write-Host '  [ERR] manifest.json not found after extract'; exit 1 }; $root = $m.Directory.FullName; if ($root -ne (Resolve-Path $dest).Path) { Get-ChildItem $root | Move-Item -Destination $dest -Force }; if (-not (Test-Path (Join-Path $dest 'manifest.json'))) { Write-Host '  [ERR] Could not normalize extension root'; exit 1 }; Write-Host '  [OK] Extension ready at' $dest"

if errorlevel 1 (
  echo  [!] Extraction failed.
  pause
  exit /b 1
)

:: ── Launch ────────────────────────────────────────────────────
echo.
echo  [*] Launching Chrome with Vigil AI loaded...

start "" "%CHROME_PATH%" --load-extension="%INSTALL_DIR%" --no-first-run --new-window "about:blank"

timeout /t 3 /nobreak >nul

cls
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║   VIGIL AI  ──  ONLINE IN CHROME                             ║
echo  ║                                                              ║
echo  ║   Pin the extension from the puzzle icon, then open side     ║
echo  ║   panel. Multi-swarm: "deploy a swarm on [topic]"            ║
echo  ║                                                              ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
echo  Extension installed at:  %INSTALL_DIR%
echo  Repo: https://github.com/FreddyCreates/potential-succotash
echo  Release: https://github.com/FreddyCreates/potential-succotash/releases/tag/v18.0.0-commercial
echo.
pause
