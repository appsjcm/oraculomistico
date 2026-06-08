
// V16.2 Quick Actions
import { getDashboardWidgets } from './dashboardWidgets.js';

export function getQuickActions(){
  return {
    dashboard: getDashboardWidgets(),
    actions: [
      'drawTarot',
      'drawRune',
      'dailyOracle',
      'openJournal'
    ],
    quickActionsReady: true
  };
}
