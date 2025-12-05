# Troubleshooting Guide

## No Sources Detected

### Check Browser Console
1. Open D&D Beyond sources page: https://www.dndbeyond.com/sources
2. Open browser console (F12)
3. Look for messages starting with `[D&D Beyond Filter]`

Expected output:
```
[D&D Beyond Filter] Found X source items
[D&D Beyond Filter] Found owned source: br-2024
[D&D Beyond Filter] Found owned source: phb-2014
...
[D&D Beyond Filter] Total owned sources detected: X
[D&D Beyond Filter] Updated owned sources: X sources
```

### Common Issues

#### Issue 1: "Found 0 source items"
**Cause**: Script ran before page loaded or wrong page structure

**Solutions**:
- Wait 3-5 seconds on the sources page
- Scroll down to load all sources (they may be lazy-loaded)
- Refresh the page (Ctrl+R or Cmd+R)
- Check URL is exactly `https://www.dndbeyond.com/sources`

#### Issue 2: "No owned sources found"
**Cause**: Not logged in or no sources owned

**Solutions**:
- Ensure you're logged into D&D Beyond
- Verify you see "In Library" badges on source items
- Check that you actually own sources in your library

#### Issue 3: Script doesn't run at all
**Cause**: Extension not loaded or manifest issue

**Solutions**:
- Go to `chrome://extensions/`
- Check extension is enabled
- Click refresh icon on the extension
- Check for errors in extension details

#### Issue 4: Sources detected but not saved
**Cause**: Storage permission or fetch error

**Solutions**:
- Check console for fetch errors
- Verify `sources.json` loads: https://www.dndbeyond.com/navigation/sources.json
- Check storage permissions in manifest

### Debug Test Page
Open `docs/test-detection.html` in your browser to test the detection logic with sample HTML.

### Manual Testing Steps

1. **Reload Extension**
   ```
   chrome://extensions/ → Click refresh icon
   ```

2. **Check Storage**
   Open console on any D&D Beyond page:
   ```javascript
   chrome.storage.sync.get(['ownedSourceIds', 'filterEnabled', 'lastUpdated'], console.log)
   ```

3. **Manual Trigger**
   On sources page, run in console:
   ```javascript
   // Paste entire content-sources.js into console and run detectOwnedSources()
   ```

4. **Verify Filter Application**
   - Navigate to https://www.dndbeyond.com/monsters
   - Check URL contains `?filter-source=X&filter-source=Y...`
   - Open console, look for filter messages

## Filter Not Applied

### Check Settings
1. Click extension icon
2. Verify toggle is ON
3. Check sources list is not empty
4. Verify "Last updated" shows a timestamp

### Check URL
1. Navigate to a content page (monsters/spells/etc)
2. Check URL parameters
3. Should contain `filter-source` params

### Console Messages
Look for:
```
[D&D Beyond Filter] Applying filters...
```

## Performance Issues

### Slow Page Loads
**Cause**: Extension reloading page multiple times

**Solution**:
- Extension only reloads once if filters don't match
- If loops occur, disable extension and report issue

### Storage Sync Issues
**Cause**: Chrome sync limits

**Solution**:
- Extension stores minimal data (array of numbers)
- Should be well under 100KB limit
- If issues persist, try signing out and back into Chrome

## Getting Help

If none of these solutions work:

1. **Collect Debug Info**:
   - Browser console output
   - Extension version
   - Chrome version
   - Screenshot of sources page

2. **Check Extension Logs**:
   ```
   chrome://extensions/ → Details → Inspect views: service worker
   ```

3. **Test with Minimal Sources**:
   - Remove most sources from library
   - Keep only 1-2 sources
   - Test detection again

4. **Reinstall Extension**:
   - Remove extension
   - Clear Chrome cache
   - Reinstall extension
   - Test first-time setup flow
