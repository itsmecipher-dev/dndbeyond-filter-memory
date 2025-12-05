# D&D Beyond Owned Sources Filter

Chrome extension that automatically filters D&D Beyond content pages to show only sources you own.

## Features

- Auto-detects owned sources from your D&D Beyond library
- Automatically applies source filters to supported pages:
  - Monsters
  - Spells
  - Equipment
  - Magic Items
  - Feats
  - Backgrounds
- Easy management of owned sources via popup
- Global toggle to enable/disable filtering

## Installation

1. Clone this repository
2. Add icon files to the `icons/` directory (see `icons/README.md`)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top-right)
5. Click "Load unpacked"
6. Select the extension directory

## First-Time Setup

On installation, the extension will automatically open your D&D Beyond sources page to scan your library. Once complete, filtering will be active on all supported pages.

## Usage

### Normal Usage
Simply navigate to any supported content page. The extension will automatically apply filters to show only your owned sources.

### Managing Sources
1. Click the extension icon to open the popup
2. View all detected owned sources
3. Click "Update Owned Sources" to rescan your library
4. Remove individual sources using the × button
5. Toggle filtering on/off with the switch at the top

### Manual Override
If you want to temporarily use different filters, the extension will respect your manual selections and not override them.

## Build & Release

### Local Development

**Install dependencies:**
```bash
npm install
```

**Available commands:**
```bash
npm run lint        # Check code quality with ESLint
npm run validate    # Validate manifest.json and file references
npm run package     # Create ZIP for Chrome Web Store submission
npm run build       # Run lint + validate (quality checks)
npm run release     # Run full local release (build + package)
```

**Version management:**
```bash
npm run bump patch  # 1.0.0 → 1.0.1 (bug fixes)
npm run bump minor  # 1.0.0 → 1.1.0 (new features)
npm run bump major  # 1.0.0 → 2.0.0 (breaking changes)
```

### Creating a Release

1. **Update version and create tag:**
   ```bash
   npm run bump patch
   ```

2. **Update CHANGELOG.md** with release notes

3. **Push changes:**
   ```bash
   git push && git push --tags
   ```

4. **Create GitHub release** (manual on GitHub.com)

5. **Automated publishing:**
   - GitHub Actions validates and builds the extension
   - Automatically publishes to Chrome Web Store
   - ZIP file attached to GitHub release

See [docs/RELEASE_PROCESS.md](docs/RELEASE_PROCESS.md) for detailed release instructions and Chrome Web Store API setup.

## Development

### Project Structure
```
├── manifest.json           # Extension manifest (v3)
├── background.js          # Service worker (handles installation)
├── content-sources.js     # Detects owned sources on /sources page
├── content-filter.js      # Applies filters to content pages
├── popup.html            # Extension popup UI
├── popup.css             # Popup styles
├── popup.js              # Popup logic
├── icons/                # Extension icons
└── docs/                 # Documentation
    └── PRD.md           # Product requirements
```

### Key Files

**manifest.json** - Defines permissions, content scripts, and extension metadata

**background.js** - Handles installation event, opens sources page on first install

**content-sources.js** - Runs on `/sources` page, detects owned sources and stores IDs

**content-filter.js** - Runs on content pages, applies source filters via URL params

**popup.*** - Extension popup interface for managing settings and sources

## Technical Details

### Storage Schema
```javascript
{
  ownedSourceIds: [148, 39, 52],  // Array of source IDs
  filterEnabled: true,             // Global toggle
  lastUpdated: "2024-09-03T13:12:00Z"  // ISO timestamp
}
```

### How It Works

1. **Detection**: Scans `/sources` page for `<span class="owned-content">` elements
2. **Mapping**: Extracts source slugs and maps to IDs via `sources.json` API
3. **Storage**: Saves owned source IDs to `chrome.storage.sync`
4. **Filtering**: On content pages, appends `filter-source=<id>` params to URL
5. **Preservation**: Maintains existing URL parameters (search, filters, etc.)

## Permissions

- `storage` - Store owned sources list
- `host_permissions` - Access specific D&D Beyond pages (sources, content lists, API)

## Limitations

- Only works on D&D Beyond (not compatible with other VTT platforms)
- Requires stable DOM structure on `/sources` page
- Depends on `sources.json` API availability
- Chrome only (Manifest v3)

## Future Enhancements

See [PRD.md](docs/PRD.md) for planned v2 features including:
- Encounter Builder support
- Partial source filtering
- Import/export source lists
- New source notifications

## License

MIT License - See LICENSE file for details
