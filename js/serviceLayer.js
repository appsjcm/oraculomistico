
// V13.1 Service Layer
import { createApplicationCore } from './applicationCore.js';

export function createServiceLayer(){
  return {
    core: createApplicationCore(),
    servicesReady: true
  };
}
