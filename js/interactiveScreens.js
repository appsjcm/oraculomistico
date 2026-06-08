
// V12.3 Interactive Screens
import { getNavigation } from './screenNavigation.js';

export function getInteractiveScreens(){
  return {
    navigation: getNavigation(),
    interactive: true
  };
}
