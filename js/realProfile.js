
// V17.8 Real Profile
import { RealDataSystem } from './realDataSystem.js';
import { getRealStatistics } from './realStatistics.js';

const PROFILE_KEY = 'oraculo_profile';

export function getProfile(){
  return RealDataSystem.load(PROFILE_KEY, {
    username: 'Usuario Místico',
    createdAt: new Date().toISOString()
  });
}

export function saveProfile(profile){
  RealDataSystem.save(PROFILE_KEY, profile);
  return profile;
}

export function getProfileSummary(){
  return {
    profile: getProfile(),
    statistics: getRealStatistics()
  };
}
