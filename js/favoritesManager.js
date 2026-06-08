
// V6.6 Favorites Manager
export function saveFavorite(item){
  const data = JSON.parse(localStorage.getItem('mysticFavorites') || '[]');
  data.unshift(item);
  localStorage.setItem('mysticFavorites', JSON.stringify(data.slice(0,100)));
}

export function getFavorites(){
  return JSON.parse(localStorage.getItem('mysticFavorites') || '[]');
}
