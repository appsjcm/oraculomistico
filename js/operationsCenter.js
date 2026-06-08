
// V14.2 Operations Center
import { getCommandCenter } from './commandCenter.js';

export function getOperationsCenter(){
  return {
    command: getCommandCenter(),
    operationsReady: true
  };
}
