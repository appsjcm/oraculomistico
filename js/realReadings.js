
// V17.5 Real Readings
import { drawMajorArcana } from './completeTarot.js';
import { drawRune } from './completeRunes.js';

export function createReading(){
  return {
    date: new Date().toISOString(),
    tarot: drawMajorArcana(),
    rune: drawRune(),
    type: 'tarot+rune'
  };
}
