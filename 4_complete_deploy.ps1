# 4_complete_deploy.ps1
# This is the MASTER SCRIPT. Run this to finish everything.

# --- CONFIGURATION ---
$RemoteUrl = "ssh://healingbuds2025@oxley.hostns.io//home/healingbuds2025/repositories/sun712.git"
$KeyPath = "C:/Users/ABC/.gemini/cpanel_ed25519"
# ---------------------

Clear-Host
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "                FINAL AUTOMATION STEP                                " -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "The key is missing from cPanel. We will fix this via the Terminal."
Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Copy the command below (select it and right-click to copy)."
Write-Host "2. Paste it into your cPanel Terminal window and press Enter."
Write-Host "---------------------------------------------------------------------"
Write-Host 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIlhKykQivc9E9Kx9W8YkYRaSB9h2e1IpcB5yZwgsf3l cpanel_deploy" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo "✅ Key Authorized"' -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "---------------------------------------------------------------------"
Write-Host ""

$confirmation = Read-Host ">>> Press ENTER here once you have pasted the command into cPanel"

# --- DEPLOYMENT LOGIC ---
Write-Host "`nConnecting to server..." -ForegroundColor Cyan

# Configure connection
git config core.sshCommand "ssh -i $KeyPath -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
git remote remove cpanel 2> $null
git remote add cpanel $RemoteUrl

# Push
Write-Host "Pushing code to $RemoteUrl..." -ForegroundColor Yellow
$pushProcess = Start-Process git -ArgumentList "push -u cpanel main" -NoNewWindow -PassThru -Wait

if ($pushProcess.ExitCode -eq 0) {
    Write-Host "`n=======================================================" -ForegroundColor Green
    Write-Host "   🚀 SUCCESS! WEBSITE DEPLOYED." -ForegroundColor Green
    Write-Host "=======================================================" -ForegroundColor Green
}
else {
    Write-Host "`n❌ Push failed. Please verify the cPanel command was run." -ForegroundColor Red
}
