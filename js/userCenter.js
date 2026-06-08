
// V7.5 User Center
import { getMysticProfile } from './profileManager.js';
import { getFavorites } from './favoritesManager.js';

export function getUserCenterData(){
  return {
    profile: getMysticProfile(),
    favoritesCount: getFavorites().length
  };
}
