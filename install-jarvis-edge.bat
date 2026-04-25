@echo off
title JARVIS AI v2.0 - Microsoft Edge Installer
color 0B
cls

echo.
echo  ==========================================
echo    JARVIS AI v2.0  -  Edge Installer
echo    AI Sovereign Assistant for Windows
echo  ==========================================
echo.
echo  This will download and install JARVIS AI
echo  into Microsoft Edge on your computer.
echo.
pause

:: Check for Edge
set "EDGE64=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "EDGE86=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
set "EDGE_PATH="

if exist "%EDGE64%" set "EDGE_PATH=%EDGE64%"
if exist "%EDGE86%" set "EDGE_PATH=%EDGE86%"

if "%EDGE_PATH%"=="" (
  echo.
  echo  [!] Microsoft Edge not found at default location.
  echo      Please install Edge from https://microsoft.com/edge
  echo.
  pause
  exit /b 1
)

echo.
echo  [*] Edge found: %EDGE_PATH%
echo.

:: Set install directory
set "INSTALL_DIR=%LOCALAPPDATA%\JarvisAI"
set "ZIP_FILE=%TEMP%\jarvis-extension.zip"
set "DL_URL=https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/jarvis.zip"

echo  [*] Downloading JARVIS AI extension...
echo      From: %DL_URL%
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -Uri '%DL_URL%' -OutFile '%ZIP_FILE%' -UseBasicParsing; Write-Host '  [OK] Download complete.' } catch { Write-Host '  [ERR] Download failed: ' + $_.Exception.Message; exit 1 }"

if errorlevel 1 (
  echo.
  echo  [!] Download failed. Check your internet connection and try again.
  echo.
  pause
  exit /b 1
)

echo.
echo  [*] Extracting extension to %INSTALL_DIR%...

if exist "%INSTALL_DIR%" (
  echo  [*] Removing previous install...
  rd /s /q "%INSTALL_DIR%" 2>nul
)
mkdir "%INSTALL_DIR%" 2>nul

powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%INSTALL_DIR%' -Force; Write-Host '  [OK] Extracted.'"

if errorlevel 1 (
  echo.
  echo  [!] Extraction failed.
  pause
  exit /b 1
)

echo.
echo  [*] Launching Edge with JARVIS AI loaded...
echo.

start "" "%EDGE_PATH%" --load-extension="%INSTALL_DIR%" --no-first-run

timeout /t 2 /nobreak >nul

echo.
echo  ==========================================
echo    JARVIS AI is now running in Edge!
echo  ==========================================
echo.
echo  HOW TO PIN JARVIS:
echo    1. Look for the puzzle piece icon in Edge toolbar
echo    2. Find "Jarvis AI" and click the pin icon
echo    3. Click the JARVIS icon to open the side panel
echo.
echo  The extension is installed at:
echo    %INSTALL_DIR%
echo.
echo  To re-run with JARVIS: right-click this .bat
echo  file and "Run as administrator" is not needed.
echo.
echo  Keyboard shortcut: Ctrl+Shift+Y to toggle side panel
echo.
pause
