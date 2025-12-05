# Build System Overview

## What Was Added

### NPM Scripts & Package Management
- **package.json**: Node.js project configuration with build scripts
- **Dependencies**: ESLint for linting, Archiver for ZIP creation

### Build Scripts (in `scripts/` directory)

#### validate-manifest.js
Validates the extension manifest and file structure:
- ✅ Checks manifest version is 3
- ✅ Verifies all referenced files exist (scripts, icons, popup)
- ✅ Validates icon sizes (16x16, 32x32, 48x48, 128x128)
- ✅ Checks permissions are properly declared
- ✅ Provides detailed error messages

#### create-zip.js
Creates a production-ready ZIP file for Chrome Web Store:
- ✅ Packages extension into `dist/dndbeyond-filter-vX.X.X.zip`
- ✅ Includes only necessary files (manifest, JS, HTML, CSS, icons)
- ✅ Excludes development files (docs, tests, git files)
- ✅ Creates proper ZIP structure (manifest.json at root)

#### bump-version.js
Manages version updates and git tagging:
- ✅ Updates version in `manifest.json` and `package.json`
- ✅ Creates git commit: `chore: bump version to X.X.X`
- ✅ Creates git tag: `vX.X.X`
- ✅ Prompts to update CHANGELOG.md
- ✅ Supports semantic versioning (major/minor/patch)

### Code Quality

#### .eslintrc.json
ESLint configuration for JavaScript linting:
- Browser + WebExtensions environment
- ES2021 syntax support
- Basic code quality rules
- Warns on unused variables
- Enforces semicolons and consistent quotes

### GitHub Actions

#### .github/workflows/release.yml
Automated release workflow triggered on GitHub release creation:

**Quality Checks:**
1. Run ESLint on all JavaScript files
2. Validate manifest.json structure

**Build & Package:**
3. Create production ZIP file
4. Attach ZIP to GitHub release

**Auto-Publish:**
5. Upload to Chrome Web Store using API
6. Automatic submission for review

**Authentication Options:**

Two methods available for Chrome Web Store API access:

*Option A: OAuth 2.0 (Current Implementation)*
- Requires OAuth consent screen setup
- Access tokens expire after 3600 seconds
- Periodic token refresh needed with refresh token
- Redirect URI required: `https://developers.google.com/oauthplayground`

**Secrets Required (OAuth):**
- `CHROME_EXTENSION_ID` - Your extension ID from Chrome Web Store
- `CHROME_CLIENT_ID` - OAuth 2.0 Client ID
- `CHROME_CLIENT_SECRET` - OAuth 2.0 Client Secret
- `CHROME_REFRESH_TOKEN` - OAuth refresh token (obtain via OAuth Playground)

*Option B: Service Account (Alternative)*
- Non-human account for server-to-server interactions
- No OAuth redirect flow or user involvement
- Better for automated CI/CD pipelines
- No redirect URI needed
- Only one service account per publisher allowed
- Requires JSON key file (security risk if mishandled)

**Secrets Required (Service Account):**
- `CHROME_EXTENSION_ID` - Your extension ID from Chrome Web Store
- Service account JSON key file (secure storage required)

**Note:** OAuth method currently implemented. Service accounts may be preferable for fully automated deployments. See [Chrome Web Store Service Accounts](https://developer.chrome.com/docs/webstore/service-accounts) for migration details.

### Configuration Updates

#### .gitignore
Added to ignore build artifacts:
- `dist/` - Build output directory
- `node_modules/` - NPM dependencies
- Removed `*.zip` wildcard (ZIPs only in dist/ now)

## Workflow

### Local Development
```bash
npm install              # Install dependencies (first time)
npm run lint            # Check code quality
npm run validate        # Verify manifest and files
npm run package         # Create local ZIP for testing
```

### Creating a Release
```bash
npm run bump patch      # Update version, create commit + tag
# Manually update CHANGELOG.md
git push && git push --tags
# Create GitHub release → triggers auto-publish
```

### Manual Packaging (if needed)
```bash
npm run build          # Lint + validate
npm run package        # Create ZIP
# Upload dist/dndbeyond-filter-vX.X.X.zip manually
```

## Benefits

✅ **Quality Gates**: Automated linting and validation before release
✅ **Consistent Versioning**: Single source of truth for version numbers
✅ **Automated Publishing**: No manual ZIP uploads to Chrome Web Store
✅ **Audit Trail**: Git tags and GitHub releases for every version
✅ **Easy Rollback**: All version ZIPs preserved in GitHub releases
✅ **Developer Experience**: Simple `npm run bump` for releases

## Architecture Decisions

### Why Minimal Dependencies?
- Extension is vanilla JavaScript (no bundling needed)
- Only dev dependencies: eslint + archiver
- Keeps build fast and simple
- No unnecessary complexity

### Why Not Use Webpack/Vite?
- No module bundling required (vanilla JS)
- No transpilation needed (modern browsers only)
- Simple file structure (manifest at root)
- Faster builds and easier debugging

### Why Manual GitHub Releases?
- Gives you control over when to publish
- Allows review of changes before release
- Can attach release notes and documentation
- Triggers automated workflow reliably

## File Structure After Setup

```
/Users/sebas/code/dndbeyond-filter-memory/
├── .github/
│   └── workflows/
│       └── release.yml           # GitHub Actions workflow
├── scripts/
│   ├── validate-manifest.js     # Manifest validator
│   ├── create-zip.js            # ZIP packager
│   └── bump-version.js          # Version manager
├── dist/                         # Build output (gitignored)
│   └── dndbeyond-filter-v*.zip  # Release packages
├── node_modules/                 # Dependencies (gitignored)
├── package.json                  # NPM configuration
├── package-lock.json             # Dependency lock file
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Updated with dist/ and node_modules/
└── docs/
    ├── RELEASE_PROCESS.md       # Detailed release guide
    └── BUILD_SYSTEM.md          # This file
```

## Maintenance

### Updating Dependencies
```bash
npm outdated           # Check for updates
npm update            # Update to latest minor versions
npm install eslint@latest --save-dev  # Update specific package
```

### Troubleshooting

**Issue**: ESLint errors in existing code
- **Fix**: Run `npm run lint` and fix issues or update rules in `.eslintrc.json`

**Issue**: Validation fails
- **Fix**: Run `npm run validate` for detailed error messages

**Issue**: GitHub Actions fails
- **Fix**: Check Actions tab for logs, verify secrets are set correctly

**Issue**: Chrome Web Store API errors
- **Fix**: Regenerate refresh token, verify credentials in GitHub secrets

## Future Enhancements

Possible future improvements:
- [ ] Add unit tests with Jest
- [ ] Add E2E tests with Puppeteer
- [ ] Automated screenshot generation
- [ ] Changelogs in releases via conventional commits
- [ ] Automated version bumping from commit messages
- [ ] PR validation workflow (lint on pull requests)

## Resources

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Web Store API](https://developer.chrome.com/docs/webstore/using-api)
- [Chrome Web Store Service Accounts](https://developer.chrome.com/docs/webstore/service-accounts)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
