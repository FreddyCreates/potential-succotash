# ─────────────────────────────────────────────────────────────
# install-extensions.ps1
# One-click installer. Run this. Extensions attach to Chrome.
# Zero manual steps. No developer mode. No "load unpacked".
#
# Usage: Just run it.
#   Right-click → Run with PowerShell
#   OR: powershell -ExecutionPolicy Bypass -File install-extensions.ps1
# ─────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  🧬 Sovereign Organism Installer" -ForegroundColor Yellow
Write-Host "  One click. Zero steps." -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# ── Find zips ──────────────────────────────────────────────
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$zips = Get-ChildItem -Path $scriptDir -Filter "*.zip" | Where-Object { $_.Name -ne "all-extensions.zip" }

if ($zips.Count -eq 0) {
    # Check for nested zips (inside extracted all-extensions.zip)
    $zips = Get-ChildItem -Path $scriptDir -Filter "*.zip" -Recurse | Where-Object { $_.Name -ne "all-extensions.zip" }
}

if ($zips.Count -eq 0) {
    Write-Host "No extension .zip files found in $scriptDir" -ForegroundColor Red
    Write-Host "Place this script next to the .zip files and run again." -ForegroundColor Yellow
    pause
    exit 1
}

# ── Extract all extensions ─────────────────────────────────
$installDir = "$env:LOCALAPPDATA\OrganismExtensions"
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

$loadPaths = @()
$count = 0

foreach ($zip in $zips) {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($zip.Name)
    $extDir = "$installDir\$name"

    if (Test-Path $extDir) {
        Remove-Item -Recurse -Force $extDir
    }

    Expand-Archive -Path $zip.FullName -DestinationPath $extDir -Force
    $loadPaths += $extDir
    $count++
    Write-Host "  ✓ $name" -ForegroundColor Green
}

Write-Host ""
Write-Host "  $count extensions extracted" -ForegroundColor Green
Write-Host ""

# ── Find browser ───────────────────────────────────────────
$browserPaths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe"
)

$browser = $null
$browserName = "Browser"
foreach ($path in $browserPaths) {
    if (Test-Path $path) {
        $browser = $path
        if ($path -match "chrome") { $browserName = "Chrome" }
        elseif ($path -match "msedge") { $browserName = "Edge" }
        elseif ($path -match "brave") { $browserName = "Brave" }
        break
    }
}

# ── Launch with extensions pre-loaded ──────────────────────
if ($browser) {
    $loadArg = ($loadPaths -join ",")
    Write-Host "  Launching $browserName with all extensions attached..." -ForegroundColor Cyan
    Start-Process $browser "--load-extension=$loadArg"
    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ Done! Extensions are live in $browserName." -ForegroundColor Green
    Write-Host "  They run 24/7 with 873ms heartbeat keepalive." -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
} else {
    Write-Host "  No Chromium browser found." -ForegroundColor Yellow
    Write-Host "  Extensions are at: $installDir" -ForegroundColor Yellow
    Write-Host "  Open chrome://extensions → Load unpacked → select folder" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Extensions installed at: $installDir" -ForegroundColor Cyan
Write-Host ""
