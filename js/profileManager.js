
// V7.4 Mystic Profile
import { getProgressSummary } from './progressManager.js';
import { getMysticBadges } from './badgeManager.js';

export function getMysticProfile(){
  return {
    progress: getProgressSummary(),
    badges: getMysticBadges()
  };
}
