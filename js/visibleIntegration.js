
// V11.0 Visible Integration
import { buildHomeComplete } from './homeComplete.js';

export function renderVisibleHome(){
  return {
    home: buildHomeComplete(),
    visible: true
  };
}
