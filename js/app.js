// LAZY LOADING MIGRATION
// app.js - Punto de entrada principal (con micrófono corregido)
import { store, loadHistory, addToHistory } from './store.js';
import { toast, unlockAudio, openModal, cardHTML, runeCardHTML, sanitizeHTML, animateCard, initCardAndRuneEvents } from './utils.js';
// TODO: migrar completamente a import dinámico
import { getIA, abortCurrentIA, waitForPuter } from './ia.js';

export async function lazyLoadIAModule(){
  return await import('./ia.js');
}
// TODO: migrar completamente a import dinámico
import { generatePDF, shareContent, shareAsImage } from './pdf.js';

export async function lazyLoadPDFModule(){
  return await import('./pdf.js');
}
import { drawTarot, renderMajorArcana, renderMinorArcana, drawRandomCard } from './tarot.js';
import { drawRune, renderRunasGrid, drawRandomRune } from './runas.js';
import { doSpread, doRunesSpread, doAstrologicalSpread, doKarmicSpread, doTreeOfLifeSpread } from './tiradas.js';
import { calcMoonToday, calcMoonCustom, drawRandomMoon } from './luna.js';
import { interpretDream, saveDream, renderSavedDreamsList, searchDreamSymbol } from './suenos.js';
import { calcNumerologia, calcSynastry, interpretMirrorNumber, generateRandomMirrorNumber } from './numerologia.js';
import { loadGrabovoiDB, searchGrabovoi, sortGrabovoi, filterGrabovoiCategory } from './grabovoi.js';
import { openSettingsModal, renderHistorySettings, updateStatsChartsSettings } from './settings.js';
import { initChat, initSuggestionButtons } from './chat.js';
import { speakText, stopSpeaking, getPremiumVoices } from './voice.js';
import { startMicrophone, stopMicrophone } from './microphone.js';

// Silenciar mensaje de Puter App Store
if (window.puter) {
  puter.quiet = true;
}

function getDailyKey() { return 'oraculo_daily_' + new Date().toLocaleDateString(); }

function showDailyResult(card, revCard, runa, revRuna) {
  const today = new Date().toLocaleDateString();
  const html = `<div class="result-area"><div class="result-title">☀️ Tu energía para el ${sanitizeHTML(today)}</div><div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap"><div><h3>Carta del día</h3>${cardHTML(card, { big: true, reversed: revCard })}<p>${sanitizeHTML(revCard ? card.rv : card.up)}</p></div><div><h3>Runa del día</h3><div style="transform:${revRuna ? 'rotate(180deg)' : 'none'}">${runeCardHTML(runa)}</div><p>${sanitizeHTML(revRuna && runa.rv ? runa.rv : runa.up)}</p></div></div><div id="dailyIAResult"></div></div>`;
  document.getElementById('dailyResult').innerHTML = html;
  document.getElementById('dailyActions').style.display = 'flex';
  store.lastState.daily = { card, rev: revCard, runa, rrev: revRuna };
  addToHistory('daily', { card, rev: revCard, runa, rrev: revRuna }, 'Carta del día');
  const cardEl = document.querySelector('#dailyResult .real-card');
  if (cardEl) animateCard(cardEl);
}

function drawDaily() {
  const stored = localStorage.getItem(getDailyKey());
  if (stored) {
    const data = JSON.parse(stored);
    showDailyResult(data.card, data.revCard, data.runa, data.revRuna);
    if (document.getElementById('dailyAutoIA')?.checked) setTimeout(() => getIA('daily'), 500);
    return;
  }
  const card = drawRandomCard();
  const runa = drawRandomRune();
  const revCard = Math.random() < 0.3;
  const revRuna = Math.random() < 0.3;
  localStorage.setItem(getDailyKey(), JSON.stringify({ card, revCard, runa, revRuna }));
  showDailyResult(card, revCard, runa, revRuna);
  if (document.getElementById('dailyAutoIA')?.checked) setTimeout(() => getIA('daily'), 500);
}

let splashHidden = false;
function hideSplash() {
  if (splashHidden) return;
  splashHidden = true;
  const splash = document.getElementById('splash-screen');
  if (splash) splash.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        renderMajorArcana();
        renderMinorArcana();
        renderRunasGrid();
      });
    } else {
      setTimeout(() => {
        renderMajorArcana();
        renderMinorArcana();
        renderRunasGrid();
      }, 100);
    }
    
    loadHistory();
    renderHistorySettings();
    updateStatsChartsSettings();
    initChat();
    initSuggestionButtons();
    initCardAndRuneEvents();

    document.getElementById('grabovoiSearch')?.addEventListener('input', searchGrabovoi);
    document.getElementById('grabovoiSortSelect')?.addEventListener('change', sortGrabovoi);
    document.getElementById('grabovoiCategory')?.addEventListener('change', filterGrabovoiCategory);
    document.getElementById('symbolSearch')?.addEventListener('input', searchDreamSymbol);

    const unlockAudioAndVoice = () => {
      unlockAudio();
      if (window.speechSynthesis) {
        const dummy = new SpeechSynthesisUtterance(' ');
        dummy.lang = 'es-ES';
        window.speechSynthesis.speak(dummy);
        window.speechSynthesis.cancel();
      }
    };
    document.body.addEventListener('click', unlockAudioAndVoice, { once: true });
    document.body.addEventListener('touchstart', unlockAudioAndVoice, { once: true });

    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    function showSection(sectionId) {
      sections.forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
      const target = document.getElementById(sectionId);
      if (target) { target.classList.add('active'); target.style.display = 'block'; }
      navBtns.forEach(btn => {
        if (btn.getAttribute('data-section') === sectionId) btn.classList.add('active');
        else btn.classList.remove('active');
      });
    }
    navBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = btn.getAttribute('data-section');
        if (sectionId) showSection(sectionId);
      });
    });
    const initialActive = document.querySelector('.section.active');
    if (initialActive) showSection(initialActive.id);
    else showSection('daily');

    document.getElementById('drawTarotBtn')?.addEventListener('click', drawTarot);
    document.getElementById('drawRuneBtn')?.addEventListener('click', drawRune);
    document.getElementById('dailyDrawBtn')?.addEventListener('click', drawDaily);
    document.getElementById('calcNumerologiaBtn')?.addEventListener('click', calcNumerologia);
    document.getElementById('calcSynastryBtn')?.addEventListener('click', calcSynastry);
    document.getElementById('settingsBtn')?.addEventListener('click', openSettingsModal);

    document.querySelectorAll('.btn-pdf').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        await new Promise(r => setTimeout(r, 50));
        const type = btn.getAttribute('data-type');
        if (type === 'grabovoi') { const pdf=await lazyLoadPDFModule(); pdf.generatePDF('grabovoiFullGrid','codigos_grabovoi.pdf'); }
        else if (type === 'tarot') { const pdf=await lazyLoadPDFModule(); pdf.generatePDF('tarotResult','tarot.pdf'); }
        else if (type === 'runa') { const pdf=await lazyLoadPDFModule(); pdf.generatePDF('runaResult','runa.pdf'); }
        else if (type === 'daily') generatePDF('dailyResult', 'carta_dia.pdf');
        else if (type === 'tirada') generatePDF('tiradaResult', 'tirada.pdf');
        else if (type === 'numerologia') generatePDF('numerologiaResult', 'numerologia.pdf');
        else if (type === 'synastry') generatePDF('synastryResult', 'sinastria.pdf');
        else if (type === 'luna') generatePDF('lunaResult', 'luna.pdf');
        else if (type === 'dream') generatePDF('dreamResult', 'sueno.pdf');
      });
    });

    document.querySelectorAll('.btn-share-social').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        if (type === 'tarot') shareContent('tarotResult', 'Tarot');
        else if (type === 'runa') shareContent('runaResult', 'Runa');
        else if (type === 'daily') shareContent('dailyResult', 'Carta del día');
        else if (type === 'tirada') shareContent('tiradaResult', 'Tirada');
        else if (type === 'numerologia') shareContent('numerologiaResult', 'Numerología');
        else if (type === 'synastry') shareContent('synastryResult', 'Sinastría');
        else if (type === 'luna') shareContent('lunaResult', 'Luna');
        else if (type === 'dream') shareContent('dreamResult', 'Sueño');
      });
    });

    const dailyActions = document.getElementById('dailyActions');
    if (dailyActions && !document.getElementById('dailyShareImgBtn')) {
      const shareImgBtn = document.createElement('button');
      shareImgBtn.className = 'btn-mystic btn-share-img-daily';
      shareImgBtn.id = 'dailyShareImgBtn';
      shareImgBtn.innerHTML = '📸 Compartir Imagen';
      dailyActions.appendChild(shareImgBtn);
    }
    document.getElementById('dailyShareImgBtn')?.addEventListener('click', async () => {
      const dailyResultDiv = document.getElementById('dailyResult');
      if (dailyResultDiv && dailyResultDiv.innerText.trim()) {
        const clone = dailyResultDiv.cloneNode(true);
        const unwanted = clone.querySelectorAll('.action-buttons, .btn-mystic, button');
        unwanted.forEach(el => el.remove());
        await shareAsImage(clone, 'Carta y Runa del Día');
      } else {
        toast('No hay contenido para compartir');
      }
    });

    document.querySelectorAll('.spread-option:not([data-spread="astrological"]):not([data-spread="karmic"]):not([data-spread="tree"])').forEach(opt => {
      opt.addEventListener('click', () => {
        let spread = opt.getAttribute('data-spread');
        let positions = [];
        if (spread === 'celtic') positions = ['Presente','Opuesto','Pasado','Futuro','Encima','Debajo','Consejo','Influencias','Esperanzas','Resultado'];
        else if (spread === 'ppf') positions = ['Pasado','Presente','Futuro'];
        else if (spread === 'love') positions = ['Tú','Pareja','Relación','Problemas','Futuro'];
        else if (spread === 'yesno') positions = ['Respuesta'];
        else if (spread === 'week') positions = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
        else if (spread === 'chakras') positions = ['Raíz','Sacro','Plexo','Corazón','Garganta','Tercer Ojo','Corona'];
        else if (spread === 'horseshoe') positions = ['Pasado','Presente','Futuro','Obstáculo','Consejo','Entorno','Resultado'];
        else if (spread === 'star') positions = ['Tú','Problema','Solución','Ayuda','Resultado'];
        else if (spread === 'pyramid') positions = ['Base1','Base2','Base3','Nivel2Izq','Nivel2Der','Cúspide'];
        else if (spread === 'elements') positions = ['Fuego','Agua','Aire','Tierra','Espíritu'];
        else if (spread === 'karma') positions = ['Causa Kármica', 'Efecto Actual', 'Lección a Aprender', 'Liberación', 'Destino Kármico'];
        if (positions.length) doSpread(spread, positions);
      });
    });

    document.querySelectorAll('.spread-option[data-spread="astrological"]').forEach(opt => opt.addEventListener('click', doAstrologicalSpread));
    document.querySelectorAll('.spread-option[data-spread="karmic"]').forEach(opt => opt.addEventListener('click', doKarmicSpread));
    document.querySelectorAll('.spread-option[data-spread="tree"]').forEach(opt => opt.addEventListener('click', doTreeOfLifeSpread));

    document.getElementById('drawThreeRunesBtn')?.addEventListener('click', () => doRunesSpread(3));
    document.getElementById('drawFiveRunesBtn')?.addEventListener('click', () => doRunesSpread(5));
    document.getElementById('drawSevenRunesBtn')?.addEventListener('click', () => doRunesSpread(7));

    document.querySelectorAll('.subnav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.subnav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sub = btn.getAttribute('data-sub');
        document.getElementById('tiradas-tarot').style.display = sub === 'tiradas-tarot' ? 'block' : 'none';
        document.getElementById('tiradas-runes').style.display = sub === 'tiradas-runes' ? 'block' : 'none';
      });
    });

    document.getElementById('calcMoonBtn')?.addEventListener('click', calcMoonToday);
    document.getElementById('calcMoonCustomBtn')?.addEventListener('click', calcMoonCustom);
    document.getElementById('drawMoonBtn')?.addEventListener('click', drawRandomMoon);

    document.getElementById('interpretDreamBtn')?.addEventListener('click', interpretDream);
    document.getElementById('dreamIABtn')?.addEventListener('click', () => getIA('dream'));
    document.getElementById('saveDreamBtn')?.addEventListener('click', saveDream);
    renderSavedDreamsList();

    document.getElementById('interpretMirrorBtn')?.addEventListener('click', interpretMirrorNumber);
    document.getElementById('randomMirrorBtn')?.addEventListener('click', generateRandomMirrorNumber);

    document.querySelectorAll('.num-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.num-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.num-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`num-${tab.getAttribute('data-numtab')}`).classList.add('active');
      });
    });

    document.querySelectorAll('.btn-ia').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        if (type) getIA(type);
      });
    });

    const currentUser = localStorage.getItem('oraculo_user') || '';
    const updateLoginUI = () => {
      const displaySpan = document.getElementById('userNameDisplay');
      const loginBtn = document.getElementById('loginBtn');
      if (currentUser) {
        displaySpan.innerText = `👤 ${currentUser}`;
        loginBtn.innerText = '🚪 Salir';
        loginBtn.onclick = () => { localStorage.removeItem('oraculo_user'); location.reload(); };
      } else {
        displaySpan.innerText = '';
        loginBtn.innerText = '🔐 Login';
        loginBtn.onclick = () => {
          let name = window.prompt('Escribe tu nombre para personalizar la experiencia:','');
          if (name && name.trim()) {
            localStorage.setItem('oraculo_user', name.trim());
            location.reload();
          }
        };
      }
    };
    updateLoginUI();

    if (!currentUser) {
      const welcomeModal = document.getElementById('welcomeModal');
      if (welcomeModal) {
        welcomeModal.style.display = 'flex';
        document.getElementById('welcomeStartBtn').onclick = () => {
          const name = document.getElementById('welcomeNameInput').value.trim();
          if (name) {
            localStorage.setItem('oraculo_user', name);
            location.reload();
          } else { toast('Por favor ingresa tu nombre'); }
        };
      }
    }
    document.getElementById('openManualFromWelcome')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('welcomeModal').style.display = 'none';
      openSettingsModal();
      setTimeout(() => {
        const manualTab = document.querySelector('.settings-tab[data-tab="manual"]');
        if (manualTab) manualTab.click();
      }, 100);
    });

    const grabovoiNavBtn = document.querySelector('.nav-btn[data-section="grabovoi"]');
    if (grabovoiNavBtn) {
      grabovoiNavBtn.addEventListener('click', () => {
        if (store.GRABOVOI_FULL_DB.length === 0) {
          loadGrabovoiDB();
        }
      });
    }

    // ========== MICRÓFONO GLOBAL MEJORADO ==========
    async function micClickHandler(e) {
      const btn = e.currentTarget;
      const inputId = btn.getAttribute('data-mic');
      const input = document.getElementById(inputId);
      if (!input) return;

      const originalHTML = btn.innerHTML;
      const updateUI = (isListening) => {
        if (isListening) {
          btn.classList.add('listening');
          btn.innerHTML = '🎤 Escuchando...';
        } else {
          btn.classList.remove('listening');
          btn.innerHTML = originalHTML;
        }
      };

      const onError = (msg) => {
        updateUI(false);
        toast(msg);
      };

      await startMicrophone(btn, input, updateUI, onError);
    }

    function initMicrophones() {
      const micButtons = document.querySelectorAll('[data-mic]');
      micButtons.forEach(btn => {
        btn.removeEventListener('click', micClickHandler);
        btn.addEventListener('click', micClickHandler);
      });
    }
    initMicrophones();
    const observer = new MutationObserver(() => initMicrophones());
    observer.observe(document.body, { childList: true, subtree: true });

  } catch (error) {
    console.error('Error en la inicialización:', error);
    toast('Error al cargar la aplicación. Recarga la página.');
  } finally {
    setTimeout(hideSplash, 300);
  }
});

window.addEventListener('load', () => {
  setTimeout(hideSplash, 100);
});
setTimeout(() => { hideSplash(); }, 5000);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
}


// TODO v1.6: integrar vista completa de favoritos usando store.favorites
