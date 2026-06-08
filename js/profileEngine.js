
// V15.7 Profile Engine
import { addFavorite } from './favoritesEngine.js';

export function getUserProfile(){
  return {
    username: 'Mystic User',
    readings: 0,
    favorites: [],
    sampleFavorite: addFavorite('Demo'),
    profileReady: true
  };
}
