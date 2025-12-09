# 5_build_and_fix.ps1
# This script builds the project, uploads the 'dist' folder, and fixes the .htaccess file.

$RemoteHost = "healingbuds2025@oxley.hostns.io"
$KeyPath = "C:\Users\ABC\.gemini\cpanel_ed25519"
$DistFolder = "dist"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   STEP 5: BUILD, UPLOAD DIST, AND FIX HTACCESS        " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. BUILD
Write-Host "1. Installing dependencies and building..." -ForegroundColor Yellow
cmd /c "npm install && npm run build"
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed."; exit }

# 2. UPLOAD
Write-Host "`n2. Uploading 'dist' contents to server..." -ForegroundColor Yellow
# We use scp to recursively copy the CONTENTS of dist/* to public_html/
# Note: This overwrites index.html in public_html with the built one.
$scpArgs = "-i `"$KeyPath`" -o StrictHostKeyChecking=no -r $DistFolder/* $RemoteHost`:public_html/"
Start-Process scp -ArgumentList $scpArgs -NoNewWindow -Wait

# 3. FIX HTACCESS (Remove Node.js specific blocking code)
Write-Host "`n3. Fixing .htaccess on server..." -ForegroundColor Yellow
# We overwrite .htaccess with a basic one that allows standard HTML/JS
$fixHtaccessCmd = "echo 'DirectoryIndex index.html' > public_html/.htaccess"
ssh -i $KeyPath -o StrictHostKeyChecking=no $RemoteHost $fixHtaccessCmd

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "   ✅ DONE! Site should be visible now." -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green




