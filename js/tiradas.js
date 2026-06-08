import { store, addToHistory, saveSpread } from './store.js';
import { toast, cardHTML, openModal, runeCardHTML } from './utils.js';
import { getIA, queueIARequest } from './ia.js';
import { drawRandomCard } from './tarot.js';
import { drawRandomRune } from './runas.js';
import { generatePDFFromElement, shareAsImage } from './pdf.js';

function showShuffleAnimation(callback) {
  var overlay = document.createElement('div');
  overlay.className = 'om17-ritual-overlay';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.innerHTML = '<div class="om17-ritual-box"><div class="om17-ritual-orb">🔮</div><div class="om17-ritual-cards"><span>🃏</span><span>✨</span><span>🃏</span></div><div class="om17-ritual-text">El oráculo está mezclando la energía...</div><div class="om17-ritual-ring"></div></div>';
  document.body.appendChild(overlay);
  document.body.classList.add('om17-ritual-active');

  setTimeout(function() {
    overlay.classList.add('om17-ritual-reveal');
  }, 900);

  setTimeout(function() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.body.classList.remove('om17-ritual-active');
    callback();
  }, 1250);
}

export function openSpreadModal(spreadName, drawn, q, allowSave) {
  allowSave = (allowSave !== undefined) ? allowSave : true;
  showShuffleAnimation(function() {
    var cardsHtml = drawn.map(function(d) { return '<div><strong>' + d.pos + '</strong><br>' + cardHTML(d.c, { reversed: d.rev, small: true }) + '</div>'; }).join('');
    var textsHtml = drawn.map(function(d) { return '<div><strong>' + d.pos + ':</strong> ' + (d.rev ? d.c.rv : d.c.up) + '</div>'; }).join('');
    var saveBtnHtml = allowSave ? '<button id="modalTiradaSaveBtn" class="btn-mystic btn-save">Guardar tirada</button>' : '';
    var modalContent = '<h2>Tirada: ' + spreadName + '</h2><div class="cards-grid" style="gap:20px">' + cardsHtml + '</div><div class="interp-card">' + textsHtml + '</div><div class="action-buttons">' + saveBtnHtml + '<button id="modalTiradaIaBtn" class="btn-mystic btn-ia">IA</button><button id="modalTiradaPdfBtn" class="btn-mystic btn-pdf">PDF</button><button id="modalTiradaShareImgBtn" class="btn-mystic btn-share-img">Compartir Imagen</button><button id="modalTiradaShareBtn" class="btn-mystic btn-share-social">Compartir Texto</button></div><div id="modalTiradaIAResult"></div>';
    var modal = openModal(modalContent);
    
    if (allowSave) {
      var saveBtn = modal.querySelector('#modalTiradaSaveBtn');
      if (saveBtn) saveBtn.addEventListener('click', function() {
        saveSpread({
          type: 'tarot',
          name: spreadName,
          question: q,
          drawn: drawn.map(function(d) { return { pos: d.pos, cardName: d.c.name, reversed: d.rev, interpretation: d.rev ? d.c.rv : d.c.up }; })
        });
        toast('Tirada guardada en favoritos');
        modal.remove();
      });
    }
    
    var iaBtn = modal.querySelector('#modalTiradaIaBtn');
    if (iaBtn) iaBtn.addEventListener('click', async function() {
      var prompt = 'Tirada ' + spreadName + ': ' + drawn.map(function(d) { return d.c.name + ' (' + (d.rev ? 'inv' : 'der') + ') en ' + d.pos; }).join(', ') + '. Pregunta: "' + q + '". Interpretacion de 400 palabras. Texto plano.';
      var btn = iaBtn;
      btn.disabled = true; btn.innerHTML = 'Consultando';
      try {
        var answer = await queueIARequest(prompt);
        answer = answer.replace(/\*\*|__|\[|\]|\(|\)|\#|\*|\-|\+|\|/g, '').replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
        var resultDiv = modal.querySelector('#modalTiradaIAResult');
        if (resultDiv) resultDiv.innerHTML = '<div class="ia-interp"><p>' + answer.replace(/\n/g, '<br>') + '</p></div>';
        var utterance = new SpeechSynthesisUtterance(answer);
        utterance.lang = 'es-ES';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch(e) { if (resultDiv) resultDiv.innerHTML = '<div class="ia-interp">Error: ' + e.message + '</div>'; }
      finally { btn.disabled = false; btn.innerHTML = 'IA'; }
    });
    
    var pdfBtn = modal.querySelector('#modalTiradaPdfBtn');
    if (pdfBtn) pdfBtn.addEventListener('click', async function() {
      var tempDiv = document.createElement('div');
      var cardsClone = modal.querySelector('.cards-grid').cloneNode(true);
      var interpClone = modal.querySelector('.interp-card').cloneNode(true);
      var iaClone = modal.querySelector('#modalTiradaIAResult .ia-interp') ? modal.querySelector('#modalTiradaIAResult .ia-interp').cloneNode(true) : null;
      tempDiv.appendChild(cardsClone);
      tempDiv.appendChild(interpClone);
      if (iaClone) tempDiv.appendChild(iaClone);
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = '#fff';
      document.body.appendChild(tempDiv);
      await generatePDFFromElement(tempDiv, 'tirada_' + spreadName.replace(/\s/g, '_') + '.pdf');
      document.body.removeChild(tempDiv);
    });
    
    var shareImgBtn = modal.querySelector('#modalTiradaShareImgBtn');
    if (shareImgBtn) shareImgBtn.addEventListener('click', async function() {
      var cloneContainer = document.createElement('div');
      var cardsClone = modal.querySelector('.cards-grid').cloneNode(true);
      var interpClone = modal.querySelector('.interp-card').cloneNode(true);
      var iaClone = modal.querySelector('#modalTiradaIAResult .ia-interp') ? modal.querySelector('#modalTiradaIAResult .ia-interp').cloneNode(true) : null;
      cloneContainer.appendChild(cardsClone);
      cloneContainer.appendChild(interpClone);
      if (iaClone) cloneContainer.appendChild(iaClone);
      await shareAsImage(cloneContainer, 'Tirada: ' + spreadName);
    });
    
    var shareBtn = modal.querySelector('#modalTiradaShareBtn');
    if (shareBtn) shareBtn.addEventListener('click', async function() {
      var text = 'Tirada ' + spreadName + ':\n' + drawn.map(function(d) { return d.pos + ': ' + (d.rev ? d.c.rv : d.c.up); }).join('\n');
      if (navigator.share) {
        try { await navigator.share({ title: 'Tirada Oráculo', text: text }); toast('Compartido'); } catch(e) { toast('Cancelado'); }
      } else {
        await navigator.clipboard.writeText(text);
        toast('Copiado al portapapeles');
      }
    });
  });
}

export function doSpread(spreadName, positions) {
  var q = document.getElementById('tiradaQ').value.trim() || 'Sin pregunta';
  if (!positions || positions.length === 0) { toast('Error: tirada sin posiciones'); return; }
  var drawn = [];
  for (var i = 0; i < positions.length; i++) {
    var card = drawRandomCard();
    var rev = Math.random() < 0.3;
    drawn.push({ pos: positions[i], c: card, rev: rev });
  }
  openSpreadModal(spreadName, drawn, q, true);
  store.lastState.tirada = { type: 'tarot', cfg: { name: spreadName }, drawn: drawn, q: q };
  addToHistory('tirada', { cfg: { name: spreadName }, drawn: drawn }, q);
  if (document.getElementById('tiradaAutoIA') && document.getElementById('tiradaAutoIA').checked) setTimeout(function() { getIA('tirada'); }, 500);
}

export function doAstrologicalSpread() {
  var q = document.getElementById('tiradaQ').value.trim() || 'Sin pregunta';
  var houses = ['Casa 1: Identidad', 'Casa 2: Dinero', 'Casa 3: Comunicacion', 'Casa 4: Hogar', 'Casa 5: Amor y creatividad', 'Casa 6: Salud y trabajo diario', 'Casa 7: Pareja', 'Casa 8: Transformacion', 'Casa 9: Viajes y filosofia', 'Casa 10: Carrera', 'Casa 11: Amistades', 'Casa 12: Espiritualidad'];
  var drawn = houses.map(function(house) {
    var card = drawRandomCard();
    var rev = Math.random() < 0.3;
    return { pos: house, c: card, rev: rev };
  });
  openSpreadModal('Tirada Astrologica', drawn, q, true);
  addToHistory('tirada', { cfg: { name: 'Tirada Astrologica' }, drawn: drawn }, q);
}

export function doKarmicSpread() {
  var q = document.getElementById('tiradaQ').value.trim() || 'Sin pregunta';
  var positions = ['Tu karma pasado', 'Karma de la pareja', 'Leccion comun', 'Obstaculo karmico', 'Ayuda del universo', 'Lo que deben sanar', 'Puente hacia el futuro', 'Resultado si sanan', 'Resultado si no sanan'];
  var drawn = positions.map(function(pos) {
    var card = drawRandomCard();
    var rev = Math.random() < 0.3;
    return { pos: pos, c: card, rev: rev };
  });
  openSpreadModal('Relaciones Karmicas', drawn, q, true);
  addToHistory('tirada', { cfg: { name: 'Relaciones Karmicas' }, drawn: drawn }, q);
}

export function doTreeOfLifeSpread() {
  var q = document.getElementById('tiradaQ').value.trim() || 'Sin pregunta';
  var sefirot = ['Kether (Corona)', 'Chokmah (Sabiduria)', 'Binah (Entendimiento)', 'Chesed (Misericordia)', 'Geburah (Fuerza)', 'Tiphareth (Belleza)', 'Netzach (Victoria)', 'Hod (Esplendor)', 'Yesod (Fundamento)', 'Malkuth (Reino)'];
  var drawn = sefirot.map(function(sef) {
    var card = drawRandomCard();
    var rev = Math.random() < 0.3;
    return { pos: sef, c: card, rev: rev };
  });
  openSpreadModal('Arbol de la Vida', drawn, q, true);
  addToHistory('tirada', { cfg: { name: 'Arbol de la Vida' }, drawn: drawn }, q);
}

export function doRunesSpread(count) {
  var q = document.getElementById('tiradaQ').value.trim() || 'Sin pregunta';
  var runes = [];
  for (var i = 0; i < count; i++) {
    var r = drawRandomRune();
    var rev = Math.random() < 0.3;
    runes.push({ r: r, rev: rev });
  }
  showShuffleAnimation(function() {
    var modalContent = '<h2>Tirada de ' + count + ' runas</h2><div class="cards-grid">' + runes.map(function(ru, idx) { return '<div><strong>Runa ' + (idx+1) + '</strong><div style="transform:' + (ru.rev ? 'rotate(180deg)' : 'none') + '">' + runeCardHTML(ru.r, { small: true }) + '</div></div>'; }).join('') + '</div><div class="interp-card">' + runes.map(function(ru, idx) { return '<div><strong>Runa ' + (idx+1) + ':</strong> ' + (ru.rev && ru.r.rv ? ru.r.rv : ru.r.up) + '</div>'; }).join('') + '</div><div class="action-buttons"><button id="modalRunesIaBtn" class="btn-mystic btn-ia">IA</button><button id="modalRunesPdfBtn" class="btn-mystic btn-pdf">PDF</button><button id="modalRunesShareImgBtn" class="btn-mystic btn-share-img">Compartir Imagen</button><button id="modalRunesShareBtn" class="btn-mystic btn-share-social">Compartir Texto</button></div><div id="modalRunesIAResult"></div>';
    var modal = openModal(modalContent);
    
    var iaBtn = modal.querySelector('#modalRunesIaBtn');
    if (iaBtn) iaBtn.addEventListener('click', async function() {
      var prompt = 'Runas: ' + runes.map(function(r) { return r.r.name + ' (' + (r.rev ? 'inv' : 'der') + ')'; }).join(', ') + '. Pregunta: "' + q + '". Interpretacion de 350 palabras. Texto plano.';
      var btn = iaBtn;
      btn.disabled = true; btn.innerHTML = 'Consultando';
      try {
        var answer = await queueIARequest(prompt);
        answer = answer.replace(/\*\*|__|\[|\]|\(|\)|\#|\*|\-|\+|\|/g, '').replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
        var resultDiv = modal.querySelector('#modalRunesIAResult');
        if (resultDiv) resultDiv.innerHTML = '<div class="ia-interp"><p>' + answer.replace(/\n/g, '<br>') + '</p></div>';
        var utterance = new SpeechSynthesisUtterance(answer);
        utterance.lang = 'es-ES';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch(e) { if (resultDiv) resultDiv.innerHTML = '<div class="ia-interp">Error: ' + e.message + '</div>'; }
      finally { btn.disabled = false; btn.innerHTML = 'IA'; }
    });
    
    var pdfBtn = modal.querySelector('#modalRunesPdfBtn');
    if (pdfBtn) pdfBtn.addEventListener('click', async function() {
      var tempDiv = document.createElement('div');
      var cardsClone = modal.querySelector('.cards-grid').cloneNode(true);
      var interpClone = modal.querySelector('.interp-card').cloneNode(true);
      var iaClone = modal.querySelector('#modalRunesIAResult .ia-interp') ? modal.querySelector('#modalRunesIAResult .ia-interp').cloneNode(true) : null;
      tempDiv.appendChild(cardsClone);
      tempDiv.appendChild(interpClone);
      if (iaClone) tempDiv.appendChild(iaClone);
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = '#fff';
      document.body.appendChild(tempDiv);
      await generatePDFFromElement(tempDiv, 'runas_' + count + '.pdf');
      document.body.removeChild(tempDiv);
    });
    
    var shareImgBtn = modal.querySelector('#modalRunesShareImgBtn');
    if (shareImgBtn) shareImgBtn.addEventListener('click', async function() {
      var cloneContainer = document.createElement('div');
      var cardsClone = modal.querySelector('.cards-grid').cloneNode(true);
      var interpClone = modal.querySelector('.interp-card').cloneNode(true);
      var iaClone = modal.querySelector('#modalRunesIAResult .ia-interp') ? modal.querySelector('#modalRunesIAResult .ia-interp').cloneNode(true) : null;
      cloneContainer.appendChild(cardsClone);
      cloneContainer.appendChild(interpClone);
      if (iaClone) cloneContainer.appendChild(iaClone);
      await shareAsImage(cloneContainer, 'Tirada de ' + count + ' runas');
    });
    
    var shareBtn = modal.querySelector('#modalRunesShareBtn');
    if (shareBtn) shareBtn.addEventListener('click', async function() {
      var text = 'Tirada de ' + count + ' runas:\n' + runes.map(function(ru, idx) { return 'Runa ' + (idx+1) + ': ' + (ru.rev && ru.r.rv ? ru.r.rv : ru.r.up); }).join('\n');
      if (navigator.share) {
        try { await navigator.share({ title: 'Tirada de Runas', text: text }); toast('Compartido'); } catch(e) { toast('Cancelado'); }
      } else {
        await navigator.clipboard.writeText(text);
        toast('Copiado al portapapeles');
      }
    });
  });
  store.lastState.tirada = { type: 'runas', runes: runes, q: q };
  addToHistory('tirada', { runes: runes }, q);
  if (document.getElementById('tiradaAutoIA') && document.getElementById('tiradaAutoIA').checked) setTimeout(function() { getIA('tirada'); }, 500);
}
