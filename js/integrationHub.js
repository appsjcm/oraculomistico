
// V8.0 Integration Hub
import { getUserCenterData } from './userCenter.js';
import { getOverviewData } from './dashboardOverview.js';

export function buildIntegratedDashboard(){
  return {
    user: getUserCenterData(),
    overview: getOverviewData()
  };
}
