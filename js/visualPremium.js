
// V30 Visual Premium
export function createMysticParticles(){
  const layer=document.createElement('div');
  layer.id='mystic-particles';
  document.body.appendChild(layer);
}

export function revealAnimation(el){
  if(el) el.classList.add('reveal-premium');
}
