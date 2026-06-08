
// V18.3 Celtic Cross Spread
import { drawTarotCard } from './completeTarotEngine.js';

export function createCelticCrossSpread(){
  return {
    card1: drawTarotCard(),
    card2: drawTarotCard(),
    card3: drawTarotCard(),
    card4: drawTarotCard(),
    card5: drawTarotCard(),
    card6: drawTarotCard(),
    card7: drawTarotCard(),
    card8: drawTarotCard(),
    card9: drawTarotCard(),
    card10: drawTarotCard(),
    spreadType: 'celtic-cross',
    createdAt: new Date().toISOString()
  };
}
