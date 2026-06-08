
// V12.7 Unified Data Layer
import { bindApplicationData } from './dataBindingCenter.js';

export function getUnifiedData(){
  return {
    data: bindApplicationData(),
    unified: true
  };
}
