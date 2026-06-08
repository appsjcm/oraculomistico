
// V13.9 Settings Hub
import { getConfigurationCenter } from './configurationCenter.js';

export function getSettingsHub(){
  return {
    configuration: getConfigurationCenter(),
    settingsReady: true
  };
}
