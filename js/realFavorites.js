
// V17.1 Real Favorites
import { RealDataSystem } from './realDataSystem.js';

const FAVORITES_KEY = 'oraculo_favorites';

export function getFavorites(){
  return RealDataSystem.load(FAVORITES_KEY, []);
}

export function addFavorite(item){
  const favorites = getFavorites();
  favorites.push(item);
  RealDataSystem.save(FAVORITES_KEY, favorites);
  return favorites;
}

export function removeFavorite(index){
  const favorites = getFavorites();
  favorites.splice(index, 1);
  RealDataSystem.save(FAVORITES_KEY, favorites);
  return favorites;
}
