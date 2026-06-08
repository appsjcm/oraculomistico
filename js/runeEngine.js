
// V15.3 Rune Engine
import { drawTarotCard } from './tarotEngine.js';

export function drawRune(){
  const runes = ['Fehu','Uruz','Ansuz','Raidho'];
  return {
    tarot: drawTarotCard(),
    rune: runes[Math.floor(Math.random() * runes.length)]
  };
}
