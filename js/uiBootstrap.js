
// V11.4 UI Bootstrap
import { mountApplication } from './uiMount.js';

export function bootstrapUI(){
  return {
    app: mountApplication(),
    bootstrapped: true
  };
}
