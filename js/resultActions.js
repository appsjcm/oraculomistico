
// V6.8 Result Actions
import { saveFavorite } from './favoritesManager.js';

export function addResultToFavorites(result){
  saveFavorite(result);
  return true;
}
