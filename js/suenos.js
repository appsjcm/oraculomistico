// suenos.js - Interpretación de sueños con IA, PDF, imagen, compartir y guardar
import { store, addToHistory, saveNote } from './store.js'; // CORREGIDO: importar saveNote
import { toast, speakText, sanitizeHTML } from './utils.js';
import { waitForPuter, queueIARequest } from './ia.js';
import { generatePDFFromElement, shareAsImage, shareContent } from './pdf.js';

export const dreamSymbols = {
  'agua': 'Emociones, inconsciente, fluidez.',
  'fuego': 'Pasión, transformación.',
  'volar': 'Libertad, superación.',
  'caer': 'Inseguridad, miedo.',
  'muerte': 'Cambio profundo.',
  'dientes': 'Inseguridad personal.',
  'casa': 'La psique.',
  'serpiente': 'Sabiduría instintiva.',
  'gato': 'Intuición, misterio.',
  'perro': 'Lealtad.',
  'dinero': 'Valor propio.',
  'examen': 'Autoevaluación.',
  'boda': 'Unión interna.',
  'embarazo': 'Nuevo proyecto.',
  'persecución': 'Ansiedad.'
};

export function searchDreamSymbol() {
  const term = document.getElementById('symbolSearch').value.toLowerCase().trim();
  const resultDiv = document.getElementById('symbolResult');
  if (!term) { resultDiv.innerHTML = ''; return; }
  const matches = Object.entries(dreamSymbols).filter(([key]) => key.includes(term));
  if (matches.length === 0) {
    resultDiv.innerHTML = '<p>No se encontró. Prueba con: agua, fuego, volar, caer...</p>';
    return;
  }
  resultDiv.innerHTML = matches.map(([key, value]) => `<div><strong>${key}</strong>: ${value}</div>`).join('');
}

export async function interpretDream() {
  await waitForPuter();
  const txt = document.getElementById('dreamText').value;
  if (!txt) return toast('Escribe un sueño');
  if (!window.puter?.ai?.chat) { toast('Para usar IA, regístrate en Puter.'); return; }
  const resultDiv = document.getElementById('dreamResult');
  resultDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div><span>Interpretando tu sueño...</span></div>';
  try {
    let answer = await queueIARequest(`Interpreta este sueño: ${txt}. Proporciona una interpretación detallada de 400 palabras, incluyendo símbolos y consejos prácticos. Texto plano.`);
    answer = sanitizeHTML(answer.replace(/\*\*|__|\[|\]|\(|\)|\#|\*|\-|\+|\|/g, '').replace(/[\u{1F600}-\u{1F6FF}]/gu, ''));
    resultDiv.innerHTML = `
      <div class="result-area">
        <h3>🔮 Interpretación</h3>
        <p>${answer}</p>
        <div id="dreamIAResult"></div>
        <div class="action-buttons">
          <button class="btn-mystic btn-ia" id="dreamExtraIaBtn">🤖 Profundizar</button>
          <button class="btn-mystic btn-pdf" id="dreamPdfBtn">📄 PDF</button>
          <button class="btn-mystic btn-share-img" id="dreamShareImgBtn">📸 Compartir Imagen</button>
          <button class="btn-mystic btn-share-social" id="dreamShareTextBtn">📱 Compartir Texto</button>
          <button class="btn-mystic btn-save" id="dreamSaveNoteBtn">💾 Guardar Nota</button>
        </div>
      </div>
    `;
    store.lastState.dream = { txt, interpretation: answer };
    addToHistory('dream', { dream: txt, interpretation: answer }, 'Interpretación de sueño');
    speakText(answer);
    
    // Botón profundizar (IA adicional)
    const extraIaBtn = document.getElementById('dreamExtraIaBtn');
    if (extraIaBtn) {
      extraIaBtn.addEventListener('click', async () => {
        const iaDiv = document.getElementById('dreamIAResult');
        iaDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div><span>Profundizando...</span></div>';
        try {
          let extra = await queueIARequest(`Sobre el sueño: "${txt}". La interpretación anterior fue: ${answer}. Ahora profundiza en los aspectos psicológicos y espirituales, dando consejos prácticos. 350 palabras. Texto plano.`);
          extra = sanitizeHTML(extra.replace(/\*\*|__|\[|\]|\(|\)|\#|\*|\-|\+|\|/g, '').replace(/[\u{1F600}-\u{1F6FF}]/gu, ''));
          iaDiv.innerHTML = `<div class="ia-interp"><p>${extra.replace(/\n/g, '<br>')}</p></div>`;
          speakText(extra);
        } catch(e) { iaDiv.innerHTML = `<div class="ia-interp">Error: ${e.message}</div>`; }
      });
    }
    
    // PDF
    const pdfBtn = document.getElementById('dreamPdfBtn');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', async () => {
        const userName = localStorage.getItem('oraculo_user') || 'Consultante';
        const dateStr = new Date().toLocaleString();
        let iaHtml = '';
        const iaContent = document.getElementById('dreamIAResult')?.innerHTML;
        if (iaContent && iaContent.includes('ia-interp')) {
          iaHtml = `<h3>🤖 Interpretación profunda de la IA</h3>${iaContent}`;
        }
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
          <h2>💭 Interpretación de Sueño</h2>
          <p><strong>Usuario:</strong> ${userName}</p>
          <p><strong>Fecha:</strong> ${dateStr}</p>
          <p><strong>Sueño:</strong> ${txt}</p>
          <h3>🔮 Interpretación</h3>
          <p>${answer}</p>
          ${iaHtml}
        `;
        tempDiv.style.padding = '20px';
        tempDiv.style.backgroundColor = '#fff';
        document.body.appendChild(tempDiv);
        await generatePDFFromElement(tempDiv, `sueno_${Date.now()}.pdf`);
        document.body.removeChild(tempDiv);
      });
    }
    
    // Compartir imagen
    const shareImgBtn = document.getElementById('dreamShareImgBtn');
    if (shareImgBtn) {
      shareImgBtn.addEventListener('click', async () => {
        const clone = document.createElement('div');
        let iaHtml = '';
        const iaContent = document.getElementById('dreamIAResult')?.innerHTML;
        if (iaContent && iaContent.includes('ia-interp')) {
          iaHtml = `<h3>🤖 IA</h3>${iaContent}`;
        }
        clone.innerHTML = `<h3>Sueño</h3><p>${txt}</p><h3>Interpretación</h3><p>${answer}</p>${iaHtml}`;
        await shareAsImage(clone, 'Interpretación de sueño');
      });
    }
    
    // Compartir texto
    const shareTextBtn = document.getElementById('dreamShareTextBtn');
    if (shareTextBtn) {
      shareTextBtn.addEventListener('click', async () => {
        await shareContent('dreamResult', 'Sueño');
      });
    }
    
    // Guardar nota
    const saveNoteBtn = document.getElementById('dreamSaveNoteBtn');
    if (saveNoteBtn) {
      saveNoteBtn.addEventListener('click', () => {
        saveNote(`Sueño: ${txt}\nInterpretación: ${answer}`);
        toast('Nota guardada');
      });
    }
    
  } catch(e) {
    resultDiv.innerHTML = `<div class="result-area">Error: ${e.message}</div>`;
  }
}

export function saveDream() {
  const txt = document.getElementById('dreamText').value;
  if (!txt) return toast('No hay sueño para guardar');
  let savedDreams = JSON.parse(localStorage.getItem('oraculo_dreams') || '[]');
  savedDreams.push(txt);
  localStorage.setItem('oraculo_dreams', JSON.stringify(savedDreams));
  toast('Sueño guardado');
  renderSavedDreamsList();
}

export function renderSavedDreamsList() {
  const savedDreams = JSON.parse(localStorage.getItem('oraculo_dreams') || '[]');
  const listDiv = document.getElementById('savedDreamsList');
  if (!listDiv) return;
  if (savedDreams.length === 0) {
    listDiv.innerHTML = '';
    return;
  }
  listDiv.innerHTML = savedDreams.map((d, i) => `<div class="saved-dream-item" onclick="document.getElementById('dreamText').value='${d.replace(/'/g, "\\'")}'">${d.substring(0, 50)}...</div>`).join('');
}
