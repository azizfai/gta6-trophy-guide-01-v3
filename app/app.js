// Leonida Trophy Guide — tracker logic: load the trophy list, render the
// checklist, save progress in localStorage, filter, hide spoilers, export/import.
const STORE_KEY = 'leonida-trophy-guide-v4';
const SPOILER_KEY = 'leonida-trophy-guide-v4-spoilers';
const DEMO_EARNED = [2, 3, 4, 5, 8, 10, 15, 16, 21, 28, 33, 42, 44];

let trophies = [];
let earned = new Set();
let selectedId = null;

const $ = (id) => document.getElementById(id);
const listEl = $('trophy-list');
const detailEl = $('detail');

function loadStored() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) earned = new Set(JSON.parse(raw).earned || []);
  } catch (e) { earned = new Set(); }
}

function saveStored() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), savedAt: new Date().toISOString() }));
    $('saved-note').textContent = 'Progress saved in this browser (localStorage).';
  } catch (e) { $('saved-note').textContent = 'Could not save progress in this browser.'; }
}

function loadSpoiler() {
  try { return localStorage.getItem(SPOILER_KEY) === '1'; } catch (e) { return false; }
}

function saveSpoiler(on) {
  try { localStorage.setItem(SPOILER_KEY, on ? '1' : '0'); } catch (e) { /* ignore */ }
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function kindLabel(t) {
  const labels = { story: 'Story', side: 'Side quests', collectibles: 'Collectibles', activities: 'Activities', secrets: 'Secrets' };
  return labels[t.kind] || t.kind;
}

function stageLabel(t) {
  return ['Story', 'Heists & duo work', 'Open-world grind', 'Cleanup & 100%'][t.stage - 1] || ('Stage ' + t.stage);
}

function isHiddenBySpoiler(t) {
  return $('spoiler-toggle').checked && t.kind === 'story' && !earned.has(t.id);
}

function visibleTrophies() {
  const q = $('search').value.trim().toLowerCase();
  const kind = $('kind-filter').value;
  const grade = $('grade-filter').value;
  const missableOnly = $('missable-only').checked;
  const earnedOnly = $('earned-only').checked;
  return trophies.filter((t) => {
    if (kind && t.kind !== kind) return false;
    if (grade && t.grade !== grade) return false;
    if (missableOnly && !t.missable) return false;
    if (earnedOnly && !earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  $('progress-text').textContent = done + ' / ' + total + ' earned';
  $('progress-pct').textContent = pct + '%';
  $('progress-fill').style.width = pct + '%';
  const byGrade = {};
  trophies.forEach((t) => {
    byGrade[t.grade] = byGrade[t.grade] || [0, 0];
    byGrade[t.grade][1]++;
    if (earned.has(t.id)) byGrade[t.grade][0]++;
  });
  $('grade-counts').textContent = 'Platinum ' + (byGrade.platinum || [0, 0]).join('/') +
    ' · Gold ' + (byGrade.gold || [0, 0]).join('/') +
    ' · Silver ' + (byGrade.silver || [0, 0]).join('/') +
    ' · Bronze ' + (byGrade.bronze || [0, 0]).join('/');
}

function renderList() {
  const shown = visibleTrophies();
  listEl.innerHTML = '';
  shown.forEach((t) => {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleEarned(t.id, box.checked);
    });
    const body = document.createElement('div');
    body.className = 'trophy-body';
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = isHiddenBySpoiler(t) ? 'Hidden story trophy' : t.name;
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = isHiddenBySpoiler(t) ? 'Earn it to reveal the name and description.' : t.description;
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    const badges = [
      ['badge ' + t.grade, gradeLabel(t)],
      ['badge', kindLabel(t)],
      ['badge', stageLabel(t)],
    ];
    if (t.missable) badges.push(['badge missable', 'Missable']);
    if (!t.confirmed) badges.push(['badge unconfirmed', 'Unconfirmed']);
    if (earned.has(t.id)) badges.push(['badge earned-badge', 'Earned']);
    badges.forEach(([cls, text]) => {
      const b = document.createElement('span');
      b.className = cls;
      b.textContent = text;
      meta.appendChild(b);
    });
    body.appendChild(name);
    body.appendChild(desc);
    body.appendChild(meta);
    li.appendChild(box);
    li.appendChild(body);
    li.addEventListener('click', () => selectTrophy(t.id));
    listEl.appendChild(li);
  });
  $('filter-count').textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies.';
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    detailEl.innerHTML = '<p class="detail-empty">Select a trophy on the left to read its full guide and sources.</p>';
    return;
  }
  detailEl.innerHTML = '';
  const h = document.createElement('h3');
  h.textContent = isHiddenBySpoiler(t) ? 'Hidden story trophy' : t.name;
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = isHiddenBySpoiler(t) ? 'Earn it to reveal the name and description.' : t.description;
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  [[ 'badge ' + t.grade, gradeLabel(t)], ['badge', kindLabel(t)], ['badge', stageLabel(t)]].forEach(([cls, text]) => {
    const b = document.createElement('span');
    b.className = cls;
    b.textContent = text;
    meta.appendChild(b);
  });
  if (t.missable) {
    const b = document.createElement('span');
    b.className = 'badge missable';
    b.textContent = 'Missable';
    meta.appendChild(b);
  }
  if (!t.confirmed) {
    const b = document.createElement('span');
    b.className = 'badge unconfirmed';
    b.textContent = 'Unconfirmed';
    meta.appendChild(b);
  }
  const guideH = document.createElement('h4');
  guideH.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  const srcH = document.createElement('h4');
  srcH.textContent = 'Sources';
  const srcList = document.createElement('ul');
  srcList.className = 'sources-list';
  t.sources.forEach((s) => {
    const li = document.createElement('li');
    li.textContent = s;
    srcList.appendChild(li);
  });
  const earnedBtn = document.createElement('button');
  earnedBtn.type = 'button';
  earnedBtn.textContent = earned.has(t.id) ? 'Mark as not earned' : 'Mark as earned';
  earnedBtn.addEventListener('click', () => toggleEarned(t.id, !earned.has(t.id)));
  detailEl.appendChild(h);
  detailEl.appendChild(desc);
  detailEl.appendChild(meta);
  detailEl.appendChild(guideH);
  detailEl.appendChild(guide);
  detailEl.appendChild(srcH);
  detailEl.appendChild(srcList);
  detailEl.appendChild(earnedBtn);
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
}

function toggleEarned(id, on) {
  if (on) earned.add(id); else earned.delete(id);
  saveStored();
  renderAll();
}

function selectTrophy(id) {
  selectedId = id;
  renderList();
  renderDetail();
}

function exportProgress() {
  const data = JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b), exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error('bad file');
      const valid = new Set(trophies.map((t) => t.id));
      earned = new Set(ids.filter((n) => valid.has(Number(n))).map(Number));
      saveStored();
      renderAll();
      $('saved-note').textContent = 'Progress imported: ' + earned.size + ' trophies earned.';
    } catch (e) {
      $('saved-note').textContent = 'Import failed: that file is not a progress export from this guide.';
    }
  };
  reader.readAsText(file);
}

function applyDemoSeed() {
  const params = new URLSearchParams(location.search);
  if (params.get('demo') === '1') {
    earned = new Set(DEMO_EARNED);
    saveStored();
  }
  const detail = Number(params.get('detail'));
  if (detail && trophies.some((t) => t.id === detail)) selectedId = detail;
  // Deep-linkable filters, so a filtered view can be shared or screenshotted.
  const kind = params.get('kind');
  if (kind && ['story', 'side', 'collectibles', 'activities', 'secrets'].includes(kind)) $('kind-filter').value = kind;
  const grade = params.get('grade');
  if (grade && ['platinum', 'gold', 'silver', 'bronze'].includes(grade)) $('grade-filter').value = grade;
  const q = params.get('q');
  if (q) $('search').value = q;
  if (params.get('missable') === '1') $('missable-only').checked = true;
  if (params.get('spoilers') === 'off') {
    $('spoiler-toggle').checked = false;
    saveSpoiler(false);
  }
}

function jumpToHash() {
  const hash = location.hash.replace('#', '');
  if (hash === 'roadmap' || hash === 'tracker' || hash === 'sources' || hash === 'missable-alert') {
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView();
  }
  if (hash === 'detail' && detailEl) detailEl.scrollIntoView();
}

function bindControls() {
  ['search', 'kind-filter', 'grade-filter', 'missable-only', 'earned-only'].forEach((id) => {
    $(id).addEventListener('input', renderList);
    $(id).addEventListener('change', renderList);
  });
  $('spoiler-toggle').addEventListener('change', () => {
    saveSpoiler($('spoiler-toggle').checked);
    renderAll();
  });
  $('export-btn').addEventListener('click', exportProgress);
  $('import-btn').addEventListener('click', () => $('import-file').click());
  $('import-file').addEventListener('change', (ev) => {
    if (ev.target.files && ev.target.files[0]) importProgress(ev.target.files[0]);
    ev.target.value = '';
  });
  $('reset-btn').addEventListener('click', () => {
    if (window.confirm('Reset all tracker progress?')) {
      earned = new Set();
      saveStored();
      renderAll();
    }
  });
}

fetch('data/trophies.json')
  .then((r) => r.json())
  .then((data) => {
    trophies = data.trophies;
    loadStored();
    $('spoiler-toggle').checked = loadSpoiler();
    bindControls();
    applyDemoSeed();
    renderAll();
    jumpToHash();
  })
  .catch(() => {
    listEl.innerHTML = '<li class="trophy"><div class="trophy-body">Could not load the trophy list. Open this guide from its own files (for example, node serve.ts) so data/trophies.json loads.</div></li>';
  });
