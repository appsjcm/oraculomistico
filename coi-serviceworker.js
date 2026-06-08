// COI Service Worker - Desactivado en iOS por incompatibilidad
(function() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    console.log('🔮 Oráculo Místico: Modo iOS - COI Service Worker desactivado');
    return;
  }
  // No hacemos nada más, para evitar errores de SharedArrayBuffer
  console.log('COI no implementado para evitar problemas');
})();
