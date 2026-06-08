// utils.js - Funciones auxiliares completas
import { store } from './store.js';
import { getImgSrc } from './config.js';
import { saveNote } from './store.js';
import { waitForPuter, queueIARequest } from './ia.js';
import { speakText, stopSpeaking } from './voice.js';
import { generatePDFFromElement, shareAsImage } from './pdf.js'; // CORREGIDO: importar desde pdf.js

export function sanitizeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt';
        if (m === '>') return '&gt';
        return m;
    });
}

export function toast(msg) {
  var t = document.createElement('div');
  t.className = 'toast';
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.remove(); }, 3000);
}

export function unlockAudio() {
  if (store.audioUnlocked) return;
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    var context = new AudioContext();
    context.resume().then(function() { store.audioUnlocked = true; });
  } else {
    store.audioUnlocked = true;
  }
}

export var TTS = {
  speak: speakText,
  stop: stopSpeaking
};

export { speakText, stopSpeaking };

export function openModal(html, onClose, autoSpeakText) {
  autoSpeakText = autoSpeakText || null;
  var ov = document.createElement('div');
  ov.className = 'modal-overlay';
  var box = document.createElement('div');
  box.className = 'modal-box';
  box.innerHTML = html;
  var close = document.createElement('button');
  close.className = 'modal-close';
  close.innerHTML = 'X';
  var closeModal = function() {
      ov.remove();
      if (onClose) onClose();
      stopSpeaking();
  };
  close.onclick = closeModal;
  ov.onclick = function(e) { if (e.target === ov) closeModal(); };
  box.appendChild(close);
  ov.appendChild(box);
  document.body.appendChild(ov);
  if (autoSpeakText) {
    setTimeout(function() { speakText(autoSpeakText); }, 100);
  }
  return ov;
}

export function cardHTML(card, opts) {
  opts = opts || {};
  var revClass = opts.reversed ? 'reversed' : '';
  var revBadge = opts.reversed ? '<div class="rev-badge">INV</div>' : '';
  var src = getImgSrc(card);
  var imgTag = src ? '<img src="' + src + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">' : '';
  return '<div class="real-card ' + (opts.big ? 'big' : '') + ' ' + (opts.small ? 'small' : '') + ' ' + revClass + '" data-card-name="' + sanitizeHTML(card.name) + '">' + revBadge + imgTag + '<div class="card-fallback" style="display:none">🃏</div></div>';
}

export function runeCardHTML(r, opts) {
  opts = opts || {};
  return '<div class="rune-card ' + (opts.small ? 'small' : '') + '" data-rune-name="' + sanitizeHTML(r.name) + '"><img src="' + r.img + '" loading="lazy" decoding="async" onerror="this.style.display=\'none\'"><div class="rune-sym">' + sanitizeHTML(r.sym) + '</div><div class="rune-name">' + sanitizeHTML(r.name) + '</div></div>';
}

export function animateCard(element) {
    if (!element) return;
    element.classList.add('reveal-card');
    element.addEventListener('animationend', function() {
        element.classList.remove('reveal-card');
    }, { once: true });
}

// ========== MODALES PARA CARTAS Y RUNAS ==========
window.openCardModal = function(card, initialRev) {
  initialRev = initialRev || false;
  var currentRev = initialRev;
  var modalDiv = null;
  var contentDiv = null;

  function refreshModal() {
    if (!contentDiv) return;
    var text = currentRev ? (card.rv || card.up) : card.up;
    var imgHtml = cardHTML(card, { big: true, reversed: currentRev });
    var buttonText = currentRev ? 'Volver a Derecha' : 'Ver Invertida';
    contentDiv.innerHTML = '<h2>' + sanitizeHTML(card.name) + (currentRev ? ' (Invertida)' : '') + '</h2><div>' + imgHtml + '</div><div class="interp-card"><p>' + sanitizeHTML(text) + '</p></div><div class="action-buttons"><button class="btn-mystic" id="toggleRevBtn">' + buttonText + '</button><button class="btn-mystic btn-ia" id="modalIaBtn">IA</button><button class="btn-mystic btn-pdf" id="modalPdfBtn">PDF</button><button class="btn-mystic btn-share-img" id="modalShareImgBtn">Compartir Imagen</button><button class="btn-mystic btn-share-social" id="modalShareBtn">Compartir Texto</button><button class="btn-mystic btn-save" id="saveNoteBtn">Guardar</button></div><div id="modalIAResult"></div>';
    
    document.getElementById('toggleRevBtn')?.addEventListener('click', function() { currentRev = !currentRev; refreshModal(); });
    document.getElementById('saveNoteBtn')?.addEventListener('click', function() { saveNote(card.name + ': ' + (currentRev ? card.rv : card.up)); if (modalDiv) modalDiv.remove(); toast('Nota guardada'); });
    document.getElementById('modalIaBtn')?.addEventListener('click', async function() {
      await waitForPuter();
      if (!window.puter?.ai?.chat) { toast('Para usar IA, regístrate en Puter.'); return; }
      var prompt = 'Interpreta la carta ' + card.name + ' (' + (currentRev ? 'invertida' : 'derecha') + '). 400 palabras. Texto plano.';
      var btn = document.getElementById('modalIaBtn');
      btn.disabled = true; btn.innerHTML = 'Consultando';
      try {
        var answer = await queueIARequest(prompt);
        answer = sanitizeHTML(answer.replace(/\*\*|__|\[|\]|\(|\)|\#|\*|\-|\+|\|/g, ''));
        document.getElementById('modalIAResult').innerHTML = '<div class="ia-interp"><p>' + answer.replace(/\n/g, '<br>') + '</p></div>';
        speakText(answer);
      } catch(e) { toast('Error de IA.'); }
      finally { btn.disabled = false; btn.innerHTML = 'IA'; }
    });
    document.getElementById('modalPdfBtn')?.addEventListener('click', async function() {
      var tempDiv = document.createElement('div');
      tempDiv.appendChild(contentDiv.cloneNode(true));
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = '#fff';
      document.body.appendChild(tempDiv);
      await generatePDFFromElement(tempDiv, 'carta_' + card.name.replace(/\s/g, '_') + '.pdf');
      document.body.removeChild(tempDiv);
    });
    document.getElementById('modalShareImgBtn')?.addEventListener('click', async function() {
      await shareAsImage(contentDiv.cloneNode(true), 'Carta: ' + card.name);
    });
    document.getElementById('modalShareBtn')?.addEventListener('click', async function() {
      var shareText = card.name + ' (' + (currentRev ? 'invertida' : 'derecha') + '): ' + text;
      if (navigator.share) {
        try { await navigator.share({ title: 'Oráculo Místico', text: shareText }); toast('Compartido'); } catch(e) { toast('Cancelado'); }
      } else {
        await navigator.clipboard.writeText(shareText);
        toast('Copiado');
      }
    });
  }
  var autoText = currentRev ? (card.rv || card.up) : card.up;
  modalDiv = openModal('<div id="modalDynamicContent"></div>', null, autoText);
  contentDiv = modalDiv.querySelector('#modalDynamicContent');
  refreshModal();
};

window.openRunaModal = function(r, initialRev) {
  initialRev = initialRev || false;
  var currentRev = initialRev;
  var modalDiv = null;
  var contentDiv = null;

  function refreshModal() {
    if (!contentDiv) return;
    var text = currentRev ? (r.rv || r.up) : r.up;
    var revStyle = currentRev ? 'transform:rotate(180deg);' : '';
    var buttonText = currentRev ? 'Volver a Derecha' : 'Ver Invertida';
    contentDiv.innerHTML = '<h2>' + sanitizeHTML(r.name) + (currentRev ? ' (Invertida)' : '') + '</h2><div style="' + revStyle + '">' + runeCardHTML(r) + '</div><div class="interp-card"><p>' + sanitizeHTML(text) + '</p></div><div class="action-buttons"><button class="btn-mystic" id="toggleRevBtnRuna">' + buttonText + '</button><button class="btn-mystic btn-ia" id="modalIaBtnRuna">IA</button><button class="btn-mystic btn-pdf" id="modalPdfBtnRuna">PDF</button><button class="btn-mystic btn-share-img" id="modalShareImgBtnRuna">Compartir Imagen</button><button class="btn-mystic btn-share-social" id="modalShareBtnRuna">Compartir Texto</button><button class="btn-mystic btn-save" id="saveNoteBtnRuna">Guardar</button></div><div id="modalIAResultRuna"></div>';
    
    document.getElementById('toggleRevBtnRuna')?.addEventListener('click', function() { currentRev = !currentRev; refreshModal(); });
    document.getElementById('saveNoteBtnRuna')?.addEventListener('click', function() { saveNote('Runa ' + r.name + ': ' + (currentRev ? r.rv : r.up)); if (modalDiv) modalDiv.remove(); toast('Nota guardada'); });
    document.getElementById('modalIaBtnRuna')?.addEventListener('click', async function() {
      await waitForPuter();
      if (!window.puter?.ai?.chat) { toast('Para usar IA, regístrate en Puter.'); return; }
      var prompt = 'Interpreta la runa ' + r.name + ' (' + (currentRev ? 'invertida' : 'derecha') + '). 350 palabras. Texto plano.';
      var btn = document.getElementById('modalIaBtnRuna');
      btn.disabled = true; btn.innerHTML = 'Consultando';
      try {
        var answer = await queueIARequest(prompt);
        answer = sanitizeHTML(answer.replace(/\*\*|__|\[|\]|\(|\)|\#|\*|\-|\+|\|/g, ''));
        document.getElementById('modalIAResultRuna').innerHTML = '<div class="ia-interp"><p>' + answer.replace(/\n/g, '<br>') + '</p></div>';
        speakText(answer);
      } catch(e) { toast('Error de IA.'); }
      finally { btn.disabled = false; btn.innerHTML = 'IA'; }
    });
    document.getElementById('modalPdfBtnRuna')?.addEventListener('click', async function() {
      var tempDiv = document.createElement('div');
      tempDiv.appendChild(contentDiv.cloneNode(true));
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = '#fff';
      document.body.appendChild(tempDiv);
      await generatePDFFromElement(tempDiv, 'runa_' + r.name + '.pdf');
      document.body.removeChild(tempDiv);
    });
    document.getElementById('modalShareImgBtnRuna')?.addEventListener('click', async function() {
      await shareAsImage(contentDiv.cloneNode(true), 'Runa: ' + r.name);
    });
    document.getElementById('modalShareBtnRuna')?.addEventListener('click', async function() {
      var shareText = 'Runa ' + r.name + ' (' + (currentRev ? 'invertida' : 'derecha') + '): ' + text;
      if (navigator.share) {
        try { await navigator.share({ title: 'Oráculo Místico', text: shareText }); toast('Compartido'); } catch(e) { toast('Cancelado'); }
      } else {
        await navigator.clipboard.writeText(shareText);
        toast('Copiado');
      }
    });
  }
  var autoText = currentRev ? (r.rv || r.up) : r.up;
  modalDiv = openModal('<div id="modalDynamicContentRuna"></div>', null, autoText);
  contentDiv = modalDiv.querySelector('#modalDynamicContentRuna');
  refreshModal();
};

export function initCardAndRuneEvents() {
  document.body.addEventListener('click', async function(e) {
    var cardDiv = e.target.closest('.real-card');
    if (cardDiv && !cardDiv.closest('.modal-box')) {
      var cardName = cardDiv.getAttribute('data-card-name');
      if (cardName) {
        var module = await import('./data.js');
        var card = module.ALL_TAROT.find(function(c) { return c.name === cardName; });
        if (card) {
          var isReversed = cardDiv.classList.contains('reversed');
          window.openCardModal(card, isReversed);
        }
      }
      e.stopPropagation();
      return;
    }
    var runeDiv = e.target.closest('.rune-card');
    if (runeDiv && !runeDiv.closest('.modal-box')) {
      var runeName = runeDiv.getAttribute('data-rune-name');
      if (runeName) {
        var module = await import('./data.js');
        var rune = module.RUNAS.find(function(r) { return r.name === runeName; });
        if (rune) {
          var isReversed = runeDiv.style.transform === 'rotate(180deg)' || (runeDiv.querySelector('div') && runeDiv.querySelector('div').style.transform === 'rotate(180deg)');
          window.openRunaModal(rune, isReversed);
        }
      }
      e.stopPropagation();
    }
  });
}

console.log('utils.js cargado correctamente');
