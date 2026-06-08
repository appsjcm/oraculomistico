
// V18.0 Minor Arcana Pack II

export const SWORDS = [
'As de Espadas','Dos de Espadas','Tres de Espadas','Cuatro de Espadas',
'Cinco de Espadas','Seis de Espadas','Siete de Espadas','Ocho de Espadas',
'Nueve de Espadas','Diez de Espadas','Sota de Espadas','Caballero de Espadas',
'Reina de Espadas','Rey de Espadas'
];

export const PENTACLES = [
'As de Oros','Dos de Oros','Tres de Oros','Cuatro de Oros',
'Cinco de Oros','Seis de Oros','Siete de Oros','Ocho de Oros',
'Nueve de Oros','Diez de Oros','Sota de Oros','Caballero de Oros',
'Reina de Oros','Rey de Oros'
];

export function getMinorArcanaPack2Info(){
  return {
    swords: SWORDS.length,
    pentacles: PENTACLES.length,
    total: SWORDS.length + PENTACLES.length
  };
}
