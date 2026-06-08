
// V14.4 Universe Manager
import { getMissionControl } from './missionControl.js';

export function getUniverseManager(){
  return {
    mission: getMissionControl(),
    universeReady: true
  };
}
