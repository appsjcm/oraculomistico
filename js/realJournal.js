
// V17.2 Real Journal
import { RealDataSystem } from './realDataSystem.js';

const JOURNAL_KEY = 'oraculo_journal';

export function getJournalEntries(){
  return RealDataSystem.load(JOURNAL_KEY, []);
}

export function saveJournalEntry(entry){
  const entries = getJournalEntries();
  entries.unshift({
    ...entry,
    savedAt: new Date().toISOString()
  });

  RealDataSystem.save(JOURNAL_KEY, entries);
  return entries;
}
