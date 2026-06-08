
// V15.0 Final Core
import { getAbsoluteNexus } from './absoluteNexus.js';

export function getFinalCore(){
  return {
    nexus: getAbsoluteNexus(),
    finalCoreReady: true
  };
}
