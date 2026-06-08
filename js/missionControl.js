
// V14.3 Mission Control
import { getOperationsCenter } from './operationsCenter.js';

export function getMissionControl(){
  return {
    operations: getOperationsCenter(),
    missionControlReady: true
  };
}
