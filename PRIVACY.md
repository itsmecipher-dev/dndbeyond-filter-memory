# Privacy Policy

**Last Updated**: November 7, 2024

## Overview

The D&D Beyond Owned Sources Filter extension ("the Extension") is committed to protecting your privacy. This privacy policy explains what data the Extension collects, how it's used, and your rights.

## Data Collection

### What We Collect

The Extension collects and stores the following data **locally in your browser only**:

1. **Owned Source IDs**: A list of numerical IDs representing D&D Beyond sourcebooks you own
2. **Filter Status**: Whether filtering is enabled or disabled (boolean)
3. **Last Updated Timestamp**: When your owned sources list was last updated

### What We DON'T Collect

- Personal identification information (name, email, address)
- Browsing history outside of D&D Beyond
- Payment information
- Analytics or usage statistics
- Cookies or tracking data

## How Data is Used

The collected data is used solely to:

1. Apply appropriate source filters when you browse D&D Beyond content pages
2. Display your owned sources in the extension popup
3. Manage the filter on/off toggle state
4. Indicate when your library was last scanned

## Data Storage

All data is stored using Chrome's `chrome.storage.sync` API, which:

- Stores data **locally in your browser**
- Syncs across your Chrome browsers if you're signed into Chrome (optional)
- Is **never transmitted to external servers**
- Is **never shared with third parties**
- Is controlled entirely by you

## Data Sharing

**We do not share, sell, rent, or trade your data with anyone.**

The Extension operates entirely locally in your browser. No data is sent to external servers, analytics services, or third parties.

## Third-Party Services

The Extension interacts with D&D Beyond (dndbeyond.com) only to:

1. Read which sources you own from the `/sources` page
2. Fetch the public `sources.json` API for source metadata
3. Apply filter parameters to content page URLs

These interactions are standard web requests similar to normal browsing. D&D Beyond may collect data according to their own privacy policy, which is independent of this Extension.

## Permissions

The Extension requests the following Chrome permissions:

### storage
Used to save your owned sources list and settings locally in Chrome's sync storage.

### host_permissions
Required to access only these specific D&D Beyond pages:
- `/sources` - Read your owned sources
- `/navigation/sources.json` - Map source slugs to IDs
- Content pages (monsters, spells, equipment, magic-items, feats, backgrounds) - Apply filters

## User Control

You have full control over your data:

- **View Data**: Click the extension icon to see your owned sources
- **Update Data**: Click "Update Owned Sources" to rescan your library
- **Delete Data**: Remove individual sources or uninstall the extension
- **Disable**: Toggle filtering off without deleting data
- **Complete Removal**: Uninstalling the extension removes all stored data

## Children's Privacy

The Extension does not knowingly collect information from children under 13. The Extension is designed for use with D&D Beyond, which has its own age requirements and privacy policies.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be posted in the extension's repository with an updated "Last Updated" date.

## Data Retention

Data is retained until you:
- Manually remove sources in the popup
- Uninstall the extension
- Clear Chrome's sync storage

## Your Rights

Depending on your location, you may have rights including:
- Right to access your data (view in popup)
- Right to delete your data (uninstall extension)
- Right to data portability (export via Chrome sync)

## Security

While we implement reasonable security measures (using Chrome's built-in storage APIs), no method of electronic storage is 100% secure. The Extension does not transmit data over networks, reducing security risks.

## Open Source

This Extension is open source. You can review the complete source code at:
https://github.com/[your-username]/dndbeyond-filter-memory

## Contact

For questions about this privacy policy or the Extension:
- GitHub Issues: https://github.com/[your-username]/dndbeyond-filter-memory/issues

## Legal

This Extension is not affiliated with or endorsed by D&D Beyond or Wizards of the Coast. D&D Beyond is a trademark of Wizards of the Coast LLC.

## Consent

By installing and using this Extension, you consent to this privacy policy.

---

**Summary**: This Extension stores your D&D Beyond owned sources list locally in your browser to filter content pages. We don't collect personal information, share data with anyone, or track your usage. You have full control over your data at all times.
