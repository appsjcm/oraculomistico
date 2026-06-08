
// V13.5 Extension Framework
import { getPluginSystem } from './pluginSystem.js';

export function getExtensionFramework(){
  return {
    plugins: getPluginSystem(),
    extensionsEnabled: true
  };
}
