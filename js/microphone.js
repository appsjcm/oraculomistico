// microfono.js - Dictado por voz sin OpenAI. Usa Web Speech API y fallback Moonshine si está disponible.
import { VoiceRecorder } from './voiceRecorder.js';
import { transcribeAudio } from './moonshine.js';

let activeRecorder = null;

function supportsWebSpeech() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export async function startMicrophone(button, inputElement, onUpdateUI, onError) {
  if (activeRecorder) {
    activeRecorder.stop();
    activeRecorder = null;
  }

  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    onError?.('Permiso de micrófono denegado');
    onUpdateUI?.(false);
    return;
  }

  const useWebSpeech = supportsWebSpeech();

  // --- Web Speech nativa (Chrome/Android/PC y navegadores compatibles) ---
  if (useWebSpeech) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => onUpdateUI?.(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (inputElement) inputElement.value = transcript;
      inputElement.dispatchEvent(new Event('input'));
      onUpdateUI?.(false);
      recognition.stop();
    };
    recognition.onerror = (event) => {
      onError?.('Error en reconocimiento: ' + event.error);
      onUpdateUI?.(false);
    };
    recognition.onend = () => onUpdateUI?.(false);

    recognition.start();
    return;
  }

  // --- Moonshine local/CDN (iOS o navegadores sin Web Speech). No usa OpenAI ni API keys. ---
  onUpdateUI?.(true);
  const recorder = new VoiceRecorder();
  activeRecorder = recorder;

  try {
    const audioBlob = await recorder.start();
    recorder.stop();
    const text = await transcribeAudio(audioBlob);
    if (inputElement) inputElement.value = text;
    inputElement.dispatchEvent(new Event('input'));
  } catch (err) {
    onError?.('No se pudo transcribir el audio en este navegador. Prueba el dictado del teclado o Chrome/Android. Detalle: ' + err.message);
  } finally {
    onUpdateUI?.(false);
    activeRecorder = null;
  }
}

export function stopMicrophone() {
  if (activeRecorder) activeRecorder.stop();
  activeRecorder = null;
}
