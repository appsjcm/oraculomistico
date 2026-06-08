
// V11.5 Application Shell
import { bootstrapUI } from './uiBootstrap.js';

export function createApplicationShell(){
  return {
    ui: bootstrapUI(),
    shellReady: true
  };
}
