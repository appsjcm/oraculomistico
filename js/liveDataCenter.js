
// V12.5 Live Data Center
import { getDynamicContent } from './dynamicContent.js';

export function getLiveData(){
  return {
    content: getDynamicContent(),
    live: true
  };
}
