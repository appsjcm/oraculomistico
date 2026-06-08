
// V10.7 Release Center
import { getOptimizationStatus } from './optimizationCenter.js';

export function getReleaseStatus(){
  return {
    optimization: getOptimizationStatus(),
    release: 'candidate'
  };
}
