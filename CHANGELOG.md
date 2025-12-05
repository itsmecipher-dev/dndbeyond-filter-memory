# Changelog

## [Unreleased]

### Added
- **Build automation system**:
  - `package.json` with NPM build scripts
  - `scripts/validate-manifest.js` - Manifest validation
  - `scripts/create-zip.js` - ZIP packaging for Chrome Web Store
  - `scripts/bump-version.js` - Version management with git tagging
  - `.eslintrc.json` - Code quality linting configuration
- **GitHub Actions CI/CD**:
  - `.github/workflows/release.yml` - Auto-publish on GitHub release
  - Validates code quality and manifest on every release
  - Automatically publishes to Chrome Web Store
  - Attaches release ZIP to GitHub releases
- **Documentation**:
  - `docs/RELEASE_PROCESS.md` - Complete release workflow guide
  - `docs/BUILD_SYSTEM.md` - Build system architecture overview
  - `docs/WEBSTORE_DESCRIPTION.md` - Chrome Web Store listing content
  - `PRIVACY.md` - Privacy policy for Web Store submission
- **NPM Commands**:
  - `npm run lint` / `npm run lint:fix` - ESLint code quality checks
  - `npm run validate` - Validate manifest structure
  - `npm run package` - Create release ZIP
  - `npm run bump [type]` - Version management (patch/minor/major)
  - `npm run build` - Run all quality checks
  - `npm run release` - Full local release workflow

### Changed
- Updated `.gitignore` to exclude `dist/` and `node_modules/`
- Updated `README.md` with build and release instructions

## [1.0.3] - 2024-11-07

### Fixed
- **Updated blacklist**: Removed Basic Rules from exclusion list
  - Basic Rules sources are actually filterable
  - Only excluding: Unearthed Arcana, Sage Advice & Errata, Sage Advice Compendium
  - Updated popup info text to reflect accurate exclusions

## [1.0.2] - 2024-11-07

### Fixed
- **Filter validation error**: Excluded non-filterable sources
  - Blacklisted: Unearthed Arcana, Sage Advice & Errata, Sage Advice Compendium
  - These sources don't support filter parameters and caused errors
  - Added info text in popup to explain exclusions

### Changed
- Updated popup footer with explanatory note about excluded sources

## [1.0.1] - 2024-11-07

### Fixed
- **Popup display issue**: Sources now display correct names instead of "undefined"
  - Changed `source.name` to `source.label` (correct API field)
  - Changed `source.type` from direct display to type mapping function
  - Type mapping: 1=Sourcebook, 2=Adventure, 3=Campaign Setting

- **Source detection timing**: Added 2-second delay for page load
  - Content script waits for DOM to fully load before scanning

- **Link parsing**: Fixed href selector for relative paths
  - Changed from `a[href*="/sources/"]` to `a[href*="sources/"]`
  - Using `getAttribute('href')` instead of `.href` property

### Added
- Extensive console logging for debugging
  - Source detection logs in content script
  - Popup display logs for troubleshooting
  - Clear error messages for common issues

- Better error handling in popup
  - Shows "Loading sources data..." if API not loaded
  - Shows "Error: Could not match source IDs" if mapping fails
  - Provides helpful console output

### Documentation
- Added `TROUBLESHOOTING.md` with common issues and solutions
- Added `docs/references.md` with API documentation
- Added `docs/test-detection.html` for testing detection logic
- Updated `README.md` with accurate technical details

## [1.0.0] - 2024-11-07

### Initial Release
- Auto-detect owned sources from D&D Beyond library
- Automatic filter application on content pages
- Popup UI for managing sources and settings
- Global toggle for enable/disable
- Chrome Manifest v3 compatibility
- Sync storage across devices
