
// V12.1 Real Screens
import { buildRealUI } from './realUIFoundation.js';

export function getRealScreens(){
  return {
    ui: buildRealUI(),
    screens: ['home','profile','favorites','diary']
  };
}
