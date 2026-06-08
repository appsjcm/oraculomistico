
// V4.5 Startup Enhancements (base)
import { initMysticParticles } from './particleEngine.js';

export function initMysticExperience(){
  try { initMysticParticles(); } catch(e){}
}
