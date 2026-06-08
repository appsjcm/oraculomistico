
// V9.0 Home Complete
import { getMysticProfile } from './profileManager.js';
import { getDailyOracle } from './dailyOracle.js';

export function buildHomeComplete(){
  return {
    profile: getMysticProfile(),
    oracle: getDailyOracle()
  };
}
