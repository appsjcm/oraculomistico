// luna.js - Fases lunares reales y consultas con IA, PDF, imagen, compartir
import { store, addToHistory, saveNote } from './store.js';
import { toast } from './utils.js';
import { queueIARequest, waitForPuter } from './ia.js';
import { generatePDFFromElement, shareAsImage, shareContent } from './pdf.js';
import { MOON_PHASES } from './data.js';

export function getMoonPhase(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  let r = year % 100;
  r %= 19;
  if (r > 9) r -= 19;
  r = (r * 11) % 30;
  r += (month * 2) + day;
  if (month < 3) r += 2;
  r -= (year < 2000 ? 4 : 8.3);
  r = Math.floor(r) % 30;
  if (r < 0) r += 30;
  if (r === 0) return MOON_PHASES[0];
  if (r < 7) return MOON_PHASES[1];
  if (r === 7) return MOON_PHASES[2];
  if (r < 14) return MOON_PHASES[3];
  if (r === 14 || r === 15) return MOON_PHASES[4];
  if (r < 22) return MOON_PHASES[5];
  if (r === 22) return MOON_PHASES[6];
  return MOON_PHASES[7];
}

export function showMoonPhase(phase, dateInfo) {
  const resultDiv = document.getElementById('lunaResult');
  resultDiv.innerHTML = `
    <div class="result-area"><div class="luna-card"><div class="luna-fase">${phase.sym}</div><h3>${phase.name}</h3></div>
      <h3>${phase.sym} ${phase.name} (${dateInfo})</h3>
      <p>${phase.meaning}</p>
      <div class="moon-meter"><div class="moon-meter-fill" style="width:${phase.name.includes("Llena")?100:phase.name.includes("Nueva")?5:75}%"></div></div>
      <p class="moon-percent">Energía lunar activa</p>
      <div class="moon-advice"><h4>✨ Ritual recomendado</h4><p>${phase.ritual}</p></div>
      <div class="moon-affirmation">"${phase.affirmation}"</div>
      <div id="lunaIAResult"></div>
      <div class="action-buttons">
        <button class="btn-mystic btn-ia" id="lunaIaBtn">🤖 IA</button>
        <button class="btn-mystic btn-pdf" id="lunaPdfBtn">📄 PDF</button>
        <button class="btn-mystic btn-share-img" id="lunaShareImgBtn">📸 Compartir Imagen</button>
        <button class="btn-mystic btn-share-social" id="lunaShareTextBtn">📱 Compartir Texto</button>
        <button class="btn-mystic btn-save" id="lunaSaveNoteBtn">💾 Guardar Nota</button>
      </div>
    </div>
  `;
  store.lastState.luna = { phase };
  addToHistory('luna', { phase }, `Fase lunar ${dateInfo}`);
  
  // Botón IA específico
  const iaBtn = document.getElementById('lunaIaBtn');
  if (iaBtn) {
    iaBtn.addEventListener('click', async () => {
      await waitForPuter();
      if (!window.puter?.ai?.chat) { toast('Para usar IA, regístrate en Puter.'); return; }
      const iaDiv = document.getElementById('lunaIAResult');
      iaDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div><span>El oráculo lunar teje su mensaje...</span></div>';
      try {
        const prompt = `Fase lunar: ${phase.name}. Significado: ${phase.meaning}. Ritual: ${phase.ritual}. Afirmación: ${phase.affirmation}. Proporciona una interpretación espiritual profunda de 350 palabras, con consejos para aprovechar esta energía. Texto plano.`;
        let answer = await queueIARequest(prompt);
        answer = answer.replace(/\*\*|__|\[|\]|\(|\)|\#|\*|\-|\+|\|/g, '').replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
        iaDiv.innerHTML = `<div class="ia-interp"><p>${answer.replace(/\n/g, '<br>')}</p></div>`;
        const utterance = new SpeechSynthesisUtterance(answer);
        utterance.lang = 'es-ES';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch(e) { iaDiv.innerHTML = `<div class="ia-interp">Error: ${e.message}</div>`; }
    });
  }
  
  // Botón PDF (incluye IA si existe)
  const pdfBtn = document.getElementById('lunaPdfBtn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', async () => {
      const userName = localStorage.getItem('oraculo_user') || 'Consultante';
      const dateStr = new Date().toLocaleString();
      const tempDiv = document.createElement('div');
      let iaHtml = '';
      const iaContent = document.getElementById('lunaIAResult')?.innerHTML;
      if (iaContent && iaContent.includes('ia-interp')) {
        iaHtml = `<h3>🤖 Interpretación de la IA</h3>${iaContent}`;
      }
      tempDiv.innerHTML = `
        <h2>🌙 Oráculo Lunar</h2>
        <p><strong>Usuario:</strong> ${userName}</p>
        <p><strong>Fecha:</strong> ${dateStr}</p>
        <h3>${phase.sym} ${phase.name}</h3>
        <p><strong>Significado:</strong> ${phase.meaning}</p>
        <p><strong>Ritual:</strong> ${phase.ritual}</p>
        <p><strong>Afirmación:</strong> ${phase.affirmation}</p>
        ${iaHtml}
      `;
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = '#fff';
      document.body.appendChild(tempDiv);
      await generatePDFFromElement(tempDiv, `luna_${phase.name}.pdf`);
      document.body.removeChild(tempDiv);
    });
  }
  
  // Botón Compartir Imagen
  const shareImgBtn = document.getElementById('lunaShareImgBtn');
  if (shareImgBtn) {
    shareImgBtn.addEventListener('click', async () => {
      const clone = document.createElement('div');
      let iaHtml = '';
      const iaContent = document.getElementById('lunaIAResult')?.innerHTML;
      if (iaContent && iaContent.includes('ia-interp')) {
        iaHtml = `<h3>🤖 Interpretación de la IA</h3>${iaContent}`;
      }
      clone.innerHTML = `<h3>${phase.name}</h3><p>${phase.meaning}</p><p><strong>Ritual:</strong> ${phase.ritual}</p><p><strong>Afirmación:</strong> ${phase.affirmation}</p>${iaHtml}`;
      await shareAsImage(clone, `Fase lunar: ${phase.name}`);
    });
  }
  
  // Botón Compartir Texto
  const shareTextBtn = document.getElementById('lunaShareTextBtn');
  if (shareTextBtn) {
    shareTextBtn.addEventListener('click', async () => {
      await shareContent('lunaResult', 'Fase lunar');
    });
  }
  
  // Botón Guardar Nota
  const saveNoteBtn = document.getElementById('lunaSaveNoteBtn');
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
      saveNote(`${phase.name}: ${phase.meaning}\nRitual: ${phase.ritual}\nAfirmación: ${phase.affirmation}`);
      toast('Nota guardada');
    });
  }
}

export function calcMoonToday() {
  const phase = getMoonPhase(new Date());
  showMoonPhase(phase, 'Hoy');
}

export function calcMoonCustom() {
  const dateStr = document.getElementById('moonDate').value;
  if (!dateStr) return toast('Selecciona una fecha');
  const selectedDate = new Date(dateStr);
  const phase = getMoonPhase(selectedDate);
  showMoonPhase(phase, selectedDate.toLocaleDateString());
}

export function drawRandomMoon() {
  const phase = MOON_PHASES[Math.floor(Math.random() * MOON_PHASES.length)];
  showMoonPhase(phase, 'Consulta aleatoria');
}
