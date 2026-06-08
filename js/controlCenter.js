
// V14.0 Control Center
import { getSettingsHub } from './settingsHub.js';

export function getControlCenter(){
  return {
    settings: getSettingsHub(),
    controlCenterReady: true
  };
}
