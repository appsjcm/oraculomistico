
// V12.2 Screen Navigation
import { getRealScreens } from './realScreens.js';

export function getNavigation(){
  return {
    screens: getRealScreens(),
    navigation: ['home','profile','favorites','diary']
  };
}
