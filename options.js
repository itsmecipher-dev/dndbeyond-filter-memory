const NON_FILTERABLE_SLUGS = ['ua', 'sae', 'sac'];
let allSources = [];
let selectedIds = new Set();
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  await loadAllSources();
  await loadCurrentSelection();
  renderSources();
  setupEventListeners();
});

async function loadAllSources() {
  try {
    const response = await fetch('https://www.dndbeyond.com/navigation/sources.json');
    const sources = await response.json();
    allSources = sources.filter(s => !NON_FILTERABLE_SLUGS.includes(s.slug));
    allSources.sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    console.error('Error loading sources:', error);
    document.getElementById('sourcesGrid').innerHTML =
      '<div class="loading-state" style="color: #e63946;">Error loading sources. Please refresh.</div>';
  }
}

async function loadCurrentSelection() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['ownedSourceIds'], (data) => {
      const ids = data.ownedSourceIds || [];
      selectedIds = new Set(ids);
      updateSelectedCount();
      resolve();
    });
  });
}

function getTypeLabel(typeId) {
  switch(typeId) {
    case 1: return 'Sourcebook';
    case 2: return 'Adventure';
    default: return 'Source';
  }
}

function renderSources() {
  const grid = document.getElementById('sourcesGrid');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();

  const filteredSources = allSources.filter(source => {
    const matchesType = currentFilter === 'all' || source.type === parseInt(currentFilter);
    const matchesSearch = source.label.toLowerCase().includes(searchTerm);
    return matchesType && matchesSearch;
  });

  if (filteredSources.length === 0) {
    grid.innerHTML = '';
    document.getElementById('emptySearch').classList.add('visible');
    return;
  }

  document.getElementById('emptySearch').classList.remove('visible');

  grid.innerHTML = filteredSources.map(source => `
    <div class="source-card ${selectedIds.has(source.id) ? 'selected' : ''}" data-id="${source.id}">
      <div class="source-checkbox">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      </div>
      <div class="source-card-info">
        <div class="source-card-name">${source.label}</div>
        <div class="source-card-type">${getTypeLabel(source.type)}</div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.source-card').forEach(card => {
    card.addEventListener('click', () => toggleSource(parseInt(card.dataset.id)));
  });
}

function toggleSource(id) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    selectedIds.add(id);
  }

  const card = document.querySelector(`.source-card[data-id="${id}"]`);
  if (card) {
    card.classList.toggle('selected', selectedIds.has(id));
  }

  updateSelectedCount();
}

function updateSelectedCount() {
  document.getElementById('selectedCount').textContent = selectedIds.size;
}

function selectAll() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();

  allSources.forEach(source => {
    const matchesType = currentFilter === 'all' || source.type === parseInt(currentFilter);
    const matchesSearch = source.label.toLowerCase().includes(searchTerm);
    if (matchesType && matchesSearch) {
      selectedIds.add(source.id);
    }
  });

  renderSources();
  updateSelectedCount();
}

function deselectAll() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();

  allSources.forEach(source => {
    const matchesType = currentFilter === 'all' || source.type === parseInt(currentFilter);
    const matchesSearch = source.label.toLowerCase().includes(searchTerm);
    if (matchesType && matchesSearch) {
      selectedIds.delete(source.id);
    }
  });

  renderSources();
  updateSelectedCount();
}

function saveSelection() {
  const idsArray = Array.from(selectedIds);

  chrome.storage.sync.set({
    ownedSourceIds: idsArray,
    lastUpdated: new Date().toISOString()
  }, () => {
    showToast();
  });
}

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 2000);
}

function setupEventListeners() {
  document.getElementById('searchInput').addEventListener('input', () => {
    renderSources();
  });

  document.getElementById('selectAllBtn').addEventListener('click', selectAll);
  document.getElementById('deselectAllBtn').addEventListener('click', deselectAll);
  document.getElementById('saveBtn').addEventListener('click', saveSelection);

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.type;
      renderSources();
    });
  });
}
