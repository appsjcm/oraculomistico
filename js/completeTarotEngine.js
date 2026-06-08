
// V18.1 Complete Tarot Engine

import { MAJOR_ARCANA } from './completeTarot.js';
import { WANDS, CUPS } from './minorArcanaPack1.js';
import { SWORDS, PENTACLES } from './minorArcanaPack2.js';

export const FULL_TAROT_DECK = [
  ...MAJOR_ARCANA,
  ...WANDS,
  ...CUPS,
  ...SWORDS,
  ...PENTACLES
];

export function drawTarotCard(){
  return FULL_TAROT_DECK[
    Math.floor(Math.random() * FULL_TAROT_DECK.length)
  ];
}

export function getFullDeckInfo(){
  return {
    totalCards: FULL_TAROT_DECK.length
  };
}
