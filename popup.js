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
  const sourcesList = document.getElementById('sourcesList');
  const sourcesCount = document.getElementById('sourcesCount');
  const emptyState = document.getElementById('emptyState');

  console.log('[Popup] Displaying sources:', ownedIds);
  console.log('[Popup] sourcesData loaded:', sourcesData.length, 'items');

  sourcesCount.textContent = ownedIds.length;

  if (ownedIds.length === 0) {
    sourcesList.innerHTML = '';
    emptyState.classList.add('visible');
    return;
  }

  emptyState.classList.remove('visible');

  if (sourcesData.length === 0) {
    console.error('[Popup] sourcesData not loaded yet!');
    sourcesList.innerHTML = '<div style="padding: 16px; color: #718096; text-align: center;">Loading sources data...</div>';
    return;
  }

  const ownedSources = sourcesData.filter(source => ownedIds.includes(source.id));

  console.log('[Popup] Matched sources:', ownedSources.length);

  if (ownedSources.length === 0) {
    console.error('[Popup] No sources matched! IDs:', ownedIds);
    sourcesList.innerHTML = '<div style="padding: 16px; color: #e63946; text-align: center;">Error: Could not match source IDs</div>';
    return;
  }

  const getTypeLabel = (typeId) => {
    switch(typeId) {
      case 1: return 'Sourcebook';
      case 2: return 'Adventure';
      case 3: return 'Campaign Setting';
      default: return 'Source';
    }
  };

  sourcesList.innerHTML = ownedSources
    .map(source => `
      <div class="source-item" data-id="${source.id}">
        <span class="source-icon">📖</span>
        <div class="source-info">
          <div class="source-name">${source.label}</div>
          <div class="source-type">${getTypeLabel(source.type)}</div>
        </div>
        <button class="btn-remove" data-id="${source.id}">×</button>
      </div>
    `)
    .join('');

  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      removeSource(id);
    });
  });
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
}
