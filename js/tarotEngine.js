
// V15.2 Tarot Engine
import { getRealFeaturesFoundation } from './realFeaturesFoundation.js';

export function drawTarotCard(){
  const cards = ['El Mago','La Estrella','El Sol','La Luna'];
  return {
    foundation: getRealFeaturesFoundation(),
    card: cards[Math.floor(Math.random() * cards.length)]
  };
}
