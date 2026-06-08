
// V13.7 Feature Manager
import { getFeatureMarketplace } from './featureMarketplace.js';

export function getFeatureManager(){
  return {
    marketplace: getFeatureMarketplace(),
    featuresManaged: true
  };
}
