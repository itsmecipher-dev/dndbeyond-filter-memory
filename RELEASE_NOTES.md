# Release Notes - v1.0.2

## What's Fixed

### Filter Validation Error ✅
Previously, the extension would cause an error when trying to filter by certain sources like "Sage Advice & Errata" (#166). This happened because these sources are reference materials and don't support the filter parameter.

**Solution**: Automatic exclusion of non-filterable sources:
- Unearthed Arcana (playtest content)
- Sage Advice & Errata (2024)
- Sage Advice Compendium (2014)
- D&D Beyond Basic Rules
- Basic Rules (2014)

These sources are now automatically filtered out during detection, preventing the error.

### Source Display Fixed ✅
Sources now display with correct names and types instead of "undefined" and numbers.

**Before**:
```
📖 undefined
   1
```

**After**:
```
📖 Player's Handbook
   Sourcebook
```

## What Changed

### User Interface
- Added informational note at bottom of popup explaining why some sources might not appear
- Note: "Some sources (Unearthed Arcana, Sage Advice, Basic Rules) are excluded as they don't support filtering"

### Under the Hood
- Improved source detection timing (2-second delay for page load)
- Enhanced error handling and logging
- Better debugging output in console
- Fixed API field mapping (label vs name)

## Testing Steps

1. **Reload Extension**
   - Go to `chrome://extensions/`
   - Click the refresh icon

2. **Clear Old Data** (Optional but recommended)
   - Open popup
   - Click "Update Owned Sources"
   - Wait for page to load and scan

3. **Verify Sources**
   - Open popup
   - Check that sources display with real names
   - Verify count excludes problematic sources
   - Note informational text at bottom

4. **Test Filtering**
   - Navigate to https://www.dndbeyond.com/monsters
   - Should NOT see validation errors
   - URL should contain filter-source parameters
   - Content should be filtered to owned sources

## Known Issues

None currently known. If you encounter issues:
1. Check browser console for errors
2. Verify you're logged into D&D Beyond
3. See TROUBLESHOOTING.md for common solutions

## Upgrade Notes

If upgrading from v1.0.0 or v1.0.1:
- Recommended to re-scan sources via "Update Owned Sources" button
- This ensures the blacklist is applied to your existing data
- Old filtered sources will be automatically removed
