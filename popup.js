let sourcesData = [];

document.addEventListener('DOMContentLoaded', async () => {
  setVersionFromManifest();
  await loadSourcesMetadata();
  await loadSettings();
  setupEventListeners();
});

function setVersionFromManifest() {
  const manifest = chrome.runtime.getManifest();
  const versionEl = document.getElementById('popupVersion');
  if (versionEl) {
    versionEl.textContent = `v${manifest.version}`;
  }
}

async function loadSourcesMetadata() {
  try {
    const response = await fetch('https://www.dndbeyond.com/navigation/sources.json');
    sourcesData = await response.json();
  } catch (error) {
    console.error('Error loading sources metadata:', error);
  }
}

async function loadSettings() {
  chrome.storage.sync.get(['ownedSourceIds', 'filterEnabled', 'lastUpdated'], (data) => {
    const filterToggle = document.getElementById('filterToggle');
    filterToggle.checked = data.filterEnabled !== false;

    displaySources(data.ownedSourceIds || []);
    updateLastUpdated(data.lastUpdated);
  });
}

function displaySources(ownedIds) {
  const sourcesSummary = document.getElementById('sourcesSummary');
  const sourcebookCount = document.getElementById('sourcebookCount');
  const adventureCount = document.getElementById('adventureCount');
  const emptyState = document.getElementById('emptyState');

  if (ownedIds.length === 0) {
    sourcesSummary.classList.add('hidden');
    emptyState.classList.add('visible');
    return;
  }

  emptyState.classList.remove('visible');
  sourcesSummary.classList.remove('hidden');

  if (sourcesData.length === 0) {
    sourcebookCount.textContent = '...';
    adventureCount.textContent = '...';
    return;
  }

  const ownedSources = sourcesData.filter(source => ownedIds.includes(source.id));
  const sourcebooks = ownedSources.filter(s => s.type === 1).length;
  const adventures = ownedSources.filter(s => s.type === 2).length;

  sourcebookCount.textContent = sourcebooks;
  adventureCount.textContent = adventures;
}

function removeSource(idToRemove) {
  chrome.storage.sync.get(['ownedSourceIds'], (data) => {
    const updatedIds = (data.ownedSourceIds || []).filter(id => id !== idToRemove);
    chrome.storage.sync.set({ ownedSourceIds: updatedIds }, () => {
      displaySources(updatedIds);
    });
  });
}

function updateLastUpdated(timestamp) {
  const lastUpdatedEl = document.getElementById('lastUpdated');

  if (!timestamp) {
    lastUpdatedEl.textContent = 'Never updated';
    return;
  }

  const now = new Date();
  const updated = new Date(timestamp);
  const diffMs = now - updated;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let timeText;
  if (diffMins < 1) {
    timeText = 'Just now';
  } else if (diffMins < 60) {
    timeText = `${diffMins}m ago`;
  } else if (diffHours < 24) {
    timeText = `${diffHours}h ago`;
  } else {
    timeText = `${diffDays}d ago`;
  }

  lastUpdatedEl.textContent = `Last updated: ${timeText}`;
}

function setupEventListeners() {
  const filterToggle = document.getElementById('filterToggle');
  filterToggle.addEventListener('change', (e) => {
    chrome.storage.sync.set({ filterEnabled: e.target.checked });
  });

  const updateBtn = document.getElementById('updateSourcesBtn');
  updateBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.dndbeyond.com/sources' });
  });

  const manageBtn = document.getElementById('manageSourcesBtn');
  manageBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}
