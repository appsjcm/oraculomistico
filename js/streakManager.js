
// V7.1 Streak Manager
export function getCurrentStreak(){
  return Number(localStorage.getItem('mysticStreak') || 0);
}

export function updateStreak(value){
  localStorage.setItem('mysticStreak', String(value));
}
