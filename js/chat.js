// chat.js - Chat con IA, contexto y voz (con micrófono corregido)
import { toast } from './utils.js';
import { speakText, stopSpeaking } from './voice.js';
import { queueIARequest, waitForPuter } from './ia.js';
import { startMicrophone, stopMicrophone } from './microphone.js';

let conversationHistory = [];
const MAX_HISTORY = 10;

export function initChat() {
  const sendBtn = document.getElementById('sendChatBtn');
  const chatInput = document.getElementById('chatInput');
  const chatHistory = document.getElementById('chatHistory');
  const micBtn = document.getElementById('chatMicBtn');
  const stopVoiceBtn = document.getElementById('stopVoiceBtn');

  async function sendMessage() {
    const msg = chatInput.value.trim();
    if (!msg) return;
    addMessageToChat('user', msg);
    conversationHistory.push({ role: 'user', content: msg });
    if (conversationHistory.length > MAX_HISTORY) conversationHistory.shift();

    if (msg.toLowerCase() === '/clear') {
      conversationHistory = [];
      addMessageToChat('bot', '🧹 Historial de conversación borrado. ¿En qué puedo ayudarte?');
      chatInput.value = '';
      return;
    }

    const puterAvailable = await waitForPuter(3, 1000);
    if (!puterAvailable || !window.puter?.ai?.chat) {
      addMessageToChat('bot', '🔮 El oráculo no puede conectar con su fuente de sabiduría ahora. Por favor, inténtalo más tarde.');
      return;
    }

    const personality = document.getElementById('personalitySelect')?.value || 'sabio';
    const personas = {
      sabio: 'Eres un sabio consejero espiritual, hablas con serenidad y profundidad.',
      mistico: 'Eres un místico poético, hablas con metáforas y lenguaje enigmático.',
      bromista: 'Eres un oráculo bromista, con humor y sorpresas.',
      romantico: 'Eres un oráculo romántico, cálido y amoroso.'
    };
    
    let historyText = '';
    for (let turn of conversationHistory.slice(-MAX_HISTORY)) {
      historyText += `${turn.role === 'user' ? 'Usuario' : 'Oráculo'}: ${turn.content}\n`;
    }
    
    const systemPrompt = `${personas[personality]} El usuario puede pedirte que tires cartas, consultes runas o hagas numerología; simula que lo haces y da una respuesta coherente. No uses negritas, listas ni emoticonos. Responde en texto plano.`;
    const fullPrompt = `${systemPrompt}\n\nHistorial:\n${historyText}\nOráculo:`;
    
    try {
      let answer = await queueIARequest(fullPrompt);
      answer = answer.replace(/\*\*|__|\[|\]|\(|\)|\#|\*|\-|\+|\|/g, '').replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
      addMessageToChat('bot', answer);
      speakText(answer);
      conversationHistory.push({ role: 'assistant', content: answer });
      if (conversationHistory.length > MAX_HISTORY) conversationHistory.shift();
    } catch(e) {
      addMessageToChat('bot', `Error: ${e.message}`);
    }
    chatInput.value = '';
  }

  function addMessageToChat(role, text) {
    const chatHistoryDiv = document.getElementById('chatHistory');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${role}`;
    msgDiv.textContent = text;
    chatHistoryDiv.appendChild(msgDiv);
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
  }

  sendBtn?.addEventListener('click', sendMessage);
  chatInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
  
  // Micrófono del chat corregido
  micBtn?.addEventListener('click', async () => {
    const originalHTML = micBtn.innerHTML;
    const updateUI = (isListening) => {
      if (isListening) {
        micBtn.classList.add('listening');
        micBtn.innerHTML = '🎤 Escuchando...';
      } else {
        micBtn.classList.remove('listening');
        micBtn.innerHTML = originalHTML;
      }
    };
    const onError = (msg) => {
      updateUI(false);
      toast(msg);
    };
    await startMicrophone(micBtn, chatInput, updateUI, onError);
  });
  
  stopVoiceBtn?.addEventListener('click', () => stopSpeaking());
}

export function initSuggestionButtons() {
  document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const question = btn.getAttribute('data-question');
      if (question) {
        document.getElementById('chatInput').value = question;
        document.getElementById('sendChatBtn').click();
      }
    });
  });
}
