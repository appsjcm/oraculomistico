// settings.js - Configuración rediseñada, notas, historial, estadísticas, favoritos, voz premium y 
import { store, loadHistory, saveHistory, getNotes, saveNote, addToHistory, removeSavedSpread } from './store.js';
import { toast, openModal, cardHTML, runeCardHTML, sanitizeHTML } from './utils.js';
import { getPremiumVoices, speakText } from './voice.js';

// ========== NOTAS ==========
export function renderNotesSettings() {
  const notes = getNotes();
  const container = document.getElementById('settingsNotesList');
  if (!container) return;
  const noNotes = document.getElementById('settingsNoNotes');
  if (notes.length === 0) {
    if (noNotes) noNotes.style.display = 'block';
    container.innerHTML = '';
    return;
  }
  if (noNotes) noNotes.style.display = 'none';
  container.innerHTML = notes.map((n, i) => `
    <div class="note-card" onclick="window.openNoteModal(${i})">
      <div class="note-date">${new Date(n.date).toLocaleString()}</div>
      <div class="note-preview">${sanitizeHTML(n.content.substring(0, 80))}...</div>
    </div>
  `).join('');
}

window.openNoteModal = function(idx) {
  const notes = getNotes();
  const note = notes[idx];
  const modal = openModal(`<textarea id="editNote" class="note-editor">${sanitizeHTML(note.content)}</textarea><div class="action-buttons"><button class="btn-mystic btn-save" id="updateNote">Actualizar</button><button class="btn-mystic" id="deleteNote" style="background:#f87171;">Eliminar</button></div>`);
  document.getElementById('updateNote')?.addEventListener('click', () => {
    const newContent = document.getElementById('editNote').value;
    const updatedNotes = getNotes();
    updatedNotes[idx].content = newContent;
    updatedNotes[idx].date = new Date().toISOString();
    localStorage.setItem('oraculo_notes', JSON.stringify(updatedNotes));
    renderNotesSettings();
    modal.remove();
    toast('Nota actualizada');
  });
  document.getElementById('deleteNote')?.addEventListener('click', () => {
    const updatedNotes = getNotes();
    updatedNotes.splice(idx, 1);
    localStorage.setItem('oraculo_notes', JSON.stringify(updatedNotes));
    renderNotesSettings();
    modal.remove();
    toast('Nota eliminada');
  });
};

export function addNoteFromEditorSettings() {
  const text = document.getElementById('settingsNewNote').value.trim();
  if (!text) return toast('Escribe algo');
  saveNote(text);
  document.getElementById('settingsNewNote').value = '';
  renderNotesSettings();
}

// ========== HISTORIAL ==========
export function renderHistorySettings() {
  const container = document.getElementById('settingsHistorialList');
  if (!container) return;
  const searchTerm = document.getElementById('settingsHistorySearch')?.value.toLowerCase() || '';
  const typeFilter = document.getElementById('settingsHistoryTypeFilter')?.value || 'all';
  const dateFilter = document.getElementById('settingsHistoryDateFilter')?.value || 'all';
  let filtered = store.historial.filter(entry => {
    if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
    if (dateFilter !== 'all') {
      const days = parseInt(dateFilter);
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - days);
      if (new Date(entry.date) < limitDate) return false;
    }
    if (searchTerm) {
      const questionMatch = entry.question?.toLowerCase().includes(searchTerm);
      let dataMatch = false;
      if (entry.type === 'tarot') dataMatch = entry.data.card.name.toLowerCase().includes(searchTerm);
      if (entry.type === 'runa') dataMatch = entry.data.r.name.toLowerCase().includes(searchTerm);
      if (entry.type === 'tirada' && entry.data.cfg) dataMatch = entry.data.cfg.name.toLowerCase().includes(searchTerm);
      if (entry.type === 'daily') dataMatch = entry.data.card.name.toLowerCase().includes(searchTerm) || entry.data.runa.name.toLowerCase().includes(searchTerm);
      if (!questionMatch && !dataMatch) return false;
    }
    return true;
  });
  if (filtered.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-muted)">No hay tiradas que coincidan.</p>';
    return;
  }
  container.innerHTML = filtered.map(entry => `
    <div class="historial-item" data-id="${entry.id}">
      <div class="historial-date">${new Date(entry.date).toLocaleString()}</div>
      <div class="historial-type">${entry.type === 'tarot' ? '🃏 TAROT' : entry.type === 'runa' ? 'ᚱ RUNA' : entry.type === 'tirada' ? '⚡ TIRADA' : '☀️ DIARIA'}</div>
      ${entry.question ? `<div class="historial-question">"${sanitizeHTML(entry.question)}"</div>` : ''}
      <div class="historial-summary">${getSummary(entry)}</div>
    </div>
  `).join('');
  document.querySelectorAll('#settingsHistorialList .historial-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.dataset.id);
      const entry = store.historial.find(e => e.id === id);
      if (entry) showHistoryDetail(entry);
    });
  });
}

function getSummary(entry) {
  if (entry.type === 'tarot') return `Carta: ${entry.data.card.name} ${entry.data.rev ? '(Inv)' : ''}`;
  if (entry.type === 'runa') return `Runa: ${entry.data.r.name} ${entry.data.rev ? '(Inv)' : ''}`;
  if (entry.type === 'tirada') return entry.data.cfg ? `Tirada: ${entry.data.cfg.name} (${entry.data.drawn.length} cartas)` : `Tirada de runas (${entry.data.runes.length})`;
  if (entry.type === 'daily') return `Carta: ${entry.data.card.name}, Runa: ${entry.data.runa.name}`;
  return '';
}

function showHistoryDetail(entry) {
  let html = `<h2 style="color:var(--gold)">Detalle de la consulta</h2><p><strong>Fecha:</strong> ${new Date(entry.date).toLocaleString()}</p><p><strong>Tipo:</strong> ${entry.type}</p>`;
  if (entry.question) html += `<p><strong>Pregunta:</strong> "${sanitizeHTML(entry.question)}"</p>`;
  if (entry.type === 'tarot') {
    const card = entry.data.card, rev = entry.data.rev;
    html += `<div>${cardHTML(card, { big: true, reversed: rev })}</div><div class="interp-card"><p>${sanitizeHTML(rev ? card.rv : card.up)}</p></div>`;
  } else if (entry.type === 'runa') {
    const r = entry.data.r, rev = entry.data.rev;
    html += `<div style="transform:${rev ? 'rotate(180deg)' : 'none'}">${runeCardHTML(r)}</div><div class="interp-card"><p>${sanitizeHTML(rev && r.rv ? r.rv : r.up)}</p></div>`;
  } else if (entry.type === 'tirada') {
    if (entry.data.cfg) {
      html += `<p><strong>Tirada:</strong> ${entry.data.cfg.name}</p>`;
      entry.data.drawn.forEach(x => html += `<div><strong>${x.pos}:</strong> ${x.c.name} ${x.rev ? '(Inv)' : ''}</div>`);
    } else if (entry.data.runes) {
      entry.data.runes.forEach((x, i) => html += `<div><strong>Posición ${i+1}:</strong> ${x.r.name} ${x.rev ? '(Inv)' : ''}</div>`);
    }
  } else if (entry.type === 'daily') {
    html += `<div>${cardHTML(entry.data.card, { big: true, reversed: entry.data.rev })}</div><div>${runeCardHTML(entry.data.runa)}</div>`;
  }
  openModal(html);
}

// ========== ESTADÍSTICAS ==========
function computeStats() {
  const stats = { tarot: {}, runas: {}, tiradas: {} };
  store.historial.forEach(entry => {
    if (entry.type === 'tarot') {
      const cardName = entry.data.card.name;
      stats.tarot[cardName] = (stats.tarot[cardName] || 0) + 1;
    } else if (entry.type === 'runa') {
      const runaName = entry.data.r.name;
      stats.runas[runaName] = (stats.runas[runaName] || 0) + 1;
    } else if (entry.type === 'tirada' && entry.data.cfg) {
      const tiradaName = entry.data.cfg.name;
      stats.tiradas[tiradaName] = (stats.tiradas[tiradaName] || 0) + 1;
    }
  });
  return stats;
}

export function updateStatsChartsSettings() {
  const stats = computeStats();
  const tarotSorted = Object.entries(stats.tarot).sort((a,b) => b[1] - a[1]).slice(0,5);
  if (store.tarotChart) store.tarotChart.destroy();
  const tarotCtx = document.getElementById('settingsTarotChart')?.getContext('2d');
  if (tarotCtx) {
    store.tarotChart = new Chart(tarotCtx, {
      type: 'bar',
      data: { labels: tarotSorted.map(i=>i[0]), datasets: [{ label: 'Veces', data: tarotSorted.map(i=>i[1]), backgroundColor: 'rgba(255,215,0,0.6)', borderColor: '#FFD700', borderWidth: 1 }] },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }
  const runasSorted = Object.entries(stats.runas).sort((a,b) => b[1] - a[1]).slice(0,5);
  if (store.runasChart) store.runasChart.destroy();
  const runasCtx = document.getElementById('settingsRunasChart')?.getContext('2d');
  if (runasCtx) {
    store.runasChart = new Chart(runasCtx, {
      type: 'bar',
      data: { labels: runasSorted.map(i=>i[0]), datasets: [{ label: 'Veces', data: runasSorted.map(i=>i[1]), backgroundColor: 'rgba(192,192,192,0.6)', borderColor: '#C0C0C0', borderWidth: 1 }] }
    });
  }
  const tiradasSorted = Object.entries(stats.tiradas).sort((a,b) => b[1] - a[1]).slice(0,5);
  if (store.tiradasChart) store.tiradasChart.destroy();
  const tiradasCtx = document.getElementById('settingsTiradasChart')?.getContext('2d');
  if (tiradasCtx) {
    store.tiradasChart = new Chart(tiradasCtx, {
      type: 'pie',
      data: { labels: tiradasSorted.map(i=>i[0]), datasets: [{ data: tiradasSorted.map(i=>i[1]), backgroundColor: ['#FFD700','#C0C0C0','#B8860B','#FF69B4','#7B2FBE'] }] }
    });
  }
  const totalTiradas = store.historial.length;
  const totalTarot = Object.values(stats.tarot).reduce((a,b)=>a+b,0);
  const totalRunas = Object.values(stats.runas).reduce((a,b)=>a+b,0);
  const summaryDiv = document.getElementById('settingsStatsSummary');
  if (summaryDiv) summaryDiv.innerHTML = `<p>📊 Total de consultas: <strong>${totalTiradas}</strong></p><p>🃏 Cartas de Tarot: <strong>${totalTarot}</strong></p><p>ᚱ Runas: <strong>${totalRunas}</strong></p><p>⚡ Tiradas especiales: <strong>${Object.values(stats.tiradas).reduce((a,b)=>a+b,0)}</strong></p>`;
}

// ========== FAVORITOS ==========
function renderSavedSpreads() {
  const container = document.getElementById('savedSpreadsList');
  if (!container) return;
  if (store.savedSpreads.length === 0) {
    container.innerHTML = '<p>No tienes tiradas guardadas.</p>';
    return;
  }
  container.innerHTML = store.savedSpreads.map(s => `
    <div class="saved-spread-item" data-id="${s.id}">
      <div><strong>${s.name}</strong> - ${new Date(s.date).toLocaleString()}</div>
      <div>Pregunta: ${s.question || '—'}</div>
      <div>${s.drawn.length} cartas</div>
      <div class="action-buttons" style="margin-top:8px">
        <button class="btn-mystic view-spread" data-id="${s.id}">🔍 Ver</button>
        <button class="btn-mystic btn-stop delete-spread" data-id="${s.id}">🗑️ Eliminar</button>
      </div>
    </div>
  `).join('');
  container.querySelectorAll('.view-spread').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const spread = store.savedSpreads.find(s => s.id === id);
      if (spread) showSavedSpreadModal(spread);
    });
  });
  container.querySelectorAll('.delete-spread').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      if (confirm('¿Eliminar esta tirada guardada?')) {
        removeSavedSpread(id);
        renderSavedSpreads();
        toast('Tirada eliminada');
      }
    });
  });
}

function showSavedSpreadModal(spread) {
  const cardsHtml = spread.drawn.map(d => `<div><strong>${d.pos}</strong><br>${cardHTML({ name: d.cardName, up: d.interpretation, rv: d.interpretation, img: '' }, { reversed: d.reversed, small: true })}</div>`).join('');
  const modalHtml = `<h2>⭐ ${spread.name}</h2><p>${spread.question ? `Pregunta: ${spread.question}` : ''}</p><div class="cards-grid">${cardsHtml}</div><div class="interp-card">${spread.drawn.map(d => `<div><strong>${d.pos}:</strong> ${d.interpretation}</div>`).join('')}</div>`;
  openModal(modalHtml);
}

// ========== EXPORTAR / IMPORTAR DATOS ==========
function exportAllData() {
  const data = {
    historial: store.historial,
    notas: getNotes(),
    dreams: localStorage.getItem('oraculo_dreams') || '[]',
    user: localStorage.getItem('oraculo_user') || '',
    theme: localStorage.getItem('oraculo_theme') || 'dark',
    voiceSpeed: store.voiceSpeed,
    selectedVoice: store.selectedVoiceName,
    savedSpreads: store.savedSpreads
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `oraculo_backup_${new Date().toISOString().slice(0,19)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Datos exportados');
}

function importAllData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.historial) { store.historial = data.historial; saveHistory(); }
      if (data.notas) localStorage.setItem('oraculo_notes', JSON.stringify(data.notas));
      if (data.dreams) localStorage.setItem('oraculo_dreams', data.dreams);
      if (data.user) localStorage.setItem('oraculo_user', data.user);
      if (data.theme) document.body.setAttribute('data-theme', data.theme);
      if (data.voiceSpeed) { store.voiceSpeed = data.voiceSpeed; localStorage.setItem('oraculo_voiceSpeed', data.voiceSpeed); }
      if (data.selectedVoice) { store.selectedVoiceName = data.selectedVoice; localStorage.setItem('oraculo_selectedVoice', data.selectedVoice); }
      if (data.savedSpreads) { store.savedSpreads = data.savedSpreads; localStorage.setItem('oraculo_saved_spreads', JSON.stringify(data.savedSpreads)); }
      toast('Datos importados correctamente');
      renderNotesSettings();
      renderHistorySettings();
      updateStatsChartsSettings();
      renderSavedSpreads();
      if (typeof renderSavedDreamsList !== 'undefined') renderSavedDreamsList();
    } catch (err) { toast('Error al importar: JSON inválido'); }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function clearIACache() {
  let removed = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('ia_cache_')) {
      localStorage.removeItem(key);
      removed++;
    }
  }
  toast(`Caché de IA limpiada (${removed} elementos)`);
}

// ========== MODAL PRINCIPAL (CONFIGURACIÓN LIMPIA) ==========
export async function openSettingsModal() {
  localStorage.removeItem('openai_api_key');
  let voices = await getPremiumVoices();
  let voiceOptions = voices.map(v => `<option value="${v.name}" ${store.selectedVoiceName === v.name ? 'selected' : ''}>${v.name} (${v.lang})</option>`).join('');
  let theme = document.body.getAttribute('data-theme') || 'dark';
  
  const modalHtml = `
    <div class="settings-container">
      <h2 style="color:var(--gold); margin-bottom:20px; text-align:center;">⚙️ Configuración del Oráculo</h2>
      <div class="settings-tabs">
        <button class="settings-tab active" data-tab="ajustes">🎚️ Ajustes</button>
        <button class="settings-tab" data-tab="notas">📓 Notas</button>
        <button class="settings-tab" data-tab="historial">📜 Historial</button>
        <button class="settings-tab" data-tab="estadisticas">📊 Estadísticas</button>
        <button class="settings-tab" data-tab="favoritos">⭐ Favoritos</button>
        <button class="settings-tab" data-tab="manual">📖 Manual</button>
      </div>

      <div class="settings-pane active" id="settings-ajustes">
        <div class="settings-card">
          <div class="settings-row">
            <label>🎚️ Velocidad de voz:</label>
            <input type="range" id="voiceSpeedRange" min="0.5" max="2" step="0.1" value="${store.voiceSpeed}">
            <span id="speedValue">${store.voiceSpeed}</span>
          </div>
          <div class="settings-row">
            <label>🗣️ Voz premium:</label>
            <select id="voicePremiumSelect"><option value="default">Voz por defecto</option>${voiceOptions}</select>
            <button id="testVoiceBtn" class="btn-mystic">🔊 Probar</button>
          </div>
          <div class="settings-row">
            <label>🌓 Tema:</label>
            <div class="theme-buttons">
              <button class="btn-mystic ${theme==='dark'?'active':''}" id="themeDarkBtn">🌙 Oscuro</button>
              <button class="btn-mystic ${theme==='light'?'active':''}" id="themeLightBtn">☀️ Claro</button>
            </div>
          </div>
          <div class="settings-divider"></div>
          <div class="settings-row">
            <button class="btn-mystic btn-stop" id="clearAllDataBtn">🗑️ Borrar todos los datos</button>
          </div>
          <div class="settings-row">
            <button class="btn-mystic" id="exportDataBtn">📤 Exportar todos los datos</button>
            <button class="btn-mystic" id="importDataBtn">📥 Importar datos (JSON)</button>
            <input type="file" id="importFileInput" style="display:none" accept=".json">
          </div>
          <div class="settings-row">
            <button class="btn-mystic btn-stop" id="clearIACacheBtn">🗑️ Limpiar caché de IA</button>
          </div>
        </div>
      </div>

      <div class="settings-pane" id="settings-notas">
        <div class="settings-card">
          <textarea id="settingsNewNote" class="note-editor" placeholder="✍️ Escribe tu nota aquí..."></textarea>
          <button class="btn-mystic btn-save" id="settingsAddNoteBtn">💾 Guardar Nota</button>
          <div id="settingsNotesList" class="notes-container"></div>
          <div id="settingsNoNotes" style="text-align:center;color:var(--text-muted);margin-top:15px;">No tienes notas guardadas.</div>
        </div>
      </div>

      <div class="settings-pane" id="settings-historial">
        <div class="settings-card">
          <div class="historial-filters">
            <input type="text" id="settingsHistorySearch" placeholder="🔍 Buscar..." class="mystic-input">
            <select id="settingsHistoryTypeFilter" class="mystic-input">
              <option value="all">Todos</option>
              <option value="tarot">Tarot</option>
              <option value="runa">Runas</option>
              <option value="tirada">Tiradas</option>
              <option value="daily">Diaria</option>
            </select>
            <select id="settingsHistoryDateFilter" class="mystic-input">
              <option value="all">Cualquier fecha</option>
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
            </select>
          </div>
          <div id="settingsHistorialList" class="historial-container"></div>
          <button id="settingsClearHistoryBtn" class="btn-mystic btn-stop">🗑️ Borrar historial</button>
        </div>
      </div>

      <div class="settings-pane" id="settings-estadisticas">
        <div class="stats-grid">
          <div class="stats-card"><h3>🎴 Top 5 cartas</h3><canvas id="settingsTarotChart" width="300" height="200"></canvas></div>
          <div class="stats-card"><h3>ᚱ Top 5 runas</h3><canvas id="settingsRunasChart" width="300" height="200"></canvas></div>
          <div class="stats-card"><h3>⚡ Tiradas más usadas</h3><canvas id="settingsTiradasChart" width="300" height="200"></canvas></div>
          <div class="stats-card"><h3>📈 Resumen</h3><div id="settingsStatsSummary"></div></div>
        </div>
      </div>

      <div class="settings-pane" id="settings-favoritos">
        <div class="settings-card">
          <div id="savedSpreadsList"></div>
        </div>
      </div>

      <div class="settings-pane" id="settings-manual">
        <div class="settings-card manual-content">
          <h3>🔮 Manual del Oráculo Místico</h3>
          <p><strong>☀️ Diaria:</strong> Obtén carta y runa del día (se renueva a medianoche).</p>
          <p><strong>🃏 Tarot:</strong> Consulta las 78 cartas, pide IA, invierte.</p>
          <p><strong>ᚱ Runas:</strong> 24 runas del Futhark.</p>
          <p><strong>⚡ Tiradas:</strong> Cruz Celta, PPF, Amor, Karma, Astrológica, Relaciones Kármicas, Árbol de la Vida, etc.</p>
          <p><strong>🌙 Luna:</strong> Fases reales.</p>
          <p><strong>💭 Sueños:</strong> Interpretación con IA.</p>
          <p><strong>🔢 Numerología:</strong> Calcula tus números.</p>
          <p><strong>🔢 Grabovoi:</strong> Códigos de sanación (más de 800).</p>
          <p><strong>💬 Chat:</strong> Habla con el oráculo (voz premium).</p>
          <p><strong>🤖 IA:</strong> Requiere cuenta gratuita en <strong>Puter</strong>.</p>
        </div>
      </div>

      <div class="settings-close">
        <button class="btn-mystic" id="closeSettingsBtn">Cerrar</button>
      </div>
    </div>
  `;
  const modal = openModal(modalHtml);
  
  // Tabs
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.settings-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`settings-${tab.dataset.tab}`).classList.add('active');
    });
  });
  
  // Voz
  const speedRange = document.getElementById('voiceSpeedRange');
  const speedValue = document.getElementById('speedValue');
  const voiceSelect = document.getElementById('voicePremiumSelect');
  const testBtn = document.getElementById('testVoiceBtn');
  if (speedRange) {
    speedRange.addEventListener('input', (e) => {
      store.voiceSpeed = parseFloat(e.target.value);
      speedValue.innerText = store.voiceSpeed;
      localStorage.setItem('oraculo_voiceSpeed', store.voiceSpeed);
    });
  }
  if (voiceSelect) {
    voiceSelect.addEventListener('change', (e) => {
      store.selectedVoiceName = e.target.value === 'default' ? null : e.target.value;
      localStorage.setItem('oraculo_selectedVoice', store.selectedVoiceName || '');
    });
  }
  if (testBtn) {
    testBtn.addEventListener('click', () => {
      speakText('Hola, soy el Oráculo Místico. Esta es mi voz premium.');
    });
  }
  
  // Tema
  const themeDark = document.getElementById('themeDarkBtn');
  const themeLight = document.getElementById('themeLightBtn');
  if (themeDark) {
    themeDark.addEventListener('click', () => {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('oraculo_theme', 'dark');
      toast('Tema oscuro');
      modal.remove();
    });
  }
  if (themeLight) {
    themeLight.addEventListener('click', () => {
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('oraculo_theme', 'light');
      toast('Tema claro');
      modal.remove();
    });
  }
  
  // Botones de datos
  document.getElementById('clearAllDataBtn')?.addEventListener('click', () => {
    if (confirm('¿Borrar todos los datos?')) { localStorage.clear(); location.reload(); }
  });
  document.getElementById('settingsAddNoteBtn')?.addEventListener('click', addNoteFromEditorSettings);
  document.getElementById('settingsClearHistoryBtn')?.addEventListener('click', () => {
    if (confirm('¿Borrar historial?')) {
      store.historial = [];
      saveHistory();
      renderHistorySettings();
      updateStatsChartsSettings();
      toast('Historial borrado');
    }
  });
  document.getElementById('settingsHistorySearch')?.addEventListener('input', () => renderHistorySettings());
  document.getElementById('settingsHistoryTypeFilter')?.addEventListener('change', () => renderHistorySettings());
  document.getElementById('settingsHistoryDateFilter')?.addEventListener('change', () => renderHistorySettings());
  document.getElementById('exportDataBtn')?.addEventListener('click', exportAllData);
  document.getElementById('importDataBtn')?.addEventListener('click', () => document.getElementById('importFileInput').click());
  document.getElementById('importFileInput')?.addEventListener('change', importAllData);
  document.getElementById('clearIACacheBtn')?.addEventListener('click', clearIACache);
  document.getElementById('closeSettingsBtn')?.addEventListener('click', () => modal.remove());
  
  renderNotesSettings();
  renderHistorySettings();
  updateStatsChartsSettings();
  renderSavedSpreads();
}
