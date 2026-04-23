# ─────────────────────────────────────────────────────────────
# install-extensions.ps1
# Windows PowerShell script to install all organism extensions
# into Chrome / Edge / Brave automatically.
#
# Usage:
#   1. Extract all-extensions.zip to a folder
#   2. Open PowerShell in that folder
#   3. Run: .\install-extensions.ps1
# ─────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Sovereign Organism Extension Installer" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Find all extension zips in current directory
$zips = Get-ChildItem -Path "." -Filter "*.zip" | Where-Object { $_.Name -ne "all-extensions.zip" }

if ($zips.Count -eq 0) {
    # Maybe we're inside the extracted bundle — look for nested zips
    $zips = Get-ChildItem -Path "." -Filter "*.zip" -Recurse | Where-Object { $_.Name -ne "all-extensions.zip" }
}

if ($zips.Count -eq 0) {
    Write-Host "No extension .zip files found!" -ForegroundColor Red
    Write-Host "Make sure you extracted all-extensions.zip first." -ForegroundColor Yellow
    exit 1
}

# Create install directory
$installDir = "$env:LOCALAPPDATA\OrganismExtensions"
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

Write-Host "Installing to: $installDir" -ForegroundColor Yellow
Write-Host ""

$count = 0
foreach ($zip in $zips) {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($zip.Name)
    $extDir = "$installDir\$name"
    
    # Clean previous install
    if (Test-Path $extDir) {
        Remove-Item -Recurse -Force $extDir
    }
    
    # Extract
    Expand-Archive -Path $zip.FullName -DestinationPath $extDir -Force
    $count++
    Write-Host "  ✓ $name" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ $count extensions extracted" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open Chrome/Edge/Brave" -ForegroundColor White
Write-Host "  2. Go to chrome://extensions" -ForegroundColor White
Write-Host "  3. Enable 'Developer mode' (top-right toggle)" -ForegroundColor White
Write-Host "  4. Click 'Load unpacked' for each folder in:" -ForegroundColor White
Write-Host "     $installDir" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to open Chrome extensions page
$response = Read-Host "Open Chrome extensions page now? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    # Try Chrome first, then Edge, then Brave
    $browsers = @(
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
        "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe"
    )
    
    $opened = $false
    foreach ($browser in $browsers) {
        if (Test-Path $browser) {
            Start-Process $browser "chrome://extensions"
            $opened = $true
            Write-Host "Opened extensions page in $(Split-Path $browser -Leaf)" -ForegroundColor Green
            break
        }
    }
    
    if (-not $opened) {
        Start-Process "chrome://extensions"
    }
}

# Also open the install directory in Explorer
Start-Process explorer.exe $installDir

Write-Host ""
Write-Host "Extensions are ready at: $installDir" -ForegroundColor Green
Write-Host "Each extension runs 24/7 with 873ms heartbeat keepalive." -ForegroundColor Cyan
Write-Host ""
