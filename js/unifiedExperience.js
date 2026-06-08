
// V9.2 Unified Experience
import { getHomeWidgets } from './homeWidgets.js';

export function buildUnifiedExperience(){
  return {
    widgets: getHomeWidgets(),
    sections: ['home','dashboard','user-center']
  };
}
