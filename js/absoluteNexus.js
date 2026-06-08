
// V14.9 Absolute Nexus
import { getInfiniteNexus } from './infiniteNexus.js';

export function getAbsoluteNexus(){
  return {
    nexus: getInfiniteNexus(),
    absoluteNexusReady: true
  };
}
