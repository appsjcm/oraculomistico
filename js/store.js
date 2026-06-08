// store.js - Estado global compartido
export const store = {
  voiceSpeed: parseFloat(localStorage.getItem('oraculo_voiceSpeed') || '1'),
  selectedVoiceName: localStorage.getItem('oraculo_selectedVoice') || null,
  premiumVoiceEnabled: localStorage.getItem('premium_voice_enabled') === 'true',
  currentRec: null,
  lastState: {},
  historial: [],
  tarotChart: null,
  runasChart: null,
  tiradasChart: null,
  audioUnlocked: false,
  savedDreams: [],
  currentUser: localStorage.getItem('oraculo_user') || '',
  GRABOVOI_FULL_DB: [],
  grabovoiPage: 0,
  currentGrabovoiFiltered: null,
  grabovoiSort: 'nombre',
  currentCategory: 'all',
  savedSpreads: JSON.parse(localStorage.getItem('oraculo_saved_spreads') || '[]'),
  favorites: JSON.parse(localStorage.getItem('oraculo_favorites') || '[]')
};

export function loadHistory() {
  const stored = localStorage.getItem('oraculo_history');
  if (stored) store.historial = JSON.parse(stored);
}

export function saveHistory() {
  localStorage.setItem('oraculo_history', JSON.stringify(store.historial));
}

export function addToHistory(type, data, question) {
  const entry = { id: Date.now(), date: new Date().toISOString(), type, question: question || '', data };
  store.historial.unshift(entry);
  if (store.historial.length > 250) store.historial = store.historial.slice(0,250);
  saveHistory();
}

export function getNotes() {
  return JSON.parse(localStorage.getItem('oraculo_notes') || '[]');
}

export function saveNote(content) {
  const notes = getNotes();
  notes.push({ date: new Date().toISOString(), content });
  localStorage.setItem('oraculo_notes', JSON.stringify(notes));
}

export function saveSpread(spreadData) {
  store.savedSpreads.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    ...spreadData
  });
  if (store.savedSpreads.length > 50) store.savedSpreads.pop();
  localStorage.setItem('oraculo_saved_spreads', JSON.stringify(store.savedSpreads));
}

export function removeSavedSpread(id) {
  store.savedSpreads = store.savedSpreads.filter(s => s.id !== id);
  localStorage.setItem('oraculo_saved_spreads', JSON.stringify(store.savedSpreads));
}

export function saveFavorites() {
  localStorage.setItem('oraculo_favorites', JSON.stringify(store.favorites));
}

export function addFavorite(type, data) {
  const exists = store.favorites.some(f =>
    f.type === type && JSON.stringify(f.data) === JSON.stringify(data)
  );
  if (exists) return false;
  store.favorites.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    type,
    data
  });
  if (store.favorites.length > 250) store.favorites = store.favorites.slice(0,250);
  saveFavorites();
  return true;
}

export function removeFavorite(id) {
  store.favorites = store.favorites.filter(f => f.id !== id);
  saveFavorites();
}
