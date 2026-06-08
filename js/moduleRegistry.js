
// V13.2 Module Registry
import { createServiceLayer } from './serviceLayer.js';

export function getModuleRegistry(){
  return {
    services: createServiceLayer(),
    modulesRegistered: true
  };
}
