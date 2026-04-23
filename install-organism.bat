@echo off
:: ═══════════════════════════════════════════════════════════════════════
:: install-organism.bat — TRUE 1-CLICK Windows Installer
::
:: Double-click this file. That's it.
:: It finds Chrome, loads all 20 AI extensions unpacked, and launches.
:: No unzipping. No manual steps. No GitHub needed.
:: ═══════════════════════════════════════════════════════════════════════

setlocal EnableDelayedExpansion
title Organism AI — Installing Extensions

echo.
echo   ╔══════════════════════════════════════════════════════════╗
echo   ║   🧬 Organism AI — One-Click Extension Installer        ║
echo   ╚══════════════════════════════════════════════════════════╝
echo.

:: Get the directory this script lives in
set "SCRIPT_DIR=%~dp0"
set "EXT_DIR=%SCRIPT_DIR%extensions"

:: Collect all browser extension paths
set "EXT_PATHS="
set "EXT_COUNT=0"

for /D %%d in ("%EXT_DIR%\*") do (
    if exist "%%d\manifest.json" (
        if exist "%%d\background.js" (
            if exist "%%d\content.js" (
                set "DIRNAME=%%~nxd"
                if not "!DIRNAME!"=="windows" (
                    if defined EXT_PATHS (
                        set "EXT_PATHS=!EXT_PATHS!,%%d"
                    ) else (
                        set "EXT_PATHS=%%d"
                    )
                    set /a EXT_COUNT+=1
                    echo   ✓ %%~nxd
                )
            )
        )
    )
)

echo.
echo   Found %EXT_COUNT% browser extensions.
echo.

if %EXT_COUNT%==0 (
    echo   ✗ No extensions found in %EXT_DIR%
    pause
    exit /b 1
)

:: Find Chrome
set "CHROME="

if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
) else if exist "%PROGRAMFILES%\Google\Chrome\Application\chrome.exe" (
    set "CHROME=%PROGRAMFILES%\Google\Chrome\Application\chrome.exe"
) else if exist "%PROGRAMFILES(x86)%\Google\Chrome\Application\chrome.exe" (
    set "CHROME=%PROGRAMFILES(x86)%\Google\Chrome\Application\chrome.exe"
)

if not defined CHROME (
    echo   ✗ Chrome not found. Please install Google Chrome.
    echo.
    echo   Extensions are ready in: %EXT_DIR%
    echo   Manually: chrome://extensions ^> Developer Mode ^> Load unpacked
    pause
    exit /b 1
)

echo   ✓ Chrome found: %CHROME%

:: Create profile directory
set "PROFILE=%USERPROFILE%\.organism-chrome-profile"
if not exist "%PROFILE%" mkdir "%PROFILE%"

echo   ✓ Profile: %PROFILE%
echo.
echo   ⚡ Launching Chrome with %EXT_COUNT% AI extensions...
echo.

:: Launch Chrome with all extensions loaded unpacked
start "" "%CHROME%" ^
    --user-data-dir="%PROFILE%" ^
    --load-extension="%EXT_PATHS%" ^
    --no-first-run ^
    --no-default-browser-check

echo   ✓ Done! Chrome is launching with all AI extensions.
echo   ✓ Open any webpage to see the AI panels.
echo.
timeout /t 5
