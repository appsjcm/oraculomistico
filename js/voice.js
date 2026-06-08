// voice.js - Gestión de voces premium
import { store } from './store.js';

let availableVoices = [];
let isSpeaking = false;
let speechQueue = [];

function loadVoices() {
  return new Promise((resolve) => {
    if (window.speechSynthesis.getVoices().length) {
      availableVoices = window.speechSynthesis.getVoices();
      resolve(availableVoices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        availableVoices = window.speechSynthesis.getVoices();
        resolve(availableVoices);
      };
    }
  });
}

export async function getPremiumVoices() {
  await loadVoices();
  const premium = availableVoices.filter(v => 
    v.lang.startsWith('es') && 
    (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Samantha') || v.name.includes('Mónica') || v.name.includes('Paulina') || v.name.includes('Jorge'))
  );
  return premium.length ? premium : availableVoices.filter(v => v.lang.startsWith('es'));
}

export async function getAllSpanishVoices() {
  await loadVoices();
  return availableVoices.filter(v => v.lang.startsWith('es'));
}

function processSpeechQueue() {
  if (isSpeaking || speechQueue.length === 0) return;
  isSpeaking = true;
  const text = speechQueue.shift();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = store.voiceSpeed;
  if (store.selectedVoiceName && store.selectedVoiceName !== 'default') {
    const voice = availableVoices.find(v => v.name === store.selectedVoiceName);
    if (voice) utterance.voice = voice;
  }
  utterance.onend = () => {
    isSpeaking = false;
    processSpeechQueue();
  };
  utterance.onerror = () => {
    isSpeaking = false;
    processSpeechQueue();
  };
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function speakText(text) {
  if (!window.speechSynthesis) return;
  const cleanText = text.replace(/<[^>]*>/g, '');
  speechQueue.push(cleanText);
  processSpeechQueue();
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
  speechQueue = [];
  isSpeaking = false;
}

loadVoices();
