
// V14.6 Omniverse Engine
import { getCosmicCore } from './cosmicCore.js';

export function getOmniverseEngine(){
  return {
    core: getCosmicCore(),
    omniverseReady: true
  };
}
