# 3_final_deploy.ps1
# This script pushes your code to the cPanel repo you just created.

# --- PRECISE CONFIGURATION ---
$RemoteUrl = "ssh://healingbuds2025@oxley.hostns.io//home/healingbuds2025/repositories/sun712.git"
$KeyPath = "C:/Users/ABC/.gemini/cpanel_ed25519"
# -----------------------------

Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "   FINAL STEP: DEPLOYING TO $RemoteUrl " -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan

# 1. Configure SSH command
Write-Host "1. Setting Git to use your new SSH key..."
git config core.sshCommand "ssh -i $KeyPath -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

# 2. Update Remote URL
Write-Host "2. Updating remote address..."
git remote remove cpanel 2> $null
git remote add cpanel $RemoteUrl
Write-Host "   Remote set."

# 3. Push to server
Write-Host "3. Pushing code..." -ForegroundColor Yellow
$pushProcess = Start-Process git -ArgumentList "push -u cpanel main" -NoNewWindow -PassThru -Wait

if ($pushProcess.ExitCode -eq 0) {
    Write-Host "`n✅ SUCCESS! Code deployed." -ForegroundColor Green
    Write-Host "Visit your website to verify."
}
else {
    Write-Host "`n⚠️ PUSH FAILED." -ForegroundColor Red
    Write-Host "Check that you AUTHORIZED the key in cPanel SSH settings."
}
