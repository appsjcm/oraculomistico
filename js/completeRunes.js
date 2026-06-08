
// V17.4 Complete Runes

export const ELDER_FUTHARK = ['Fehu', 'Uruz', 'Thurisaz', 'Ansuz', 'Raidho', 'Kenaz', 'Gebo', 'Wunjo', 'Hagalaz', 'Nauthiz', 'Isa', 'Jera', 'Eihwaz', 'Perthro', 'Algiz', 'Sowilo', 'Tiwaz', 'Berkano', 'Ehwaz', 'Mannaz', 'Laguz', 'Ingwaz', 'Dagaz', 'Othala'];

export function drawRune(){
  return ELDER_FUTHARK[Math.floor(Math.random()*ELDER_FUTHARK.length)];
}

export function getRunesInfo(){
  return {
    totalRunes: ELDER_FUTHARK.length
  };
}
