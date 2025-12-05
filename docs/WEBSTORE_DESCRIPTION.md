# Chrome Web Store Listing

## Short Description (132 characters max)

Automatically filter D&D Beyond content to show only sources you own. No more scrolling through unavailable monsters, spells, and items.

## Detailed Description (16,000 characters max)

**Stop wasting time filtering D&D Beyond content manually!**

This extension automatically detects which sourcebooks you own on D&D Beyond and filters all content pages to show only the monsters, spells, items, feats, and backgrounds available to you.

### 🎯 Problem Solved

By default, D&D Beyond shows content from ALL sourcebooks—including those you don't own. This means:
- Scrolling through hundreds of unavailable monsters
- Finding the perfect spell only to discover you can't use it
- Manually re-applying filters on every page visit
- Wasting time managing source selections

### ✨ What This Extension Does

**Automatic Detection:**
Scans your D&D Beyond library once to identify all sourcebooks you own.

**Smart Filtering:**
Automatically applies source filters when you visit:
- Monsters
- Spells
- Equipment
- Magic Items
- Feats
- Backgrounds

**Seamless Experience:**
The extension works quietly in the background—no configuration needed. Just browse D&D Beyond like normal and see only content you actually have access to.

**Easy Management:**
- Click the extension icon to view your owned sources
- Toggle filtering on/off with one click
- Manually refresh your library when you purchase new content
- Remove individual sources if needed

### 🚀 How It Works

1. **Install** the extension
2. **Automatic Setup**: The extension opens your D&D Beyond sources page and scans your library
3. **Done!** Browse any content page and see only your owned sources

### 📋 Features

✅ **Auto-Detection**: Automatically finds all sourcebooks in your library
✅ **Zero Configuration**: Works immediately after installation
✅ **Respects Manual Filters**: Won't override your custom selections
✅ **Privacy-First**: All data stored locally in your browser
✅ **Lightweight**: Minimal performance impact
✅ **Free & Open Source**: No ads, no tracking, no premium features

### 🔒 Privacy & Security

- **No data collection**: Your library information never leaves your browser
- **No tracking**: We don't know who you are or what you own
- **Local storage only**: All data stored in Chrome's secure sync storage
- **Minimal permissions**: Only accesses dndbeyond.com for functionality

### 📦 Supported Sources

Works with ALL D&D Beyond sourcebooks and adventures:
- Player's Handbook, Monster Manual, Dungeon Master's Guide
- Xanathar's Guide, Tasha's Cauldron, Mordenkainen's
- All campaign books and setting guides
- Third-party content from partners

*Note: Reference sources like Unearthed Arcana and Sage Advice are automatically excluded as they don't support filtering.*

### 🔄 Updates

The extension syncs your owned sources automatically when you:
- Click "Update Owned Sources" in the popup
- Revisit the D&D Beyond sources page

### 💡 Perfect For

- **Players** who want quick access to character options
- **Dungeon Masters** browsing for the perfect monster or magic item
- **Content Creators** researching D&D mechanics
- **Anyone** tired of manually filtering D&D Beyond

### 🆘 Support

- Issues or questions? Visit our GitHub repository
- Not working? Check that you're logged into D&D Beyond
- New to D&D Beyond? This extension works best with purchased content

### ⚖️ Legal

This is an unofficial third-party extension. Not affiliated with or endorsed by D&D Beyond or Wizards of the Coast. D&D Beyond is a trademark of Wizards of the Coast LLC.

---

**Install now and never manually filter D&D Beyond content again!**

## Screenshots (Required: 1280x800 or 640x400)

### Screenshot 1: Extension Popup
**Caption**: "View and manage your owned sources with one click"
**Show**: Extension popup displaying owned sourcebooks with toggle and update button

### Screenshot 2: Before/After Filtering
**Caption**: "See only content from sources you own"
**Show**: Split screen - monsters page before (100+ results) vs after (owned sources only)

### Screenshot 3: Auto-Detection
**Caption**: "Automatic setup detects your D&D Beyond library"
**Show**: Sources page with "In Library" badges highlighted

### Screenshot 4: Settings & Controls
**Caption**: "Easy controls - toggle on/off or update your library anytime"
**Show**: Popup interface with clear UI elements labeled

### Screenshot 5: Filtered Content
**Caption**: "Browse monsters, spells, and more with automatic filtering"
**Show**: Monsters/spells listing page with URL showing active filters

## Promotional Tile (440x280)

**Design elements:**
- D&D Beyond logo or d20 icon
- Text: "Auto-Filter Your D&D Beyond Library"
- Subtext: "Show Only What You Own"
- Extension icon
- Clean, simple design with D&D theme colors

## Category

**Primary**: Productivity

**Tags**:
- D&D Beyond
- Dungeons & Dragons
- Filter
- Productivity
- Gaming

## Single Purpose Description (For Chrome Web Store Review)

This extension serves a single purpose: to automatically filter D&D Beyond content pages to display only sources owned by the user. It detects owned sourcebooks from the user's D&D Beyond library and applies appropriate source filters when browsing monsters, spells, equipment, magic items, feats, and backgrounds.

## Permission Justifications (For Chrome Web Store Review)

### storage
**Justification**: Required to save the user's owned source IDs and extension settings (filter enabled/disabled status, last update timestamp) using Chrome's sync storage for cross-device functionality.

### host_permissions (scoped to specific URLs)
**Justification**: Required to access only these specific D&D Beyond pages:
1. `https://www.dndbeyond.com/sources` - Read the user's owned sources from their library page
2. `https://www.dndbeyond.com/navigation/sources.json` - Fetch the API to map source slugs to filter IDs
3. Content list pages (monsters, spells, equipment, magic-items, feats, backgrounds) with and without query parameters - Apply source filters to URLs

The extension requests the minimum possible access, excluding individual item pages (e.g., `/monsters/123-adult-red-dragon`) and all other D&D Beyond pages.

## Maturity Rating

**Rating**: Everyone

**Content**: The extension provides filtering functionality for D&D Beyond, a fantasy role-playing game resource website. No mature content, violence, or inappropriate material.

## Privacy Policy URL

https://github.com/[your-username]/dndbeyond-filter-memory/blob/main/PRIVACY.md

*(Note: You'll need to create a simple privacy policy)*

## Support URL

https://github.com/[your-username]/dndbeyond-filter-memory/issues

## Homepage URL

https://github.com/[your-username]/dndbeyond-filter-memory
