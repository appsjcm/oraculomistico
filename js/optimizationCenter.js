
// V10.6 Optimization Center
import { getPerformanceStatus } from './performanceCenter.js';

export function getOptimizationStatus(){
  return {
    performance: getPerformanceStatus(),
    optimization: 'enabled'
  };
}
