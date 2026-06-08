
// V11.2 UI Renderer
import { connectUI } from './uiConnector.js';

export function renderAppUI(){
  return {
    ui: connectUI(),
    rendered: true
  };
}
