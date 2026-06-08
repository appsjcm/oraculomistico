
// V16.3 Home Experience
import { getQuickActions } from './quickActions.js';

export function getHomeExperience(){
  return {
    quickActions: getQuickActions(),
    sections: [
      'dashboard',
      'widgets',
      'dailyOracle',
      'favorites'
    ],
    homeReady: true
  };
}
