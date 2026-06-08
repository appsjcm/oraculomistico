
// V12.9 Event System
import { getApplicationState } from './stateManager.js';

export function createEventSystem(){
  return {
    state: getApplicationState(),
    eventsReady: true
  };
}
