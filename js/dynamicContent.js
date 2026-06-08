
// V12.4 Dynamic Content
import { getInteractiveScreens } from './interactiveScreens.js';

export function getDynamicContent(){
  return {
    screens: getInteractiveScreens(),
    contentLoaded: true
  };
}
