import { store, addToHistory, addFavorite } from './store.js';
import { toast, cardHTML, animateCard } from './utils.js';
import { getIA } from './ia.js';
import { ALL_TAROT, MAJOR_ARCANA, MINOR_ARCANA } from './data.js';

const TAROT_PAGE_SIZE = 20;

function getRandomInt(max) { return Math.floor(Math.random() * max); }
export function drawRandomCard() { return ALL_TAROT[getRandomInt(ALL_TAROT.length)]; }

export function drawTarot() {
  const q = document.getElementById('tarotQ').value.trim() || 'Sin pregunta';
  const card = drawRandomCard();
  const rev = Math.random() < 0.3;
  const resultHtml = `<div class="result-area tarot-premium"><div class="tarot-badge">LECTURA TAROT</div><div class="result-title">🃏 Tu carta: ${card.name}</div>${cardHTML(card, { big: true, reversed: rev })}<div class="interp-card"><p>${rev ? card.rv : card.up}</p></div><div id="tarotIAResult"></div></div>`;
  document.getElementById('tarotResult').innerHTML = resultHtml;
  document.getElementById('tarotActions').style.display = 'flex';
  store.lastState.tarot = { card, rev, q };
  addToHistory('tarot', { card, rev }, q);
  
  const cardElement = document.querySelector('#tarotResult .real-card');
  if (cardElement) animateCard(cardElement);
  
  if (document.getElementById('tarotAutoIA')?.checked) setTimeout(() => getIA('tarot'), 500);
}

export function renderMajorArcana(page = 0) {
  const container = document.getElementById('majorGrid');
  if (!container) return;
  const start = page * TAROT_PAGE_SIZE;
  const end = start + TAROT_PAGE_SIZE;
  const pageCards = MAJOR_ARCANA.slice(start, end);
  let html = pageCards.map(card => cardHTML(card)).join('');
  if (end < MAJOR_ARCANA.length) {
    html += `<div class="load-more-major" style="grid-column:1/-1; text-align:center; margin:20px 0;"><button class="btn-mystic load-major-btn">📖 Cargar más arcanos mayores</button></div>`;
  }
  container.innerHTML = html;
  const loadBtn = container.querySelector('.load-major-btn');
  if (loadBtn) {
    loadBtn.addEventListener('click', () => renderMajorArcana(page + 1));
  }
}

export function renderMinorArcana(page = 0) {
  const container = document.getElementById('minorGrid');
  if (!container) return;
  const start = page * TAROT_PAGE_SIZE;
  const end = start + TAROT_PAGE_SIZE;
  const pageCards = MINOR_ARCANA.slice(start, end);
  let html = pageCards.map(card => cardHTML(card)).join('');
  if (end < MINOR_ARCANA.length) {
    html += `<div class="load-more-minor" style="grid-column:1/-1; text-align:center; margin:20px 0;"><button class="btn-mystic load-minor-btn">📖 Cargar más arcanos menores</button></div>`;
  }
  container.innerHTML = html;
  const loadBtn = container.querySelector('.load-minor-btn');
  if (loadBtn) {
    loadBtn.addEventListener('click', () => renderMinorArcana(page + 1));
  }
}


// Favoritos preparados
export function addCurrentToFavorites(item){ return addFavorite('tarot', item); }
