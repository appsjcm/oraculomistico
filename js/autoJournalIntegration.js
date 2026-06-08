
// V17.6 Auto Journal Integration
import { createReading } from './realReadings.js';
import { saveJournalEntry } from './realJournal.js';

export function createAndSaveReading(){
  const reading = createReading();
  saveJournalEntry(reading);
  return reading;
}
