# Product Requirements Document: D&D Beyond Owned Sources Filter

## Overview
Chrome extension (Manifest v3) that automatically filters D&D Beyond content pages to show only sources owned by the user.

## Problem Statement
D&D Beyond shows content from all sources by default, including those users don't own. Users must manually filter sources on each page visit, creating friction and potentially showing unavailable content.

## Solution
Browser extension that:
- Detects owned sources from user's library
- Automatically applies source filters to supported pages
- Provides easy management of owned sources list
- Allows toggling filter on/off

## Core Features

### 1. Source Detection & Storage
**Behavior:**
- On installation → auto-navigate to `https://www.dndbeyond.com/sources`
- On `/sources` page → scan for `<span class="owned-content">In Library</span>` within source listings
- Extract source slug from `<li>` attribute `data-collapsible-search` or link href
- Match slugs to source IDs via `https://www.dndbeyond.com/navigation/sources.json`
- Store owned source IDs in `chrome.storage.sync`

**Data Structure:**
```javascript
{
  "ownedSourceIds": [148, 39, 52], // Array of source IDs
  "filterEnabled": true, // Global toggle
  "lastUpdated": "2024-09-03T13:12:00Z" // ISO timestamp
}
```

### 2. Automatic Filter Application
**Supported Pages:**
- `/monsters`
- `/spells`
- `/equipment`
- `/magic-items`
- `/feats`
- `/backgrounds`

**Behavior:**
- Detect navigation to supported page
- Check if `filter-source` URL params match owned sources
- If missing/incomplete:
  - Preserve existing URL params (search, CR filters, etc.)
  - Append `filter-source=<id>` for each owned source
  - Reload page with updated URL

**Example:**
```
Before: https://www.dndbeyond.com/monsters?filter-cr-min=5
After:  https://www.dndbeyond.com/monsters?filter-cr-min=5&filter-source=148&filter-source=39&filter-source=52
```

### 3. Extension Popup UI
**Components:**

**A. Header**
- Extension title/logo
- Global enable/disable toggle

**B. Actions Section**
- "Update Owned Sources" button → opens `/sources` in new tab

**C. Sources Management**
- Display list of owned sources:
  - Fetch `sources.json` on popup open
  - Match stored IDs to source metadata
  - Show: source name, type, image
- Per-source controls:
  - Remove button (X icon) → removes from owned list
  - Add button (+) → shows dropdown of non-owned sources

**D. Status Info**
- "Last updated: [timestamp]"
- Count: "X sources in library"

**Mockup Structure:**
```
┌─────────────────────────────────┐
│ D&D Beyond Filter        [ON/OFF]│
├─────────────────────────────────┤
│ [Update Owned Sources]          │
├─────────────────────────────────┤
│ Your Sources (3):               │
│ ┌─────────────────────────────┐ │
│ │ [📖] Basic Rules         [X]│ │
│ │ [📖] Player's Handbook   [X]│ │
│ │ [📖] Xanathar's Guide    [X]│ │
│ └─────────────────────────────┘ │
│ [+ Add Source ▼]                │
├─────────────────────────────────┤
│ Last updated: 2h ago            │
└─────────────────────────────────┘
```

## Technical Specifications

### Manifest V3 Requirements
**Permissions:**
- `storage` - sync owned sources

**Host Permissions:**
- Specific D&D Beyond URLs only (sources, API, content pages)

**Content Scripts:**
- Match: supported page patterns
- Run at: `document_idle`
- Inject filter application logic

**Background Service Worker:**
- Handle installation → open sources page
- Coordinate storage updates
- Manage filter application

### Content Script Logic
```javascript
// Pseudo-code
if (isFilteredPage(window.location.href)) {
  chrome.storage.sync.get(['ownedSourceIds', 'filterEnabled'], (data) => {
    if (!data.filterEnabled) return;

    const currentParams = new URLSearchParams(window.location.search);
    const currentFilters = currentParams.getAll('filter-source');
    const ownedIds = data.ownedSourceIds.map(String);

    if (!arraysEqual(currentFilters.sort(), ownedIds.sort())) {
      // Preserve existing params, add/update source filters
      ownedIds.forEach(id => currentParams.append('filter-source', id));
      window.location.search = currentParams.toString();
    }
  });
}
```

### Sources Page Content Script
```javascript
// Pseudo-code
if (window.location.pathname === '/sources') {
  const ownedSources = [];
  const items = document.querySelectorAll('.sources-listing--item-wrapper');

  items.forEach(item => {
    if (item.querySelector('.owned-content')) {
      const link = item.querySelector('a[href^="sources/dnd/"]');
      const slug = link.href.split('/').pop();
      ownedSources.push(slug);
    }
  });

  // Fetch sources.json, map slugs to IDs
  fetch('https://www.dndbeyond.com/navigation/sources.json')
    .then(r => r.json())
    .then(allSources => {
      const ownedIds = allSources
        .filter(s => ownedSources.includes(s.slug))
        .map(s => s.id);

      chrome.storage.sync.set({
        ownedSourceIds: ownedIds,
        lastUpdated: new Date().toISOString()
      });
    });
}
```

## User Flows

### First-Time Setup
1. User installs extension
2. Extension auto-opens `/sources` page
3. Content script detects owned sources
4. Storage updated with owned source IDs
5. User sees success notification (optional)
6. Extension ready to filter

### Normal Usage
1. User navigates to `/monsters`
2. Content script detects missing filters
3. URL updated with owned source filters
4. Page reloads with filtered content
5. User sees only owned sources

### Managing Sources
1. User clicks extension icon
2. Popup shows current owned sources
3. User clicks "Update Owned Sources"
4. `/sources` page opens in new tab
5. Content script rescans library
6. Popup reflects updated list

### Manual Adjustments
1. User opens popup
2. Clicks [X] to remove source
3. Storage updated immediately
4. Next page visit reflects change
5. OR: User adds source via dropdown

## Edge Cases & Considerations

### URL Parameter Conflicts
- **Issue:** User manually adds different filters
- **Solution:** Extension only applies if filters missing/incomplete; preserves user's manual filters

### No Owned Sources
- **Issue:** New user with empty library
- **Solution:** Popup shows "No sources found. Visit Sources page to update."

### Storage Sync Limits
- **Limit:** 100KB total, 8KB per item
- **Mitigation:** Store only IDs (array of numbers), not metadata

### sources.json Unavailable
- **Issue:** Network error fetching JSON
- **Solution:** Show error in popup, use cached data if available

### Page Already Filtered
- **Issue:** User manually filtered, extension tries to override
- **Solution:** Compare existing filters; only reload if different from owned list

### Filter Toggle While on Filtered Page
- **Issue:** User disables filter on `/monsters?filter-source=X`
- **Solution:** Reload page without source filters when toggled off

## Success Metrics
- Installation → sources page visit rate: >95%
- Source detection accuracy: 100%
- Filter application success: >99%
- User retention: 7-day >60%, 30-day >40%

## Future Enhancements (v2)
- Encounter Builder support (UI-based filtering)
- Partial source filtering (include/exclude specific sources)
- Quick toggle per-page (bypass filter for one session)
- Import/export source lists
- Notification when new sources added to library

## Out of Scope
- Authentication/login handling
- Content unlocking or DRM bypass
- Modifying D&D Beyond's HTML/CSS (beyond reading)
- Cross-browser support (Firefox, Safari)
- Encounter Builder filtering (deferred to v2)

## Dependencies
- D&D Beyond's `/sources` page structure remains stable
- `sources.json` API remains available and stable
- URL parameter `filter-source` continues working
- Chrome Manifest V3 APIs

## Timeline Estimate
- Setup & boilerplate: 2 hours
- Source detection: 3 hours
- Filter application: 3 hours
- Popup UI: 4 hours
- Testing & polish: 3 hours
- **Total: ~15 hours**

## Open Questions
None - requirements clarified.
