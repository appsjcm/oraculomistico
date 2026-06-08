// speechRecognition.js - Reconocimiento de voz para navegadores compatibles (Android, Chrome PC)
export class SpeechRecognizer {
    constructor() {
        this.recognition = null;
        this.isActive = false;
        this.init();
    }

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return null;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-ES';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        this.recognition.continuous = false;

        this.recognition.onstart = () => {
            console.log('[SpeechRecognizer] Iniciado');
            this.isActive = true;
        };

        this.recognition.onend = () => {
            console.log('[SpeechRecognizer] Finalizado');
            this.isActive = false;
            if (this.onEndCallback) this.onEndCallback();
        };

        this.recognition.onerror = (event) => {
            console.error('[SpeechRecognizer] Error:', event.error);
            this.isActive = false;
            if (this.onErrorCallback) this.onErrorCallback(event.error);
        };

        return this.recognition;
    }

    start(onResult, onEnd, onError) {
        if (!this.recognition) {
            if (onError) onError('no-soporte');
            return;
        }
        this.onResultCallback = onResult;
        this.onEndCallback = onEnd;
        this.onErrorCallback = onError;

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (this.onResultCallback) this.onResultCallback(transcript);
            this.stop(); // Detener automáticamente tras obtener resultado
        };

        try {
            this.recognition.start();
        } catch (e) {
            console.error('[SpeechRecognizer] Error al iniciar:', e);
            if (this.onErrorCallback) this.onErrorCallback('start-failed');
        }
    }

    stop() {
        if (this.recognition && this.isActive) {
            try {
                this.recognition.stop();
            } catch (e) {}
        }
        this.isActive = false;
    }

    abort() {
        if (this.recognition && this.isActive) {
            try {
                this.recognition.abort();
            } catch (e) {}
        }
        this.isActive = false;
    }
}
