
// V14.5 Cosmic Core
import { getUniverseManager } from './universeManager.js';

export function getCosmicCore(){
  return {
    universe: getUniverseManager(),
    cosmicCoreReady: true
  };
}
