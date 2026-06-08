
// V15.4 Daily Oracle Engine
import { drawRune } from './runeEngine.js';

export function getDailyOracle(){
  const messages = [
    'Confía en tu intuición',
    'Hoy es un buen día para crear',
    'Escucha las señales a tu alrededor',
    'La paciencia traerá claridad'
  ];

  return {
    reading: drawRune(),
    message: messages[Math.floor(Math.random() * messages.length)]
  };
}
