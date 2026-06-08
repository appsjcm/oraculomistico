
// V18.2 Three Card Spread
import { drawTarotCard } from './completeTarotEngine.js';

export function createThreeCardSpread(){
  return {
    past: drawTarotCard(),
    present: drawTarotCard(),
    future: drawTarotCard(),
    spreadType: 'past-present-future',
    createdAt: new Date().toISOString()
  };
}
