
// V13.4 Plugin System
import { getDependencyManager } from './dependencyManager.js';

export function getPluginSystem(){
  return {
    dependencies: getDependencyManager(),
    pluginsEnabled: true
  };
}
