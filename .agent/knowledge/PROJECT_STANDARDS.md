# Project Standards & Automation Library

## 1. Project Overview
- **Deployment Target**: cPanel (HostNS / healingbuds.pt)
- **Framework**: React + Vite (Lovable Template)
- **Repository**: `healingbuds/sun712`

## 2. Deployment Standards
To ensure successful deployment off-Lovable:

### A. Vite Configuration (`vite.config.ts`)
**CRITICAL**: Must set `base` path to relative (`./`) to prevent "White Screen of Death".
```typescript
export default defineConfig({
  base: "./", // REQUIRED
  plugins: [react()], // Remove componentTagger to hide Lovable Badge
  // ...
});
```

### B. Deployment Pipeline
We use two methods:
1.  **Manual Script (PowerShell)**: `5_build_and_fix.ps1`
    *   Builds locally.
    *   Uploads `dist/` via `scp`.
    *   Fixes `.htaccess` & permissions.
2.  **GitHub Actions**: `.github/workflows/deploy_to_cpanel.yml`
    *   Triggers on push to `main`.
    *   Uses `rsync` to sync `dist/`.

### C. Branding Removal
*   Remove `<meta>` tags referencing `lovable.dev` in `index.html`.
*   Remove `componentTagger` from `vite.config.ts`.

## 3. Automation Library (Scripts)
The following scripts in root are maintained for manual ops:
*   `1_generate_key.ps1`: Creates SSH Key.
*   `2_deploy_to_cpanel.ps1`: First-time Git setup.
*   `5_build_and_fix.ps1`: **Master Build & Deploy Script**.

## 4. Troubleshooting
*   **White Screen**: Check `base: "./"`.
*   **403 Forbidden**: Run `chmod -R a+rX public_html` via SSH.
*   **Node.js Default Page**: Check `.htaccess`, ensure standard Apache directives are used, remove CloudLinux/Passenger config.
