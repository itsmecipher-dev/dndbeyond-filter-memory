chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.sync.set({
      ownedSourceIds: [],
      filterEnabled: true,
      lastUpdated: null
    }, () => {
      chrome.tabs.create({ url: 'https://www.dndbeyond.com/sources' });
    });
  }
});
