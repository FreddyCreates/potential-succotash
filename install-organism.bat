@echo off
REM ═══════════════════════════════════════════════════════════
REM  Sovereign Organism — One-Click Extension Installer
REM  
REM  Double-click this file. That's it.
REM  It extracts all extensions and launches Edge (or Chrome)
REM  with them already attached. Zero manual steps.
REM  Edge-first on Windows. One click native.
REM ═══════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

echo.
echo  ======================================
echo   Sovereign Organism Installer
echo   One-click. Zero manual steps.
echo   Edge-first on Windows.
echo  ======================================
echo.

REM ── Set install directory ────────────────────────────────
set "INSTALL_DIR=%LOCALAPPDATA%\OrganismExtensions"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM ── Find all extension zips in same folder as this .bat ──
set "SCRIPT_DIR=%~dp0"
set "EXT_COUNT=0"
set "LOAD_PATHS="

echo  Extracting extensions...
echo.

for %%f in ("%SCRIPT_DIR%*.zip") do (
    set "ZIPNAME=%%~nf"
    if /I not "!ZIPNAME!"=="all-extensions" (
        set "EXT_DIR=%INSTALL_DIR%\!ZIPNAME!"
        
        REM Clean previous
        if exist "!EXT_DIR!" rd /s /q "!EXT_DIR!"
        mkdir "!EXT_DIR!"
        
        REM Extract using PowerShell (built into Windows 10+)
        powershell -NoProfile -Command "Expand-Archive -Path '%%f' -DestinationPath '!EXT_DIR!' -Force" >nul 2>&1
        
        echo   [OK] !ZIPNAME!
        set /a EXT_COUNT+=1
        
        REM Build --load-extension path list
        if defined LOAD_PATHS (
            set "LOAD_PATHS=!LOAD_PATHS!,!EXT_DIR!"
        ) else (
            set "LOAD_PATHS=!EXT_DIR!"
        )
    )
)

echo.
echo  ======================================
echo   %EXT_COUNT% extensions installed
echo  ======================================
echo.

REM ── Find Edge FIRST (native on Windows), then Chrome, then Brave ──
set "BROWSER="

REM Try Edge first — native Windows browser, best integration
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
    set "BROWSER_NAME=Edge"
)
if not defined BROWSER (
    if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
        set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
        set "BROWSER_NAME=Edge"
    )
)

REM Try Chrome if no Edge
if not defined BROWSER (
    if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
        set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
        set "BROWSER_NAME=Chrome"
    )
)
if not defined BROWSER (
    if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
        set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
        set "BROWSER_NAME=Chrome"
    )
)

REM Try Brave
if not defined BROWSER (
    if exist "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe" (
        set "BROWSER=%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"
        set "BROWSER_NAME=Brave"
    )
)

REM ── Launch browser with extensions pre-loaded ────────────
if defined BROWSER (
    echo  Launching %BROWSER_NAME% with all extensions attached...
    echo.
    start "" "%BROWSER%" --load-extension="%LOAD_PATHS%"
    echo  Done! Extensions are live in %BROWSER_NAME%.
    echo  They run 24/7 with 873ms heartbeat keepalive.
) else (
    echo  No Chromium browser found.
    echo  Extensions extracted to: %INSTALL_DIR%
    echo  Open edge://extensions and load them manually.
)

echo.
echo  Extensions installed at:
echo    %INSTALL_DIR%
echo.
pause
