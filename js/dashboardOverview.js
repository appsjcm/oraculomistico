
// V6.9 Dashboard Overview
import { getDashboardFavorites } from './dashboardFavorites.js';

export function getOverviewData(){
  return {
    favorites: getDashboardFavorites()
  };
}
