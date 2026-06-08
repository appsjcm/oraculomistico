
// V14.1 Command Center
import { getControlCenter } from './controlCenter.js';

export function getCommandCenter(){
  return {
    control: getControlCenter(),
    commandCenterReady: true
  };
}
