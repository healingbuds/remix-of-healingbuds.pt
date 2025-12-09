# 2_deploy_to_cpanel.ps1
# This script configures Git to use your new key and pushes to cPanel.

# --- CONFIGURATION (I have pre-filled these based on your info) ---
$CpanelUser = "healingbuds2025"
$Domain = "healingbuds.pt"
$RepoName = "sun712.git"         # Typical cPanel repo name
$KeyPath = "C:/Users/ABC/.gemini/cpanel_ed25519"

# Construct the Remote URL
# NOTE: The path '/home/healingbuds2025/sun712.git' is the standard cPanel location.
# If you created the repo in a subfolder (like 'repositories'), you might need to change this.
$RemoteUrl = "ssh://$CpanelUser@$Domain/home/$CpanelUser/$RepoName"
# ------------------------------------------------------------------

Write-Host "-------------------------------------------------------" -ForegroundColor Cyan
Write-Host "   STEP 2: DEPLOYING TO CPANEL ($Domain)               " -ForegroundColor Cyan
Write-Host "-------------------------------------------------------" -ForegroundColor Cyan

# 1. Configure Git to use the specific SSH key for this repo
Write-Host "1. Configuring Git SSH command..."
git config core.sshCommand "ssh -i $KeyPath -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

# 2. Add 'cpanel' remote (removing old one if exists)
Write-Host "2. Updating 'cpanel' remote URL..."
git remote remove cpanel 2> $null
git remote add cpanel $RemoteUrl
Write-Host "   Remote set to: $RemoteUrl" -ForegroundColor Gray

# 3. Push code
Write-Host "3. Pushing code to server..." -ForegroundColor Yellow
$pushProcess = Start-Process git -ArgumentList "push -u cpanel main" -NoNewWindow -PassThru -Wait

if ($pushProcess.ExitCode -eq 0) {
    Write-Host "`nSUCCESS: Code deployed to cPanel!" -ForegroundColor Green
}
else {
    Write-Host "`nERROR: Push failed." -ForegroundColor Red
    Write-Host "Common reasons:"
    Write-Host " - The 'Authorize' button was not clicked in cPanel SSH Keys."
    Write-Host " - The repository '$RepoName' was not created in cPanel 'Git Version Control' yet."
    Write-Host " - The path in the script is slightly different from your server path."
}
Write-Host "-------------------------------------------------------" -ForegroundColor Cyan
