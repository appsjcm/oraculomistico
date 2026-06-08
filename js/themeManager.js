
// V4.4 Theme Manager (base)
export function setTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('mysticTheme', theme);
}
