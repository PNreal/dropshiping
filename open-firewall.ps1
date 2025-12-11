# PowerShell script to open firewall ports for DHL Shipping
# Run as Administrator: Right-click -> Run with PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DHL Shipping - Firewall Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script requires Administrator privileges!" -ForegroundColor Yellow
    Write-Host "Please right-click and select 'Run with PowerShell' as Administrator" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "Opening firewall ports..." -ForegroundColor Green
Write-Host ""

# Port 5173 - Vite Dev Server (Frontend)
try {
    $existingRule = Get-NetFirewallRule -DisplayName "DHL Shipping - Frontend (Vite)" -ErrorAction SilentlyContinue
    if ($existingRule) {
        Write-Host "✅ Port 5173 (Frontend) rule already exists" -ForegroundColor Yellow
    } else {
        New-NetFirewallRule -DisplayName "DHL Shipping - Frontend (Vite)" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow | Out-Null
        Write-Host "✅ Port 5173 (Frontend) opened successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to open port 5173: $_" -ForegroundColor Red
}

# Port 5000 - Backend API
try {
    $existingRule = Get-NetFirewallRule -DisplayName "DHL Shipping - Backend API" -ErrorAction SilentlyContinue
    if ($existingRule) {
        Write-Host "✅ Port 5000 (Backend) rule already exists" -ForegroundColor Yellow
    } else {
        New-NetFirewallRule -DisplayName "DHL Shipping - Backend API" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow | Out-Null
        Write-Host "✅ Port 5000 (Backend) opened successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to open port 5000: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Firewall configuration complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now access the servers from other devices on your network." -ForegroundColor Green
Write-Host ""
pause

