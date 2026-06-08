
// V18.6 Oracle Insights Engine
import { interpretCard, interpretRune } from './readingInterpretationEngine.js';

export function buildInsight(reading){
  return {
    tarotMeaning: reading.tarot
      ? interpretCard(reading.tarot)
      : null,
    runeMeaning: reading.rune
      ? interpretRune(reading.rune)
      : null,
    generatedAt: new Date().toISOString()
  };
}
