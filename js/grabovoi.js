// grabovoi.js - Códigos Grabovoi con modal: IA, PDF, imagen, compartir, guardar
import { store, saveNote } from './store.js';
import { toast, speakText, openModal, sanitizeHTML } from './utils.js';
import { queueIARequest } from './ia.js';
import { generatePDFFromElement, shareAsImage, shareContent } from './pdf.js';

let grabovoiLoading = false;

export async function loadGrabovoiDB() {
  if (store.GRABOVOI_FULL_DB.length > 0) return;
  if (grabovoiLoading) return;
  grabovoiLoading = true;
  try {
    const response = await fetch('grabovoi_db.json');
    if (!response.ok) throw new Error('HTTP error');
    const json = await response.json();
    store.GRABOVOI_FULL_DB = [];
    function addItems(items, categoria) {
      if (!items || !Array.isArray(items)) return;
      items.forEach(item => {
        if (item.codigo && typeof item.codigo === 'string') {
          store.GRABOVOI_FULL_DB.push({
            nombre: item.nombre, codigo: item.codigo, descripcion: item.descripcion || '',
            aplicacion: item.aplicacion || (item.uso ? item.uso : ''), categoria: categoria
          });
        }
        if (item.codigos && Array.isArray(item.codigos)) {
          item.codigos.forEach(cod => {
            store.GRABOVOI_FULL_DB.push({
              nombre: item.nombre + ' (paso)', codigo: cod,
              descripcion: item.descripcion || item.texto_completo || '',
              aplicacion: item.aplicacion || '', categoria: categoria
            });
          });
        }
        if (item.texto_completo && !item.codigo && (!item.codigos || item.codigos.length === 0)) {
          store.GRABOVOI_FULL_DB.push({
            nombre: item.nombre, codigo: '(procedimiento)', descripcion: item.texto_completo,
            aplicacion: '', categoria: categoria
          });
        }
      });
    }
    addItems(json.enfermedades, 'enfermedades');
    addItems(json.situaciones_personales, 'situaciones_personales');
    addItems(json.protocolos, 'protocolos');
    addItems(json.pilotajes_especificos, 'pilotajes_especificos');
    addItems(json.metodos_concentracion, 'metodos_concentracion');
    addItems(json.codigos_adicionales, 'codigos_adicionales');
    if (json.significado_numeros) addItems(json.significado_numeros, 'significado_numeros');
    console.log(`✅ Grabovoi cargada: ${store.GRABOVOI_FULL_DB.length} códigos`);
    renderFullGrabovoiGrid();
  } catch(e) {
    console.error('Error cargando DB, usando emergencia', e);
    store.GRABOVOI_FULL_DB = [
      { nombre: "Salud perfecta", codigo: "1814321", descripcion: "Restablece la salud integral.", aplicacion: "Repite 3 veces al día.", categoria: "salud" },
      { nombre: "Vida eterna", codigo: "1489999", descripcion: "Para la inmortalidad física y espiritual.", aplicacion: "Escríbelo 77 veces.", categoria: "salud" },
      { nombre: "Auto curación", codigo: "721348192", descripcion: "Activa la autocuración.", aplicacion: "Concéntrate mientras pones la mano.", categoria: "salud" }
    ];
    renderFullGrabovoiGrid();
  } finally {
    grabovoiLoading = false;
  }
}

export function renderFullGrabovoiGrid() {
  const container = document.getElementById('grabovoiFullGrid');
  if (!container) return;
  let items = store.GRABOVOI_FULL_DB;
  if (store.currentCategory !== 'all') items = items.filter(item => item.categoria === store.currentCategory);
  const searchTerm = document.getElementById('grabovoiSearch')?.value.toLowerCase().trim() || '';
  if (searchTerm) items = items.filter(item => item.nombre.toLowerCase().includes(searchTerm) || item.codigo.includes(searchTerm));
  if (store.grabovoiSort === 'nombre') items.sort((a, b) => a.nombre.localeCompare(b.nombre));
  else if (store.grabovoiSort === 'codigo') items.sort((a, b) => a.codigo.localeCompare(b.codigo));
  store.currentGrabovoiFiltered = items;
  if (items.length === 0) { container.innerHTML = '<p>No se encontraron códigos.</p>'; return; }
  const start = store.grabovoiPage * 50;
  const end = start + 50;
  const pageItems = items.slice(start, end);
  let html = pageItems.map(item => `
    <div class="grabovoi-card" data-code="${sanitizeHTML(item.codigo)}" data-nombre="${sanitizeHTML(item.nombre)}" data-desc="${sanitizeHTML(item.descripcion)}" data-aplicacion="${sanitizeHTML(item.aplicacion)}" data-categoria="${sanitizeHTML(item.categoria)}">
      <div class="grab-title">${sanitizeHTML(item.nombre)}</div>
      <div class="grab-code">${sanitizeHTML(item.codigo)}</div>
      ${item.categoria ? `<div class="grab-category">${sanitizeHTML(item.categoria.replace('_', ' '))}</div>` : ''}
    </div>
  `).join('');
  if (end < items.length) {
    html += `<div class="load-more-btn-container" style="grid-column:1/-1; text-align:center; margin-top:20px;"><button id="loadMoreGrabovoi" class="btn-mystic">📖 Cargar más (${items.length - end} restantes)</button></div>`;
  }
  container.innerHTML = html;
  attachGrabovoiCardEvents();
  const loadBtn = document.getElementById('loadMoreGrabovoi');
  if (loadBtn) loadBtn.addEventListener('click', () => { store.grabovoiPage++; renderFullGrabovoiGrid(); });
}

function attachGrabovoiCardEvents() {
  document.querySelectorAll('#grabovoiFullGrid .grabovoi-card').forEach(card => {
    card.removeEventListener('click', grabovoiCardHandler);
    card.addEventListener('click', grabovoiCardHandler);
  });
}

async function grabovoiCardHandler(e) {
  const card = e.currentTarget;
  const nombre = card.getAttribute('data-nombre');
  const codigo = card.getAttribute('data-code');
  const desc = card.getAttribute('data-desc');
  const aplicacion = card.getAttribute('data-aplicacion');
  const categoria = card.getAttribute('data-categoria');
  
  const modalContent = `
    <h2>🔢 ${sanitizeHTML(nombre)}</h2>
    <p><strong>Código:</strong> ${sanitizeHTML(codigo)}</p>
    <p><strong>Descripción:</strong> ${sanitizeHTML(desc || 'Sin descripción.')}</p>
    <p><strong>Aplicación:</strong> ${sanitizeHTML(aplicacion || 'Repite en voz alta, escribe 77 veces o visualiza.')}</p>
    <p><small>Categoría: ${sanitizeHTML(categoria || 'general')}</small></p>
    <div id="grabovoiIAResult"></div>
    <div class="action-buttons">
      <button id="modalGrabovoiIaBtn" class="btn-mystic btn-ia">🤖 IA</button>
      <button id="modalGrabovoiPdfBtn" class="btn-mystic btn-pdf">📄 PDF</button>
      <button id="modalGrabovoiShareImgBtn" class="btn-mystic btn-share-img">📸 Compartir Imagen</button>
      <button id="modalGrabovoiShareBtn" class="btn-mystic btn-share-social">📱 Compartir Texto</button>
      <button id="modalGrabovoiSaveNoteBtn" class="btn-mystic btn-save">💾 Guardar Nota</button>
    </div>
  `;
  const modal = openModal(modalContent);
  
  // Botón IA
  const iaBtn = modal.querySelector('#modalGrabovoiIaBtn');
  if (iaBtn) {
    iaBtn.addEventListener('click', async () => {
      const prompt = `Código Grabovoi "${codigo}" para "${nombre}". Descripción: ${desc}. Aplicación: ${aplicacion}. Explica cómo usarlo para manifestar resultados, con ejemplo práctico y consejo espiritual. Sin formato.`;
      const btn = iaBtn;
      btn.disabled = true; btn.innerHTML = '<span class="spinner-small"></span> Consultando...';
      const resultDiv = modal.querySelector('#grabovoiIAResult');
      try {
        const answer = await queueIARequest(prompt);
        const cleaned = sanitizeHTML(answer.replace(/\*\*|__|\[|\]|\(|\)|\#|\*|\-|\+|\|/g, '').replace(/[\u{1F600}-\u{1F6FF}]/gu, ''));
        resultDiv.innerHTML = `<div class="ia-interp"><p>${cleaned.replace(/\n/g, '<br>')}</p></div>`;
        speakText(cleaned);
      } catch(e) { resultDiv.innerHTML = `<div class="ia-interp">Error: ${sanitizeHTML(e.message)}</div>`; }
      finally { btn.disabled = false; btn.innerText = '🤖 IA'; }
    });
  }
  
  // Botón PDF
  const pdfBtn = modal.querySelector('#modalGrabovoiPdfBtn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', async () => {
      const userName = localStorage.getItem('oraculo_user') || 'Consultante';
      const dateStr = new Date().toLocaleString();
      let iaHtml = '';
      const iaContent = modal.querySelector('#grabovoiIAResult .ia-interp')?.innerHTML;
      if (iaContent) {
        iaHtml = `<h3>🤖 Interpretación de la IA</h3><div class="ia-interp">${iaContent}</div>`;
      }
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
        <h2>🔢 Código Grabovoi</h2>
        <p><strong>Usuario:</strong> ${userName}</p>
        <p><strong>Fecha:</strong> ${dateStr}</p>
        <p><strong>Nombre:</strong> ${sanitizeHTML(nombre)}</p>
        <p><strong>Código:</strong> ${sanitizeHTML(codigo)}</p>
        <p><strong>Descripción:</strong> ${sanitizeHTML(desc)}</p>
        <p><strong>Aplicación:</strong> ${sanitizeHTML(aplicacion)}</p>
        ${iaHtml}
      `;
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = '#fff';
      document.body.appendChild(tempDiv);
      await generatePDFFromElement(tempDiv, `grabovoi_${nombre.replace(/\s/g, '_')}.pdf`);
      document.body.removeChild(tempDiv);
    });
  }
  
  // Botón Compartir Imagen
  const shareImgBtn = modal.querySelector('#modalGrabovoiShareImgBtn');
  if (shareImgBtn) {
    shareImgBtn.addEventListener('click', async () => {
      let iaHtml = '';
      const iaContent = modal.querySelector('#grabovoiIAResult .ia-interp')?.innerHTML;
      if (iaContent) {
        iaHtml = `<h3>🤖 IA</h3><div class="ia-interp">${iaContent}</div>`;
      }
      const clone = document.createElement('div');
      clone.innerHTML = `<h2>${sanitizeHTML(nombre)}</h2><p><strong>Código:</strong> ${sanitizeHTML(codigo)}</p><p><strong>Descripción:</strong> ${sanitizeHTML(desc)}</p><p><strong>Aplicación:</strong> ${sanitizeHTML(aplicacion)}</p>${iaHtml}`;
      await shareAsImage(clone, `Código Grabovoi: ${nombre}`);
    });
  }
  
  // Botón Compartir Texto
  const shareBtn = modal.querySelector('#modalGrabovoiShareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const text = `${nombre} - Código: ${codigo}\n${desc}\nAplicación: ${aplicacion}`;
      if (navigator.share) {
        try { await navigator.share({ title: 'Código Grabovoi', text }); toast('Compartido'); } catch(e) { toast('Cancelado'); }
      } else {
        await navigator.clipboard.writeText(text);
        toast('Copiado');
      }
    });
  }
  
  // Botón Guardar Nota
  const saveNoteBtn = modal.querySelector('#modalGrabovoiSaveNoteBtn');
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
      saveNote(`${nombre}: ${codigo}\n${desc}\n${aplicacion}`);
      toast('Nota guardada');
      modal.remove();
    });
  }
}

export function searchGrabovoi() { store.grabovoiPage = 0; renderFullGrabovoiGrid(); }
export function sortGrabovoi() { store.grabovoiSort = document.getElementById('grabovoiSortSelect')?.value || 'nombre'; store.grabovoiPage = 0; renderFullGrabovoiGrid(); }
export function filterGrabovoiCategory(e) { store.currentCategory = e.target.value; store.grabovoiPage = 0; renderFullGrabovoiGrid(); }
