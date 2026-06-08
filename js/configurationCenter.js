
// V13.8 Configuration Center
import { getFeatureManager } from './featureManager.js';

export function getConfigurationCenter(){
  return {
    features: getFeatureManager(),
    configurationReady: true
  };
}
