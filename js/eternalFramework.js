
// V14.7 Eternal Framework
import { getOmniverseEngine } from './omniverseEngine.js';

export function getEternalFramework(){
  return {
    omniverse: getOmniverseEngine(),
    eternalFrameworkReady: true
  };
}
