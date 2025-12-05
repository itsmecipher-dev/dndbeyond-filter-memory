# Quick Start Guide

## For Developers

### First Time Setup

```bash
# Clone the repository
git clone https://github.com/[your-username]/dndbeyond-filter-memory.git
cd dndbeyond-filter-memory

# Install dependencies
npm install

# Verify everything works
npm run build
```

### Development Workflow

```bash
# Check code quality
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Validate manifest
npm run validate

# Create test package
npm run package
# Output: dist/dndbeyond-filter-v1.0.3.zip
```

### Testing in Chrome

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the repository root directory
5. Test your changes
6. Reload extension after code changes

## For Users

### Installation

**From Chrome Web Store** (recommended):
1. Visit the [Chrome Web Store listing](#) *(coming soon)*
2. Click "Add to Chrome"
3. Done! Extension auto-configures on first launch

**From Source** (for testing):
1. Download the latest release ZIP
2. Extract it
3. Load unpacked in Chrome (see Testing in Chrome above)

### Usage

1. **First time**: Extension opens D&D Beyond sources page to scan your library
2. **Browse normally**: Visit any D&D Beyond content page (monsters, spells, etc.)
3. **Auto-filtering**: Content filtered to show only your owned sources
4. **Manage**: Click extension icon to view/update your sources

### Updating Your Library

When you purchase new D&D Beyond content:
1. Click the extension icon
2. Click "Update Owned Sources"
3. Wait for scan to complete
4. New sources automatically included

## For Release Managers

### Creating a Release

```bash
# 1. Bump version (creates commit + tag)
npm run bump patch

# 2. Update CHANGELOG.md manually
# Add your release notes under [Unreleased]

# 3. Commit changelog
git add CHANGELOG.md
git commit -m "docs: update changelog for vX.X.X"

# 4. Push everything
git push && git push --tags

# 5. Create GitHub release
# Go to GitHub → Releases → Draft new release
# Select tag → Add notes → Publish release

# 6. GitHub Actions automatically:
#    - Validates code
#    - Creates ZIP
#    - Publishes to Chrome Web Store
```

### Quick Commands Reference

| Command | What it does |
|---------|--------------|
| `npm install` | Install dependencies (first time only) |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run validate` | Validate manifest.json |
| `npm run package` | Create release ZIP |
| `npm run build` | Run all quality checks |
| `npm run release` | Build + package |
| `npm run bump patch` | 1.0.0 → 1.0.1 |
| `npm run bump minor` | 1.0.0 → 1.1.0 |
| `npm run bump major` | 1.0.0 → 2.0.0 |

## Troubleshooting

### Common Issues

**ESLint errors:**
```bash
npm run lint:fix  # Auto-fix most issues
```

**Validation fails:**
```bash
npm run validate  # See detailed errors
```

**Extension not working:**
1. Check you're logged into D&D Beyond
2. Reload extension: `chrome://extensions/` → Reload
3. Check browser console (F12) for errors
4. Look for `[D&D Beyond Filter]` log messages

**Build errors:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## File Structure

```
dndbeyond-filter-memory/
├── manifest.json              # Extension config
├── background.js              # Service worker
├── content-sources.js         # Library scanner
├── content-filter.js          # Auto-filter logic
├── popup.html/css/js          # Extension popup UI
├── icons/                     # Extension icons
├── scripts/                   # Build scripts
│   ├── validate-manifest.js
│   ├── create-zip.js
│   └── bump-version.js
├── .github/workflows/         # GitHub Actions
│   └── release.yml
├── docs/                      # Documentation
│   ├── RELEASE_PROCESS.md
│   ├── BUILD_SYSTEM.md
│   ├── WEBSTORE_DESCRIPTION.md
│   └── QUICK_START.md
├── package.json               # NPM config
└── CHANGELOG.md              # Version history
```

## Resources

- [Full Release Process](RELEASE_PROCESS.md)
- [Build System Details](BUILD_SYSTEM.md)
- [Chrome Web Store Listing](WEBSTORE_DESCRIPTION.md)
- [Privacy Policy](../PRIVACY.md)
- [Troubleshooting Guide](../TROUBLESHOOTING.md)

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/[your-username]/dndbeyond-filter-memory/issues)
- **Discussions**: [GitHub Discussions](https://github.com/[your-username]/dndbeyond-filter-memory/discussions)
- **Contributing**: See CONTRIBUTING.md *(to be created)*

## Next Steps

1. **Developers**: Make changes → Test locally → Create PR
2. **Users**: Install → Use → Report issues if any
3. **Release Managers**: Follow release process → Monitor Actions → Verify Web Store

---

**That's it!** You're ready to develop, use, or release the D&D Beyond Owned Sources Filter extension.
