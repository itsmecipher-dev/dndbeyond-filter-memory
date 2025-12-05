const FILTERED_PAGES = [
  '/monsters',
  '/spells',
  '/equipment',
  '/magic-items',
  '/feats',
  '/backgrounds'
];

function isFilteredPage(pathname) {
  return FILTERED_PAGES.some(page => pathname === page);
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, i) => val === sortedB[i]);
}

if (isFilteredPage(window.location.pathname)) {
  chrome.storage.sync.get(['ownedSourceIds', 'filterEnabled'], (data) => {
    if (!data.filterEnabled || !data.ownedSourceIds || data.ownedSourceIds.length === 0) {
      return;
    }

    const currentParams = new URLSearchParams(window.location.search);
    const currentFilters = currentParams.getAll('filter-source');
    const ownedIds = data.ownedSourceIds.map(String);

    if (!arraysEqual(currentFilters, ownedIds)) {
      currentParams.delete('filter-source');
      ownedIds.forEach(id => currentParams.append('filter-source', id));

      const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
      window.location.replace(newUrl);
    }
  });
}
