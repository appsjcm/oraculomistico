
// V6.7 Dashboard Favorites
import { getFavorites } from './favoritesManager.js';

export function getDashboardFavorites(){
  return getFavorites().slice(0,5);
}
