// ia.js - IA con reintentos, caché prolongada y fallback a descripciones locales
import { toast, speakText, sanitizeHTML } from './utils.js';
import { store } from './store.js';

const IACache = {
  getKey(prompt) {
    return `ia_cache_${btoa(prompt.slice(0, 500))}`;
  },
  get(prompt) {
    const key = this.getKey(prompt);
    const cached = localStorage.getItem(key);
    if (cached) {
      const { timestamp, response } = JSON.parse(cached);
      if (Date.now() - timestamp < 86400000) return response;
      localStorage.removeItem(key);
    }
    return null;
  },
  set(prompt, response) {
    const key = this.getKey(prompt);
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), response }));
  }
};

let activeAbortController = null;

export function abortCurrentIA() {
  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
    toast('Generación cancelada');
  }
}

export async function waitForPuter(maxAttempts = 3, delay = 1000) {
  if (window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
    return true;
  }
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise(r => setTimeout(r, delay));
    if (window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
      return true;
    }
    delay *= 1.5;
  }
  return false;
}

export async function queueIARequest(prompt, timeoutMs = 45000) {
  const cached = IACache.get(prompt);
  if (cached) return cached;

  const puterOk = await waitForPuter(5, 800);
  if (!puterOk || !window.puter?.ai?.chat) {
    throw new Error('Puter no disponible tras varios intentos');
  }

  if (activeAbortController) activeAbortController.abort();
  const controller = new AbortController();
  activeAbortController = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const res = await puter.ai.chat(prompt, { model: 'gpt-4o-mini', signal: controller.signal });
    clearTimeout(timeoutId);
    const answer = typeof res === 'string' ? res : res.message?.content;
    if (!answer) throw new Error('Respuesta vacía');
    IACache.set(prompt, answer);
    return answer;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') throw new Error('Tiempo de espera agotado');
    throw e;
  } finally {
    if (activeAbortController === controller) activeAbortController = null;
  }
}

function getPersonalityPrompt(basePrompt) {
  const personality = document.getElementById('personalitySelect')?.value || 'sabio';
  const personas = {
    sabio: 'Eres un sabio consejero espiritual, hablas con serenidad y profundidad.',
    mistico: 'Eres un místico poético, hablas con metáforas y lenguaje enigmático.',
    bromista: 'Eres un oráculo bromista, con humor y sorpresas.',
    romantico: 'Eres un oráculo romántico, cálido y amoroso.'
  };
  return `${personas[personality]}\n\n${basePrompt}`;
}

function getLocalInterpretation(type) {
  const state = store.lastState;
  if (type === 'tarot' && state.tarot) {
    return state.tarot.rev ? state.tarot.card.rv : state.tarot.card.up;
  }
  if (type === 'runa' && state.runa) {
    return state.runa.rev && state.runa.r.rv ? state.runa.r.rv : state.runa.r.up;
  }
  if (type === 'daily' && state.daily) {
    return `✨ Carta: ${state.daily.rev ? state.daily.card.rv : state.daily.card.up}\n\nᚱ Runa: ${state.daily.rrev && state.daily.runa.rv ? state.daily.runa.rv : state.daily.runa.up}`;
  }
  if (type === 'dream' && state.dream) {
    return "El sueño es un mensaje de tu subconsciente. Reflexiona sobre los símbolos que aparecen. Puedes buscar su significado en nuestro diccionario onírico.";
  }
  if (type === 'luna' && state.luna) {
    return `Fase lunar: ${state.luna.phase.name}\nSignificado: ${state.luna.phase.meaning}\nRitual sugerido: ${state.luna.phase.ritual}`;
  }
  return "Consulta la descripción de la carta o runa en la sección correspondiente para obtener su significado tradicional.";
}

export async function getIA(type) {
  let container = document.getElementById(`${type}IAResult`);
  if (!container) container = document.getElementById(`${type}Result`)?.querySelector('.ia-interp');
  if (!container) {
    console.warn(`No se encontró contenedor para IA tipo ${type}`);
    return;
  }

  container.innerHTML = '<div class="premium-loader"><div class="orb"></div><div class="pulse-ring"></div><span>El oráculo teje su respuesta...</span></div>';

  let prompt = '';
  const state = store.lastState;

  if (type === 'daily' && state.daily) {
    prompt = `Hoy la carta del tarot es ${state.daily.card.name} (${state.daily.rev ? 'invertida' : 'derecha'}) y la runa ${state.daily.runa.name} (${state.daily.rrev ? 'invertida' : 'derecha'}). Da una interpretación profunda de 400 palabras para el día de hoy. Incluye consejos prácticos para amor, trabajo, salud y espiritualidad. IMPORTANTE: No uses negritas, cursivas, encabezados, listas ni emoticonos. Responde en texto plano.`;
  } else if (type === 'tarot' && state.tarot) {
    prompt = `Interpreta la carta ${state.tarot.card.name} (${state.tarot.rev ? 'invertida' : 'derecha'}) en respuesta a: "${state.tarot.q}". Lectura detallada de 450 palabras. Incluye consejos prácticos. Sin formato, texto plano.`;
  } else if (type === 'runa' && state.runa) {
    prompt = `Interpreta la runa ${state.runa.r.name} (${state.runa.rev ? 'invertida' : 'derecha'}) para: "${state.runa.q}". Mensaje de 400 palabras con consejos prácticos. Texto plano.`;
  } else if (type === 'tirada' && state.tirada) {
    if (state.tirada.type === 'chakras') {
      prompt = `Tirada de 7 chakras: ${state.tirada.drawn.map((d,i)=>`${d.c.name} (${d.rev?'inv':'der'}) en chakra ${d.pos}`).join(', ')}. Interpretación incisiva de 450 palabras con consejos prácticos. Texto plano.`;
    } else if (state.tirada.cfg) {
      prompt = `Tirada ${state.tirada.cfg.name}: ${state.tirada.drawn.map(d=>`${d.c.name} (${d.rev?'inv':'der'}) en ${d.pos}`).join(', ')}. Pregunta: "${state.tirada.q}". Lectura de 450 palabras con consejos prácticos. Sin formato.`;
    } else {
      prompt = `Runas: ${state.tirada.runes.map(r=>`${r.r.name} (${r.rev?'inv':'der'})`).join(', ')}. Pregunta: "${state.tirada.q}". 400 palabras con consejos prácticos. Texto plano.`;
    }
  } else if (type === 'dream' && state.dream) {
    prompt = `Sueño: "${state.dream.txt}". Interpretación junguiana extensa de 400 palabras con consejos para integrar el mensaje onírico. Sin símbolos, texto plano.`;
  } else if (type === 'luna' && state.luna) {
    prompt = `Fase lunar: ${state.luna.phase.name}. Significado: ${state.luna.phase.meaning}. Interpretación espiritual de 350 palabras con ritual sugerido. Texto plano.`;
  } else if (type === 'numerologia' && state.num) {
    prompt = `Número de vida ${state.num.vida}, expresión ${state.num.expresion}, alma ${state.num.alma}. Análisis profundo de 450 palabras con consejos de desarrollo personal. Sin formato.`;
  } else if (type === 'synastry' && state.syn) {
    prompt = `Compatibilidad entre ${state.syn.n1} (vida ${state.syn.lp1}, alma ${state.syn.alma1}) y ${state.syn.n2} (vida ${state.syn.lp2}, alma ${state.syn.alma2}). Análisis de 400 palabras con consejos para mejorar la relación. Texto plano.`;
  } else {
    container.innerHTML = '<p>Realiza una consulta primero.</p>';
    return;
  }
  prompt = getPersonalityPrompt(prompt) + " IMPORTANTE: No uses negritas, cursivas, encabezados, listas ni emoticonos. Responde en texto plano, con párrafos separados por saltos de línea.";

  try {
    let answer = await queueIARequest(prompt);
    answer = sanitizeHTML(answer.replace(/\*\*|__|\[|\]|\(|\)|\#|\*|\-|\+|\|/g, '').replace(/[\u{1F600}-\u{1F6FF}]/gu, ''));
    container.innerHTML = `<div class="ia-interp"><p>${answer.replace(/\n/g, '<br>')}</p></div>`;
    speakText(answer);
  } catch (error) {
    console.warn('Error en IA, usando fallback local:', error);
    const fallbackText = getLocalInterpretation(type);
    container.innerHTML = `<div class="ia-interp"><p>✨ ${sanitizeHTML(fallbackText.replace(/\n/g, '<br>'))}</p><p style="font-size:0.8rem; margin-top:10px;">⚠️ Servicio de IA temporalmente no disponible. Te mostramos la interpretación tradicional.</p></div>`;
    speakText(fallbackText);
    toast('IA no disponible, usando interpretación local');
  }
}