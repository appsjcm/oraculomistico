
// V9.3 Experience Router
import { buildUnifiedExperience } from './unifiedExperience.js';

export function getAppExperience(){
  return {
    experience: buildUnifiedExperience(),
    routes: ['home','oracle','profile','favorites']
  };
}
