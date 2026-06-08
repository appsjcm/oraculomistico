// js/moonshine.js - Modelo ONNX Moonshine Base (26MB)
import { pipeline } from '@huggingface/transformers';

let transcriber = null;

export async function initMoonshine() {
  if (transcriber) return transcriber;
  transcriber = await pipeline('automatic-speech-recognition', 'onnx-community/moonshine-base-ONNX');
  return transcriber;
}

export async function transcribeAudio(audioBlob) {
  if (!transcriber) await initMoonshine();
  const audioURL = URL.createObjectURL(audioBlob);
  const result = await transcriber(audioURL);
  URL.revokeObjectURL(audioURL);
  return result.text;
}