
// V6.4 Daily Oracle
export function getDailyOracle(){
  const messages = [
    "🔮 Confía en tu intuición hoy.",
    "✨ Una oportunidad inesperada puede aparecer.",
    "🌙 Escucha más y observa con calma."
  ];
  const day = Math.floor(Date.now()/86400000);
  return messages[day % messages.length];
}
