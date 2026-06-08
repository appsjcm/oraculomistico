
// V4.2 Mystic Diary (base)
export function saveMysticEntry(type,title){
  const data=JSON.parse(localStorage.getItem('mysticDiary')||'[]');
  data.unshift({type,title,date:new Date().toISOString()});
  localStorage.setItem('mysticDiary',JSON.stringify(data.slice(0,200)));
}
