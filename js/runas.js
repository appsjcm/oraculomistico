import { store, addToHistory, addFavorite } from './store.js';
import { toast, runeCardHTML, animateCard } from './utils.js';
import { getIA } from './ia.js';
import { RUNAS } from './data.js';

function getRandomInt(max) { return Math.floor(Math.random() * max); }
export function drawRandomRune() { return RUNAS[getRandomInt(RUNAS.length)]; }

export function drawRune() {
  const q = document.getElementById('runaQ').value.trim() || 'Sin pregunta';
  const r = drawRandomRune();
  const rev = Math.random() < 0.3;
  const resultHtml = `<div class="result-area runa-premium">
<div class="runa-header">
<div class="runa-symbol">${r.symbol || 'ᚱ'}</div>
<div class="runa-name">${r.name}</div>
${rev ? '<div class="runa-reversed">↻ Invertida</div>' : ''}
</div>
<div style="transform:${rev ? 'rotate(180deg)' : 'none'}">${runeCardHTML(r)}</div>
<div class="interp-card runa-interpretacion"><h3>✨ Mensaje de la runa</h3><p>${rev && r.rv ? r.rv : r.up}</p></div>
<div id="runaIAResult"></div></div>`;
  document.getElementById('runaResult').innerHTML = resultHtml;
  document.getElementById('runaActions').style.display = 'flex';
  store.lastState.runa = { r, rev, q };
  addToHistory('runa', { r, rev }, q);
  
  const cardElement = document.querySelector('#runaResult .rune-card');
  if (cardElement) animateCard(cardElement);
  
  if (document.getElementById('runasAutoIA')?.checked) setTimeout(() => getIA('runa'), 500);
}

export function renderRunasGrid() {
  const container = document.getElementById('runasGrid');
  if (container) container.innerHTML = RUNAS.map(r => runeCardHTML(r)).join('');
}


// Favoritos preparados
export function addCurrentToFavorites(item){ return addFavorite('runa', item); }
