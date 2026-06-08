
// V15.8 Statistics Engine
import { getUserProfile } from './profileEngine.js';

export function getStatistics(){
  const profile = getUserProfile();

  return {
    profile,
    totalReadings: profile.readings,
    totalFavorites: profile.favorites.length,
    statisticsReady: true
  };
}
