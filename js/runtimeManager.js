
// V11.6 Runtime Manager
import { createApplicationShell } from './applicationShell.js';

export function initializeRuntime(){
  return {
    shell: createApplicationShell(),
    runtimeReady: true
  };
}
