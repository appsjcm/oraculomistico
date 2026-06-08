
// V12.8 State Manager
import { getUnifiedData } from './unifiedDataLayer.js';

export function getApplicationState(){
  return {
    data: getUnifiedData(),
    stateReady: true
  };
}
