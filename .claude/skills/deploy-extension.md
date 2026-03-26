---
description: Deploy FittedIn Chrome extension to Chrome Web Store
---

# Deploy FittedIn Extension

This skill automates the deployment process for the FittedIn Chrome extension.

## Steps

### 1. Read Current Version
Read `apps/extension/manifest.json` to get the current version number.

### 2. Bump Version
Increment the patch version:
- Parse the version string (e.g., "1.1.6")
- Increment the last number (1.1.6 → 1.1.7)
- Update `apps/extension/manifest.json`
- Update `apps/extension/package.json`

### 3. Build Extension
Run the build command:
```bash
cd apps/extension && pnpm run build
```

### 4. Create ZIP Package
Navigate to the dist directory and create a ZIP file:
```bash
cd apps/extension/dist
zip -r ../../fitted-in-extension-vX.X.X.zip .
```

### 5. Verify Output
- Check that the ZIP was created successfully
- Verify it contains manifest.json
- Report the file size and location

## Output

The skill will:
1. Display the old and new version numbers
2. Show the build progress
3. Provide the ZIP file location
4. Suggest release notes

## Release Notes Template

```
Version X.X.X

Fixes:
- Fixed sidepanel showing stale job title when switching between LinkedIn jobs
- Fixed messaging between content script and sidepanel
- Improved port connection handling for multiple sidepanel instances

Improvements:
- Better tab targeting for LinkedIn job pages
```

## Manual Steps After Deployment

After the skill completes:
1. Go to https://chrome.google.com/webstore/devconsole
2. Find "FittedIn" extension
3. Click "Update Package"
4. Upload the generated ZIP file
5. Add the release notes
6. Submit for review
