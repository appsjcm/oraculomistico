
// V10.5 Performance Center
import { getMaintenanceStatus } from './maintenanceCenter.js';

export function getPerformanceStatus(){
  return {
    maintenance: getMaintenanceStatus(),
    performance: 'optimal'
  };
}
