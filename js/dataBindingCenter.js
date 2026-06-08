
// V12.6 Data Binding Center
import { getLiveData } from './liveDataCenter.js';

export function bindApplicationData(){
  return {
    liveData: getLiveData(),
    bindingReady: true
  };
}
