if (window.location.pathname === '/sources') {
  setTimeout(() => {
    detectOwnedSources();
  }, 2000);
}

async function detectOwnedSources() {
  const ownedSlugs = [];
  const items = document.querySelectorAll('.sources-listing--item-wrapper');

  console.log(`[D&D Beyond Filter] Found ${items.length} source items`);

  items.forEach(item => {
    const ownedBadge = item.querySelector('.owned-content');
    if (ownedBadge) {
      const link = item.querySelector('a[href*="sources/"]');
      if (link) {
        const href = link.getAttribute('href');
        const slug = href.split('/').pop();
        ownedSlugs.push(slug);
        console.log(`[D&D Beyond Filter] Found owned source: ${slug}`);
      }
    }
  });

  console.log(`[D&D Beyond Filter] Total owned sources detected: ${ownedSlugs.length}`);

  if (ownedSlugs.length === 0) {
    console.log('[D&D Beyond Filter] No owned sources found - ensure you are logged in');
    return;
  }

  try {
    const response = await fetch('https://www.dndbeyond.com/navigation/sources.json');
    const allSources = await response.json();

    const NON_FILTERABLE_SLUGS = [
      'ua',
      'sae',
      'sac'
    ];

    const ownedIds = allSources
      .filter(source => ownedSlugs.includes(source.slug))
      .filter(source => !NON_FILTERABLE_SLUGS.includes(source.slug))
      .map(source => source.id);

    console.log(`[D&D Beyond Filter] Filtered out non-filterable sources`);

    chrome.storage.sync.set({
      ownedSourceIds: ownedIds,
      lastUpdated: new Date().toISOString()
    }, () => {
      console.log(`[D&D Beyond Filter] Updated owned sources: ${ownedIds.length} sources`);
    });
  } catch (error) {
    console.error('[D&D Beyond Filter] Error fetching sources.json:', error);
  }
}
