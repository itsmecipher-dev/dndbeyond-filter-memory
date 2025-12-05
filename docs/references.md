# References

## D&D Beyond APIs

### Sources JSON
**URL**: `https://www.dndbeyond.com/navigation/sources.json`

**Structure**:
```json
{
  "id": 148,
  "order": 9,
  "label": "D&D Beyond Basic Rules",
  "subLabel": "",
  "slug": "br-2024",
  "relativePath": "sources/dnd/br-2024",
  "imageUrl": "https://www.dndbeyond.com/avatars/...",
  "type": 1,
  "releaseDate": "2024-09-03T13:12:00Z",
  "isReleased": true,
  "isFree": true,
  "isThirdParty": false
}
```

**Type Values**:
- `1` = Sourcebook
- `2` = Adventure
- `3` = Campaign Setting

### Sources Page
**URL**: `https://www.dndbeyond.com/sources`

**Owned Source Detection**:
- Look for `<span class="owned-content">In Library</span>` within source items
- Parent element: `<li class="sources-listing--item-wrapper">`
- Owned sources have "Library" in `data-collapsible-search` attribute
- Link format: `<a href="sources/dnd/{slug}">`

**Non-Filterable Sources** (Excluded):
These sources don't support filter parameters and are automatically excluded:
- `ua` - Unearthed Arcana (playtest content)
- `sae` - Sage Advice & Errata (rulings/errata)
- `sac` - Sage Advice Compendium 2014 (rulings/errata)

These are reference/errata documents that don't contain filterable content (monsters, spells, etc.)

### Filter Parameters
**Supported Pages**:
- `/monsters`
- `/spells`
- `/equipment`
- `/magic-items`
- `/feats`
- `/backgrounds`

**URL Parameter**: `filter-source={id}`

**Example**:
```
https://www.dndbeyond.com/monsters?filter-source=148&filter-source=147&filter-source=166
```

## Chrome Extension APIs

### Storage
- `chrome.storage.sync` - Syncs across devices (100KB limit)
- Used for: owned source IDs, settings, timestamps

### Tabs (No Permission Required)
- `chrome.tabs.create()` - Open sources page (does not require tabs permission)
- Used for: installation flow, manual updates

## External Libraries
None - vanilla JavaScript only

## Development Tools
- Chrome Extension DevTools: `chrome://extensions/`
- Console logging prefix: `[D&D Beyond Filter]`
- Popup console: Right-click popup → Inspect
- Service worker console: Extensions page → Inspect views

## Testing Resources
- Test detection page: `docs/test-detection.html`
- Sample HTML: `docs/sources.html`
- Troubleshooting guide: `TROUBLESHOOTING.md`
