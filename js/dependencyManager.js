
// V13.3 Dependency Manager
import { getModuleRegistry } from './moduleRegistry.js';

export function getDependencyManager(){
  return {
    registry: getModuleRegistry(),
    dependenciesResolved: true
  };
}
