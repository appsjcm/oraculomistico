
// V17.3 Complete Tarot

export const MAJOR_ARCANA = ['El Loco', 'El Mago', 'La Sacerdotisa', 'La Emperatriz', 'El Emperador', 'El Hierofante', 'Los Enamorados', 'El Carro', 'La Fuerza', 'El Ermitaño', 'La Rueda de la Fortuna', 'La Justicia', 'El Colgado', 'La Muerte', 'La Templanza', 'El Diablo', 'La Torre', 'La Estrella', 'La Luna', 'El Sol', 'El Juicio', 'El Mundo'];

export function drawMajorArcana(){
  return MAJOR_ARCANA[Math.floor(Math.random()*MAJOR_ARCANA.length)];
}

export function getTarotDeckInfo(){
  return {
    majorArcana: MAJOR_ARCANA.length,
    targetFullDeck: 78
  };
}
