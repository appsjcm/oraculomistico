
// V16.1 Dashboard Widgets
import { getMysticDashboard } from './mysticDashboard.js';

export function getDashboardWidgets(){
  return {
    dashboard: getMysticDashboard(),
    widgets: [
      'tarot',
      'runes',
      'dailyOracle',
      'favorites',
      'statistics'
    ],
    widgetsReady: true
  };
}
