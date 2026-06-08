
// V17.7 Real Statistics
import { getJournalEntries } from './realJournal.js';
import { getFavorites } from './realFavorites.js';

export function getRealStatistics(){
  const entries = getJournalEntries();
  const favorites = getFavorites();

  return {
    totalReadings: entries.length,
    totalFavorites: favorites.length,
    lastReading: entries[0] || null
  };
}
