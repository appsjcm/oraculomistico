
// V13.6 Feature Marketplace
import { getExtensionFramework } from './extensionFramework.js';

export function getFeatureMarketplace(){
  return {
    framework: getExtensionFramework(),
    marketplaceEnabled: true
  };
}
