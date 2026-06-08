
// V8.2 Home Real
import { getDailyOracle } from './dailyOracle.js';
import { getDashboardFavorites } from './dashboardFavorites.js';

export function buildHomeReal(){
  return {
    oracle: getDailyOracle(),
    favorites: getDashboardFavorites()
  };
}
