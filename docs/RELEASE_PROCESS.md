# Release Process

## Overview
This extension uses automated build and publish workflows with GitHub Actions. When you create a GitHub release, it automatically validates, builds, and publishes to the Chrome Web Store.

## Prerequisites

### One-Time Setup: Chrome Web Store API Access

To enable auto-publishing, you need to set up Chrome Web Store API credentials:

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Chrome Web Store API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Chrome Web Store API"
   - Click "Enable"

#### Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Add authorized redirect URI: `http://localhost`
5. Click "Create" and save:
   - **Client ID**
   - **Client Secret**

#### Step 3: Get Extension ID

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Upload your extension manually (first time only)
3. Copy the **Extension ID** from the dashboard
   - Format: `abcdefghijklmnopqrstuvwxyz123456`

#### Step 4: Generate Refresh Token

Install the Chrome Web Store upload CLI globally:

```bash
npm install -g chrome-webstore-upload-cli
```

Generate a refresh token:

```bash
chrome-webstore-upload refresh-token
```

Follow the prompts:
1. Enter your **Client ID**
2. Enter your **Client Secret**
3. Open the URL in your browser
4. Authorize the application
5. Copy the **Refresh Token** from the terminal

#### Step 5: Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret" and add each of these:

| Secret Name | Value |
|------------|-------|
| `CHROME_EXTENSION_ID` | Your extension ID from Step 3 |
| `CHROME_CLIENT_ID` | Your OAuth Client ID from Step 2 |
| `CHROME_CLIENT_SECRET` | Your OAuth Client Secret from Step 2 |
| `CHROME_REFRESH_TOKEN` | Your refresh token from Step 4 |

✅ **Setup Complete!** Your releases will now auto-publish to Chrome Web Store.

---

## Local Development

### Install Dependencies

```bash
npm install
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint on all JavaScript files |
| `npm run validate` | Validate manifest.json structure and file references |
| `npm run package` | Create ZIP file for Chrome Web Store submission |
| `npm run build` | Run lint + validate (quality checks) |
| `npm run release` | Run build + package (full local release) |
| `npm run bump [type]` | Bump version (patch/minor/major) and create git tag |

### Testing Locally

1. Make your changes
2. Run quality checks:
   ```bash
   npm run build
   ```
3. Create test package:
   ```bash
   npm run package
   ```
4. Load unpacked extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the repository root directory (NOT the dist folder)

---

## Creating a Release

### Step 1: Update Version

```bash
npm run bump patch
```

Options:
- `patch` - Bug fixes (1.0.0 → 1.0.1)
- `minor` - New features (1.0.0 → 1.1.0)
- `major` - Breaking changes (1.0.0 → 2.0.0)

This will:
- Update `manifest.json` version
- Update `package.json` version
- Create a git commit
- Create a git tag (`v1.0.4`)

### Step 2: Update CHANGELOG.md

Manually add release notes to `CHANGELOG.md`:

```markdown
## [1.0.4] - 2024-11-07

### Fixed
- Fixed filter validation error for Sage Advice sources

### Added
- Added build automation with GitHub Actions
```

Commit the changelog:
```bash
git add CHANGELOG.md
git commit -m "docs: update changelog for v1.0.4"
```

### Step 3: Push Changes

```bash
git push && git push --tags
```

### Step 4: Create GitHub Release

1. Go to your repository on GitHub
2. Click **Releases** → **Draft a new release**
3. Click **Choose a tag** and select your version (e.g., `v1.0.4`)
4. **Release title**: `v1.0.4`
5. **Description**: Copy from CHANGELOG.md or write release notes
6. Click **Publish release**

### Step 5: Automated Publishing

GitHub Actions will automatically:

1. ✅ **Checkout code** from the release tag
2. ✅ **Install dependencies** (npm ci)
3. ✅ **Run ESLint** for code quality
4. ✅ **Validate manifest.json** structure
5. ✅ **Create ZIP package** (dist/dndbeyond-filter-vX.X.X.zip)
6. ✅ **Upload ZIP to GitHub release** as an asset
7. ✅ **Publish to Chrome Web Store** using API

You can monitor the progress:
- Go to **Actions** tab in GitHub
- Click on the workflow run
- View logs for each step

### Step 6: Verify Publication

1. Check the GitHub Actions run completed successfully
2. Verify ZIP file is attached to the GitHub release
3. Check Chrome Web Store Developer Dashboard
   - Extension should show "Pending review" or "Published"
   - Review typically takes 1-3 days

---

## Manual Release (Without GitHub Actions)

If you prefer to upload manually:

### Create Package

```bash
npm run build
npm run package
```

This creates `dist/dndbeyond-filter-v{version}.zip`

### Upload to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Select your extension
3. Click "Package" → "Upload new package"
4. Select the ZIP file from `dist/`
5. Fill in "What's new in this version" (from CHANGELOG.md)
6. Click "Submit for review"

---

## Troubleshooting

### GitHub Actions Fails

**Issue**: ESLint errors
- **Fix**: Run `npm run lint` locally and fix issues before pushing

**Issue**: Manifest validation fails
- **Fix**: Run `npm run validate` locally to see detailed error messages

**Issue**: Chrome Web Store API error
- **Fix**: Verify secrets are correctly set in GitHub repository settings
- **Fix**: Check refresh token hasn't expired (regenerate if needed)

### ZIP File Issues

**Issue**: ZIP file too large
- **Fix**: Check that dev files aren't included (docs, test files)
- **Fix**: Ensure `.gitignore` excludes `node_modules`

**Issue**: Missing files in ZIP
- **Fix**: Check `scripts/create-zip.js` includes all required files
- **Fix**: Verify icons directory exists and has all sizes

### Version Conflicts

**Issue**: Version number mismatch
- **Fix**: Ensure `manifest.json` and `package.json` versions match
- **Fix**: Always use `npm run bump` to update versions

---

## Release Checklist

Before creating a release, verify:

- [ ] All code changes are committed
- [ ] Tests pass (`npm run build`)
- [ ] Version bumped (`npm run bump [type]`)
- [ ] CHANGELOG.md updated with release notes
- [ ] Changes pushed to GitHub (`git push && git push --tags`)
- [ ] GitHub release created with proper notes
- [ ] GitHub Actions workflow completes successfully
- [ ] Extension appears in Chrome Web Store dashboard

---

## Emergency Rollback

If a release has critical issues:

### Before Publishing to Store

1. Delete the GitHub release
2. Delete the git tag:
   ```bash
   git tag -d v1.0.4
   git push origin :refs/tags/v1.0.4
   ```
3. Fix the issue
4. Create new release with bumped patch version

### After Publishing to Store

1. Revert changes locally:
   ```bash
   git revert <commit-hash>
   ```
2. Bump version again
3. Create new release with fix
4. Chrome Web Store will review the new version

Note: You cannot unpublish a version from Chrome Web Store, only publish a newer version.

---

## Best Practices

1. **Test locally first**: Always load the unpacked extension and test before releasing
2. **Semantic versioning**: Use appropriate version bumps (patch/minor/major)
3. **Clear changelog**: Write user-friendly release notes
4. **Regular releases**: Release bug fixes quickly, bundle features
5. **Monitor reviews**: Check Chrome Web Store reviews after each release
6. **Backup credentials**: Store API credentials securely (1Password, etc.)

---

## Resources

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Web Store API Documentation](https://developer.chrome.com/docs/webstore/using_webstore_api/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
