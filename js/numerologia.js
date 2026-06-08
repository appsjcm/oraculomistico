// numerologia.js - Cálculos numerológicos, sinastría y números espejo con IA
import { store, addToHistory, saveNote } from './store.js';
import { toast, sanitizeHTML, speakText } from './utils.js';
import { queueIARequest, waitForPuter } from './ia.js';
import { generatePDFFromElement, shareAsImage, shareContent } from './pdf.js';

function reduceToSingle(n) {
  if (isNaN(n)) return 0;
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = n.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return n;
}

function letterToNumber(c) {
  const map = { 'A':1,'B':2,'C':3,'D':4,'E':5,'F':6,'G':7,'H':8,'I':9,'J':1,'K':2,'L':3,'M':4,'N':5,'Ñ':5,'O':6,'P':7,'Q':8,'R':9,'S':1,'T':2,'U':3,'V':4,'W':5,'X':6,'Y':7,'Z':8,'Á':1,'É':5,'Í':9,'Ó':6,'Ú':3,'Ü':3 };
  return map[c] || 0;
}

function nombreToNumero(nombre) {
  if (!nombre) return 0;
  const clean = nombre.toUpperCase().replace(/[^A-ZÁÉÍÓÚÜÑ]/g, '');
  let sum = 0;
  for (let c of clean) sum += letterToNumber(c);
  return reduceToSingle(sum);
}

function numeroAlma(nombre) {
  if (!nombre) return 0;
  const vocales = 'AEIOUÁÉÍÓÚÜ';
  const clean = nombre.toUpperCase().replace(/[^A-ZÁÉÍÓÚÜÑ]/g, '');
  let sum = 0;
  for (let c of clean) {
    if (vocales.includes(c)) sum += letterToNumber(c);
  }
  return reduceToSingle(sum);
}

function numeroPersonalidad(nombre) {
  if (!nombre) return 0;
  const vocales = 'AEIOUÁÉÍÓÚÜ';
  const clean = nombre.toUpperCase().replace(/[^A-ZÁÉÍÓÚÜÑ]/g, '');
  let sum = 0;
  for (let c of clean) {
    if (!vocales.includes(c)) sum += letterToNumber(c);
  }
  return reduceToSingle(sum);
}

function numeroActitud(dia, mes) { return reduceToSingle(dia + mes); }
function numeroFechaActual() {
  const hoy = new Date();
  return reduceToSingle(hoy.getDate() + (hoy.getMonth() + 1) + hoy.getFullYear());
}
function añoPersonal(diaNac, mesNac, añoActual) { return reduceToSingle(diaNac + mesNac + añoActual); }

const descripcionesNumeros = {
  1: '✨ Liderazgo, independencia, creatividad. Eres pionero.',
  2: '🤝 Cooperación, diplomacia, sensibilidad. Valoras la armonía.',
  3: '🎨 Comunicación, optimismo, expresión artística.',
  4: '🏗️ Orden, trabajo, disciplina. Construyes bases sólidas.',
  5: '🌀 Libertad, aventura, cambio. Necesitas variedad.',
  6: '❤️ Responsabilidad, amor, servicio. Eres el cuidador.',
  7: '🔍 Análisis, sabiduría, introspección. Buscas la verdad.',
  8: '💼 Poder, éxito, abundancia material.',
  9: '🌍 Humanitario, compasión, desapego.',
  11: '🌟 Maestro inspirador, intuición elevada.',
  22: '🏛️ Maestro constructor, visión global.',
  33: '💖 Maestro sanador, amor incondicional.'
};

const descripcionesActitud = {
  1: 'Liderazgo y acción', 2: 'Cooperación y paciencia', 3: 'Creatividad y comunicación',
  4: 'Orden y trabajo', 5: 'Cambio y aventura', 6: 'Responsabilidad y amor',
  7: 'Introspección y análisis', 8: 'Poder y éxito', 9: 'Cierre y compasión'
};

function consejoPersonalizado(vida, alma, expresion) {
  if (vida === 1 && expresion === 8) return '💰 Tienes madera de líder y empresario. Aprende a delegar.';
  if (vida === 2 && alma === 7) return '🔍 Eres muy sensible e intuitivo. Busca entornos tranquilos.';
  if (vida === 3 && expresion === 6) return '🎭 Tu creatividad puede servir para sanar a otros.';
  if (vida === 4 && alma === 5) return '🌀 Necesitas estabilidad pero también libertad.';
  if (vida === 5 && expresion === 3) return '📢 Eres un comunicador nato y amas la libertad.';
  if (vida === 6 && alma === 2) return '❤️ Tu corazón es muy compasivo. Aprende a poner límites.';
  if (vida === 7 && expresion === 9) return '📚 Eres un sabio que puede guiar a la humanidad.';
  if (vida === 8 && alma === 4) return '🏢 Eres trabajador y ambicioso. No descuides tu salud.';
  if (vida === 9 && expresion === 11) return '🌟 Tienes una misión espiritual muy elevada.';
  return '✨ Tu combinación numérica es única. Sigue explorando tu interior.';
}

export function calcNumerologia() {
  const nombreCompleto = document.getElementById('numName').value.trim();
  const dob = document.getElementById('numDob').value;
  if (!nombreCompleto && !dob) { toast('Ingresa al menos tu nombre o fecha de nacimiento'); return; }
  let vida = '', alma = '', personalidad = '', expresion = '', actitud = '', fechaActual = '', añoPersonalActual = '';
  let diaNac = '', mesNac = '', añoNac = '';
  if (dob) {
    const partes = dob.split('-');
    diaNac = parseInt(partes[2]);
    mesNac = parseInt(partes[1]);
    añoNac = parseInt(partes[0]);
    vida = reduceToSingle(diaNac + mesNac + añoNac);
    actitud = numeroActitud(diaNac, mesNac);
    añoPersonalActual = añoPersonal(diaNac, mesNac, new Date().getFullYear());
  }
  if (nombreCompleto) {
    expresion = nombreToNumero(nombreCompleto);
    alma = numeroAlma(nombreCompleto);
    personalidad = numeroPersonalidad(nombreCompleto);
  }
  fechaActual = numeroFechaActual();
  const resultado = `
    <div class="result-title">🔢 Numerología de ${nombreCompleto || 'Consultante'}</div>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap:20px; margin:20px 0;">
      <div class="numero-grid">
      ${vida ? renderNumeroCard(vida,'Camino de Vida') : ''}
      ${expresion ? renderNumeroCard(expresion,'Expresión') : ''}
      ${alma ? renderNumeroCard(alma,'Alma') : ''}
      ${personalidad ? renderNumeroCard(personalidad,'Personalidad') : ''}
      ${actitud ? renderNumeroCard(actitud,'Actitud') : ''}
      </div>
      ${vida ? `<div class="num-details"><p>${descripcionesNumeros[vida]}</p></div>` : ''}
      ${actitud ? `<div class="num-details"><h3>⚡ Actitud: ${actitud}</h3><p>${descripcionesActitud[actitud]}</p></div>` : ''}
      <div class="num-details"><h3>📅 Fecha Actual: ${fechaActual}</h3><p>${descripcionesActitud[fechaActual] || 'Energía del día: vive con conciencia.'}</p></div>
      ${añoPersonalActual ? `<div class="num-details"><h3>📆 Año Personal: ${añoPersonalActual}</h3><p>${descripcionesNumeros[añoPersonalActual]}</p></div>` : ''}
    </div>
    <div class="num-details"><h3>✨ Consejo Personalizado</h3><p>${consejoPersonalizado(vida, alma, expresion)}</p></div><div class="num-details"><div class="radar-container"><canvas id="numerologiaRadar"></canvas></div></div>
    <div id="numerologiaIAResult"></div>
    <div class="action-buttons">
      <button class="btn-mystic btn-ia" id="numerologiaIaBtn">🤖 IA</button>
      <button class="btn-mystic btn-pdf" id="numPdfBtn">📄 PDF</button>
      <button class="btn-mystic btn-share-img" id="numShareImgBtn">📸 Compartir Imagen</button>
      <button class="btn-mystic btn-share-social" id="numShareTextBtn">📱 Compartir Texto</button>
      <button class="btn-mystic btn-save" id="numSaveNoteBtn">💾 Guardar Nota</button>
    </div>
  `;
  document.getElementById('numerologiaResult').innerHTML = resultado;
  if (window.Chart) {
    const ctx = document.getElementById('numerologiaRadar');
    if (ctx) {
      new Chart(ctx, {
        type:'radar',
        data:{
          labels:['Vida','Expresión','Alma','Personalidad','Actitud'],
          datasets:[{
            label:'Perfil Numerológico', backgroundColor:'rgba(212,175,55,.20)', borderColor:'#D4AF37', pointBackgroundColor:'#8B5CF6', pointRadius:5, borderWidth:3,
            data:[vida||0,expresion||0,alma||0,personalidad||0,actitud||0]
          }]
        },
        options:{responsive:true,maintainAspectRatio:false}
      });
    }
  }
  store.lastState.num = { vida, expresion, alma, personalidad, actitud, fechaActual, añoPersonalActual };
  addToHistory('numerologia', { vida, expresion, alma, personalidad, actitud, fechaActual, añoPersonalActual }, 'Cálculo numerológico');
  
  // Botón IA específico
  const iaBtn = document.getElementById('numerologiaIaBtn');
  if (iaBtn) {
    iaBtn.addEventListener('click', async () => {
      await waitForPuter();
      if (!window.puter?.ai?.chat) { toast('Para usar IA, regístrate en Puter.'); return; }
      const iaDiv = document.getElementById('numerologiaIAResult');
      iaDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div><span>El oráculo numérico teje su respuesta...</span></div>';
      try {
        const prompt = `Número de vida: ${vida}, número de expresión: ${expresion}, número del alma: ${alma}. Proporciona un análisis numerológico profundo de 450 palabras, explicando la combinación y dando consejos prácticos para el desarrollo personal. Texto plano.`;
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
  const pdfBtn = document.getElementById('numPdfBtn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', async () => {
      const userName = localStorage.getItem('oraculo_user') || 'Consultante';
      const dateStr = new Date().toLocaleString();
      const tempDiv = document.createElement('div');
      let iaHtml = '';
      const iaContent = document.getElementById('numerologiaIAResult')?.innerHTML;
      if (iaContent && iaContent.includes('ia-interp')) {
        iaHtml = `<h3>🤖 Interpretación de la IA</h3>${iaContent}`;
      }
      tempDiv.innerHTML = `
        <h2>🔢 Numerología Personal</h2>
        <p><strong>Usuario:</strong> ${userName}</p>
        <p><strong>Fecha:</strong> ${dateStr}</p>
        <p><strong>Nombre:</strong> ${nombreCompleto || 'No especificado'}</p>
        <p><strong>Fecha de nacimiento:</strong> ${dob || 'No especificada'}</p>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:15px; margin-top:20px;">
          ${vida ? `<div><strong>🚀 Camino de Vida:</strong> ${vida}<br>${descripcionesNumeros[vida]}</div>` : ''}
          ${expresion ? `<div><strong>🎭 Expresión:</strong> ${expresion}<br>${descripcionesNumeros[expresion]}</div>` : ''}
          ${alma ? `<div><strong>💖 Alma:</strong> ${alma}<br>${descripcionesNumeros[alma]}</div>` : ''}
          ${personalidad ? `<div><strong>🎩 Personalidad:</strong> ${personalidad}<br>${descripcionesNumeros[personalidad]}</div>` : ''}
          ${actitud ? `<div><strong>⚡ Actitud:</strong> ${actitud}<br>${descripcionesActitud[actitud]}</div>` : ''}
          <div><strong>📅 Fecha Actual:</strong> ${fechaActual}<br>${descripcionesActitud[fechaActual] || 'Energía del día'}</div>
          ${añoPersonalActual ? `<div><strong>📆 Año Personal:</strong> ${añoPersonalActual}<br>${descripcionesNumeros[añoPersonalActual]}</div>` : ''}
        </div>
        <div class="num-details"><h3>✨ Consejo Personalizado</h3><p>${consejoPersonalizado(vida, alma, expresion)}</p></div><div class="num-details"><div class="radar-container"><canvas id="numerologiaRadar"></canvas></div></div>
        ${iaHtml}
      `;
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = '#fff';
      document.body.appendChild(tempDiv);
      await generatePDFFromElement(tempDiv, `numerologia_${Date.now()}.pdf`);
      document.body.removeChild(tempDiv);
    });
  }
  
  // Botón Compartir Imagen
  const shareImgBtn = document.getElementById('numShareImgBtn');
  if (shareImgBtn) {
    shareImgBtn.addEventListener('click', async () => {
      const clone = document.createElement('div');
      let iaHtml = '';
      const iaContent = document.getElementById('numerologiaIAResult')?.innerHTML;
      if (iaContent && iaContent.includes('ia-interp')) {
        iaHtml = `<h3>🤖 Interpretación de la IA</h3>${iaContent}`;
      }
      clone.innerHTML = `<h3>Numerología de ${nombreCompleto || 'Consultante'}</h3><p>Vida: ${vida}, Expresión: ${expresion}, Alma: ${alma}</p><p>${consejoPersonalizado(vida, alma, expresion)}</p>${iaHtml}`;
      await shareAsImage(clone, 'Numerología');
    });
  }
  
  // Botón Compartir Texto
  const shareTextBtn = document.getElementById('numShareTextBtn');
  if (shareTextBtn) {
    shareTextBtn.addEventListener('click', async () => {
      await shareContent('numerologiaResult', 'Numerología');
    });
  }
  
  // Botón Guardar Nota
  const saveNoteBtn = document.getElementById('numSaveNoteBtn');
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
      saveNote(`Numerología: Vida ${vida}, Expresión ${expresion}, Alma ${alma}\nConsejo: ${consejoPersonalizado(vida, alma, expresion)}`);
      toast('Nota guardada');
    });
  }
}

export function calcSynastry() {
  const n1 = document.getElementById('synName1').value || 'Persona 1';
  const d1 = document.getElementById('synDob1').value;
  const n2 = document.getElementById('synName2').value || 'Persona 2';
  const d2 = document.getElementById('synDob2').value;
  if (!d1 || !d2) return toast('Ingresa ambas fechas de nacimiento');
  const partes1 = d1.split('-'), partes2 = d2.split('-');
  const lp1 = reduceToSingle(parseInt(partes1[2]) + parseInt(partes1[1]) + parseInt(partes1[0]));
  const lp2 = reduceToSingle(parseInt(partes2[2]) + parseInt(partes2[1]) + parseInt(partes2[0]));
  const alma1 = numeroAlma(n1), alma2 = numeroAlma(n2);
  const expresion1 = nombreToNumero(n1), expresion2 = nombreToNumero(n2);
  const diffVida = Math.abs(lp1 - lp2), diffAlma = Math.abs(alma1 - alma2), diffExpresion = Math.abs(expresion1 - expresion2);
  const compatVida = diffVida === 0 ? 'Almas gemelas ✨' : diffVida <= 2 ? 'Excelente 💞' : diffVida <= 4 ? 'Buena 💕' : diffVida <= 6 ? 'Media 💫' : 'Kármica 🔮';
  const compatAlma = diffAlma <= 2 ? '🕯️ Conexión espiritual profunda' : '🌱 Aprendizaje mutuo';
  const compatExpresion = diffExpresion <= 2 ? '🎯 Metas alineadas' : '🔄 Complementarios';
  const compatGlobal = (diffVida + diffAlma + diffExpresion) / 3;
  const mensajeGlobal = compatGlobal <= 2 ? '❤️ Pareja muy armoniosa' : compatGlobal <= 4 ? '💑 Buena compatibilidad para crecer' : '🔁 Relación de aprendizaje y evolución';
  const html = `
    <div class="result-title">❤️ Sinastría: ${n1} y ${n2}</div>
    <div style="display:flex;justify-content:center;gap:40px;flex-wrap:wrap">
      <div><strong>${n1}</strong><br>Vida: ${lp1}<br>Alma: ${alma1}<br>Expresión: ${expresion1}</div>
      <div><strong>${n2}</strong><br>Vida: ${lp2}<br>Alma: ${alma2}<br>Expresión: ${expresion2}</div>
    </div>
    <div class="num-details">
      <h3>📊 Compatibilidad por áreas</h3>
      <p>🔮 Camino de Vida: ${compatVida}</p>
      <p>🕯️ Almas: ${compatAlma}</p>
      <p>🎭 Expresión: ${compatExpresion}</p>
      <h3>💞 Compatibilidad Global</h3>
      <p>${mensajeGlobal}</p>
    </div>
    <div id="synastryIAResult"></div>
    <div class="action-buttons">
      <button class="btn-mystic btn-ia" id="synastryIaBtn">🤖 IA</button>
      <button class="btn-mystic btn-pdf" id="synPdfBtn">📄 PDF</button>
      <button class="btn-mystic btn-share-img" id="synShareImgBtn">📸 Compartir Imagen</button>
      <button class="btn-mystic btn-share-social" id="synShareTextBtn">📱 Compartir Texto</button>
      <button class="btn-mystic btn-save" id="synSaveNoteBtn">💾 Guardar Nota</button>
    </div>
  `;
  document.getElementById('synastryResult').innerHTML = html;
  store.lastState.syn = { n1, n2, lp1, lp2, alma1, alma2, expresion1, expresion2 };
  addToHistory('synastry', { n1, n2, lp1, lp2, alma1, alma2, expresion1, expresion2 }, `Compatibilidad entre ${n1} y ${n2}`);
  
  // Botón IA para sinastría
  const synIaBtn = document.getElementById('synastryIaBtn');
  if (synIaBtn) {
    synIaBtn.addEventListener('click', async () => {
      await waitForPuter();
      if (!window.puter?.ai?.chat) { toast('Para usar IA, regístrate en Puter.'); return; }
      const iaDiv = document.getElementById('synastryIAResult');
      iaDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div><span>Analizando compatibilidad...</span></div>';
      try {
        const prompt = `Sinastría entre ${n1} (vida ${lp1}, alma ${alma1}) y ${n2} (vida ${lp2}, alma ${alma2}). Análisis de 400 palabras sobre compatibilidad amorosa, puntos fuertes y áreas de mejora. Texto plano.`;
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
  
  // PDF para sinastría
  const synPdfBtn = document.getElementById('synPdfBtn');
  if (synPdfBtn) {
    synPdfBtn.addEventListener('click', async () => {
      const userName = localStorage.getItem('oraculo_user') || 'Consultante';
      const dateStr = new Date().toLocaleString();
      const tempDiv = document.createElement('div');
      let iaHtml = '';
      const iaContent = document.getElementById('synastryIAResult')?.innerHTML;
      if (iaContent && iaContent.includes('ia-interp')) {
        iaHtml = `<h3>🤖 Interpretación de la IA</h3>${iaContent}`;
      }
      tempDiv.innerHTML = `
        <h2>❤️ Sinastría</h2>
        <p><strong>Usuario:</strong> ${userName}</p>
        <p><strong>Fecha:</strong> ${dateStr}</p>
        <p><strong>${n1}</strong> (Vida ${lp1}, Alma ${alma1}, Expresión ${expresion1})</p>
        <p><strong>${n2}</strong> (Vida ${lp2}, Alma ${alma2}, Expresión ${expresion2})</p>
        <div class="num-details">
          <h3>Compatibilidad</h3>
          <p>🔮 Camino de Vida: ${compatVida}</p>
          <p>🕯️ Almas: ${compatAlma}</p>
          <p>🎭 Expresión: ${compatExpresion}</p>
          <h3>💞 Compatibilidad Global</h3>
          <p>${mensajeGlobal}</p>
        </div>
        ${iaHtml}
      `;
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = '#fff';
      document.body.appendChild(tempDiv);
      await generatePDFFromElement(tempDiv, `sinastria_${Date.now()}.pdf`);
      document.body.removeChild(tempDiv);
    });
  }
  
  // Compartir imagen sinastría
  const synShareImgBtn = document.getElementById('synShareImgBtn');
  if (synShareImgBtn) {
    synShareImgBtn.addEventListener('click', async () => {
      const clone = document.createElement('div');
      let iaHtml = '';
      const iaContent = document.getElementById('synastryIAResult')?.innerHTML;
      if (iaContent && iaContent.includes('ia-interp')) {
        iaHtml = `<h3>🤖 IA</h3>${iaContent}`;
      }
      clone.innerHTML = `<h3>Sinastría: ${n1} y ${n2}</h3><p>${mensajeGlobal}</p>${iaHtml}`;
      await shareAsImage(clone, 'Sinastría');
    });
  }
  
  const synShareTextBtn = document.getElementById('synShareTextBtn');
  if (synShareTextBtn) {
    synShareTextBtn.addEventListener('click', async () => {
      await shareContent('synastryResult', 'Sinastría');
    });
  }
  
  const synSaveNoteBtn = document.getElementById('synSaveNoteBtn');
  if (synSaveNoteBtn) {
    synSaveNoteBtn.addEventListener('click', () => {
      saveNote(`Sinastría: ${n1} y ${n2} - ${mensajeGlobal}`);
      toast('Nota guardada');
    });
  }
}

// Números espejo simplificado (ya está en tu versión, pero lo incluyo por completitud)
const mirrorMeanings = {
  '11:11': '🌀 Despertar espiritual. Tus pensamientos se manifiestan rápidamente.',
  '22:22': '🏛️ Maestro constructor. Tienes el poder de crear tu realidad.',
  '00:00': '🌌 Conexión con el infinito.',
  '111': '✨ Puerta de manifestación.',
  '222': '🤝 Confía en el proceso.',
  '333': '🌿 Maestros ascendentes te rodean.',
  '444': '🛡️ Ángeles protectores contigo.',
  '555': '🔄 Gran cambio transformador.',
  '666': '⚖️ Reevalúa tus prioridades.',
  '777': '🍀 Suerte extraordinaria.',
  '888': '💰 Abundancia infinita.',
  '999': '🌅 Cierre de ciclo grande.',
};

function detectMirrorPattern(number) {
  const numStr = number.toString().replace(/[^0-9]/g, '');
  if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(number)) {
    if (mirrorMeanings[number]) return { type: 'hora_espejo', meaning: mirrorMeanings[number] };
    else return { type: 'hora_normal', meaning: 'Hora sin significado especial.' };
  }
  if (/^(\d)\1{2,3}$/.test(numStr)) {
    return { type: 'repetido', meaning: mirrorMeanings[numStr] || `${numStr}: Energía de manifestación.` };
  }
  return { type: 'comun', meaning: `${numStr}: Número sin patrón especial.` };
}

export async function interpretMirrorNumber() {
  const input = document.getElementById('mirrorNumber').value.trim();
  if (!input) { toast('Escribe un número, hora o patrón'); return; }
  const result = detectMirrorPattern(input);
  const html = `
    <div class="num-details">
      <h3>🔮 ${sanitizeHTML(input)}</h3>
      <p>${sanitizeHTML(result.meaning)}</p>
      <div class="action-buttons">
        <button id="mirrorIaBtn" class="btn-mystic btn-ia">🤖 IA</button>
        <button id="mirrorPdfBtn" class="btn-mystic btn-pdf">📄 PDF</button>
        <button id="mirrorShareImgBtn" class="btn-mystic btn-share-img">📸 Compartir Imagen</button>
        <button id="mirrorShareBtn" class="btn-mystic btn-share-social">📱 Compartir Texto</button>
        <button id="mirrorSaveNoteBtn" class="btn-mystic btn-save">💾 Guardar Nota</button>
      </div>
      <div id="mirrorIAResult"></div>
    </div>
  `;
  document.getElementById('mirrorResult').innerHTML = html;
  addToHistory('mirror', { number: input, meaning: result.meaning }, `Número espejo: ${input}`);
  
  document.getElementById('mirrorIaBtn')?.addEventListener('click', async () => {
    const resultDiv = document.getElementById('mirrorIAResult');
    resultDiv.innerHTML = '<div class="premium-loader"><div class="orb"></div><span>Analizando...</span></div>';
    try {
      let answer = await queueIARequest(`Interpreta el número espejo "${input}". Da un mensaje espiritual personalizado.`);
      answer = answer.replace(/\*\*|__/g, '');
      resultDiv.innerHTML = `<div class="ia-interp"><p>${answer.replace(/\n/g, '<br>')}</p></div>`;
      speakText(answer);
    } catch(e) { resultDiv.innerHTML = '<div class="ia-interp">Error al conectar con IA.</div>'; }
  });
  
  document.getElementById('mirrorPdfBtn')?.addEventListener('click', async () => {
    const userName = localStorage.getItem('oraculo_user') || 'Consultante';
    const dateStr = new Date().toLocaleString();
    const tempDiv = document.createElement('div');
    let iaHtml = '';
    const iaContent = document.getElementById('mirrorIAResult')?.innerHTML;
    if (iaContent && iaContent.includes('ia-interp')) {
      iaHtml = `<h3>🤖 Interpretación de la IA</h3>${iaContent}`;
    }
    tempDiv.innerHTML = `
      <h2>🕒 Número Espejo</h2>
      <p><strong>Usuario:</strong> ${userName}</p>
      <p><strong>Fecha:</strong> ${dateStr}</p>
      <h3>${input}</h3>
      <p>${result.meaning}</p>
      ${iaHtml}
    `;
    tempDiv.style.padding = '20px';
    tempDiv.style.backgroundColor = '#fff';
    document.body.appendChild(tempDiv);
    await generatePDFFromElement(tempDiv, `espejo_${input}.pdf`);
    document.body.removeChild(tempDiv);
  });
  
  document.getElementById('mirrorShareImgBtn')?.addEventListener('click', async () => {
    const clone = document.createElement('div');
    let iaHtml = '';
    const iaContent = document.getElementById('mirrorIAResult')?.innerHTML;
    if (iaContent && iaContent.includes('ia-interp')) {
      iaHtml = `<h3>🤖 IA</h3>${iaContent}`;
    }
    clone.innerHTML = `<h3>${input}</h3><p>${result.meaning}</p>${iaHtml}`;
    await shareAsImage(clone, `Número espejo: ${input}`);
  });
  
  document.getElementById('mirrorShareBtn')?.addEventListener('click', async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Número espejo', text: `${input}: ${result.meaning}` }); toast('Compartido'); } catch(e) { toast('Cancelado'); }
    } else {
      await navigator.clipboard.writeText(`${input}: ${result.meaning}`);
      toast('Copiado');
    }
  });
  
  document.getElementById('mirrorSaveNoteBtn')?.addEventListener('click', () => {
    saveNote(`${input}: ${result.meaning}`);
    toast('Nota guardada');
  });
}

export async function generateRandomMirrorNumber() {
  const horas = ['11:11','22:22','00:00','12:12','13:13','14:14','15:15','16:16','17:17','18:18','19:19','20:20','21:21','23:23'];
  const random = horas[Math.floor(Math.random() * horas.length)];
  document.getElementById('mirrorNumber').value = random;
  await interpretMirrorNumber();
}


// Fase 5 visual
function renderNumeroCard(valor, etiqueta){
 return `<div class="numero-card"><div class="numero-valor">${valor}</div><div class="numero-etiqueta">${etiqueta}</div></div>`;
}
