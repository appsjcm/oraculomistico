
// V11.3 UI Mount
import { renderAppUI } from './uiRenderer.js';

export function mountApplication(){
  return {
    app: renderAppUI(),
    mounted: true
  };
}
