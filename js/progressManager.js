
// V7.3 Progress Manager
import { getCurrentStreak } from './streakManager.js';
import { getFavorites } from './favoritesManager.js';

export function getProgressSummary(){
  return {
    streak: getCurrentStreak(),
    favorites: getFavorites().length,
    level: 1
  };
}
