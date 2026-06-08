// voskManager.js - Reconocimiento de voz local con Vosk (gratuito, sin API, offline)
// Requiere descargar el modelo una sola vez (~42MB). Se almacena en IndexedDB.

import VoskBrowser from 'https://unpkg.com/@lichess-org/vosk-browser@0.3.2/dist/vosk-browser.js';

let recognizer = null;
let isInitializing = false;
let isListening = false;

const MODEL_URL = 'https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip';
const MODEL_VERSION = 'small-es-0.42';

// Almacenar modelo en IndexedDB para evitar redescargas
async function getModelFromCache() {
    const cacheName = 'vosk-models';
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(MODEL_URL);
    if (cachedResponse) {
        const blob = await cachedResponse.blob();
        return new Uint8Array(await blob.arrayBuffer());
    }
    return null;
}

async function cacheModel(data) {
    const cacheName = 'vosk-models';
    const cache = await caches.open(cacheName);
    const blob = new Blob([data], { type: 'application/zip' });
    await cache.put(MODEL_URL, new Response(blob));
}

async function downloadModel(onProgress) {
    const response = await fetch(MODEL_URL);
    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength, 10);
    let loaded = 0;
    const reader = response.body.getReader();
    const chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (onProgress) onProgress(loaded / total);
    }
    const blob = new Blob(chunks);
    const arrayBuffer = await blob.arrayBuffer();
    const modelData = new Uint8Array(arrayBuffer);
    await cacheModel(modelData);
    return modelData;
}

export async function initVosk(onProgress, onError) {
    if (recognizer) return recognizer;
    if (isInitializing) {
        // Esperar a que termine la inicialización
        return new Promise((resolve) => {
            const check = setInterval(() => {
                if (!isInitializing && recognizer) {
                    clearInterval(check);
                    resolve(recognizer);
                }
            }, 100);
        });
    }
    isInitializing = true;
    try {
        let modelData = await getModelFromCache();
        if (!modelData) {
            onProgress && onProgress('Descargando modelo de voz (42MB, solo una vez)...');
            modelData = await downloadModel(onProgress);
            onProgress && onProgress('Modelo descargado, cargando...');
        }
        recognizer = await VoskBrowser.create(modelData.buffer);
        isInitializing = false;
        onProgress && onProgress('Modelo listo');
        return recognizer;
    } catch (e) {
        isInitializing = false;
        onError && onError('Error al cargar Vosk: ' + e.message);
        return null;
    }
}

export async function startVoskMic(onResult, onError, onProgress) {
    if (isListening) {
        stopVoskMic();
        // Pequeña pausa para reiniciar limpio
        await new Promise(r => setTimeout(r, 300));
    }
    const vosk = await initVosk(onProgress, onError);
    if (!vosk) return false;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        source.connect(processor);
        processor.connect(audioContext.destination);

        let audioBuffer = [];
        processor.onaudioprocess = (event) => {
            const inputData = event.inputBuffer.getChannelData(0);
            audioBuffer.push(...inputData);
            if (audioBuffer.length >= 16000) { // 1 segundo aprox
                const float32Array = new Float32Array(audioBuffer);
                const result = vosk.acceptWaveform(float32Array);
                if (result) {
                    const transcript = vosk.getResult().text;
                    if (transcript) onResult(transcript);
                }
                audioBuffer = [];
            }
        };

        return () => {
            processor.disconnect();
            source.disconnect();
            audioContext.close();
            stream.getTracks().forEach(track => track.stop());
            isListening = false;
        };
    } catch (e) {
        onError && onError('Error al acceder al micrófono: ' + e.message);
        return null;
    }
}

export function stopVoskMic() {
    if (isListening && window.voskStopCallback) {
        window.voskStopCallback();
        window.voskStopCallback = null;
    }
}