
// V15.6 Favorites Engine
import { createJournalEntry } from './mysticJournalEngine.js';

export function addFavorite(item){
  return {
    item,
    journal: createJournalEntry(),
    favorite: true
  };
}
