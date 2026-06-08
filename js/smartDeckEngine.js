
// V18.4 Smart Deck Engine
import { FULL_TAROT_DECK } from './completeTarotEngine.js';

export function shuffleDeck(){
  const deck = [...FULL_TAROT_DECK];

  for(let i = deck.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

export function drawCards(count = 1){
  const deck = shuffleDeck();
  return deck.slice(0, count);
}
