
// V18.5 Reading Interpretation Engine

const CARD_MEANINGS = {
  "El Mago": "Iniciativa, talento y acción.",
  "La Estrella": "Esperanza, inspiración y confianza.",
  "El Sol": "Éxito, alegría y claridad.",
  "La Luna": "Intuición, emociones y misterio."
};

const RUNE_MEANINGS = {
  "Fehu": "Prosperidad y recursos.",
  "Uruz": "Fuerza y determinación.",
  "Ansuz": "Comunicación y sabiduría.",
  "Raidho": "Viaje y progreso."
};

export function interpretCard(card){
  return CARD_MEANINGS[card] || "Interpretación disponible próximamente.";
}

export function interpretRune(rune){
  return RUNE_MEANINGS[rune] || "Interpretación disponible próximamente.";
}
