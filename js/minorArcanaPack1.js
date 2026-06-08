
// V17.9 Minor Arcana Pack I

export const WANDS = [
'As de Bastos','Dos de Bastos','Tres de Bastos','Cuatro de Bastos',
'Cinco de Bastos','Seis de Bastos','Siete de Bastos','Ocho de Bastos',
'Nueve de Bastos','Diez de Bastos','Sota de Bastos','Caballero de Bastos',
'Reina de Bastos','Rey de Bastos'
];

export const CUPS = [
'As de Copas','Dos de Copas','Tres de Copas','Cuatro de Copas',
'Cinco de Copas','Seis de Copas','Siete de Copas','Ocho de Copas',
'Nueve de Copas','Diez de Copas','Sota de Copas','Caballero de Copas',
'Reina de Copas','Rey de Copas'
];

export function getMinorArcanaPack1Info(){
  return {
    wands: WANDS.length,
    cups: CUPS.length,
    total: WANDS.length + CUPS.length
  };
}
