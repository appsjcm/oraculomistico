
// V13.0 Application Core
import { createEventSystem } from './eventSystem.js';

export function createApplicationCore(){
  return {
    events: createEventSystem(),
    coreReady: true
  };
}
