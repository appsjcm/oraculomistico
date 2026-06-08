
// V16.4 Personalized Home
import { getHomeExperience } from './homeExperience.js';

export function getPersonalizedHome(){
  return {
    home: getHomeExperience(),
    recommendations: [
      'Carta recomendada',
      'Runa destacada',
      'Lectura sugerida'
    ],
    personalizedReady: true
  };
}
