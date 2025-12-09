# 1_generate_key.ps1
# This script generates a new ED25519 SSH key for cPanel deployment
# and displays the public key for you to upload.

$KeyDir = "C:\Users\ABC\.gemini"
$KeyName = "cpanel_ed25519"
$KeyPath = Join-Path $KeyDir $KeyName

# Ensure directory exists
if (-not (Test-Path $KeyDir)) {
    New-Item -ItemType Directory -Path $KeyDir -Force | Out-Null
}

# Generate Key if it doesn't exist
if (-not (Test-Path $KeyPath)) {
    Write-Host "Generating new ED25519 key..." -ForegroundColor Cyan
    ssh-keygen -t ed25519 -C "cpanel_deploy" -f $KeyPath -N ""
} else {
    Write-Host "Key already exists at $KeyPath" -ForegroundColor Yellow
}

# Display Instructions
Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host "              STEP 1 COMPLETE: KEY GENERATED           " -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "1. Login to cPanel."
Write-Host "2. Go to 'SSH Access' -> 'Manage SSH Keys'."
Write-Host "3. Click 'Import Key'."
Write-Host "4. Paste the PUBLIC KEY below into the 'Public Key' box:"
Write-Host "-------------------------------------------------------" -ForegroundColor Cyan

Get-Content "$KeyPath.pub"

Write-Host "-------------------------------------------------------" -ForegroundColor Cyan
Write-Host "5. Click 'Import'."
Write-Host "6. VERY IMPORTANT: Back at the list, click 'Manage' next to the new key and click 'Authorize'."
Write-Host "=======================================================" -ForegroundColor Green
