import { toast } from './utils.js';

async function waitForImages(element) {
  var images = element.querySelectorAll('img');
  var promises = Array.from(images).map(function(img) {
    if (img.complete) return Promise.resolve();
    return new Promise(function(resolve) {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });
  await Promise.all(promises);
}

export async function generatePDF(elementId, fileName) {
  fileName = fileName || 'oraculo.pdf';
  var element = document.getElementById(elementId);
  if (!element) { toast('Elemento no encontrado'); return; }
  if (!element.innerText.trim()) { toast('No hay contenido para exportar'); return; }
  if (typeof html2canvas === 'undefined') { toast('Error: html2canvas no cargada'); return; }
  if (!window.jspdf || !window.jspdf.jsPDF) { toast('Error: jsPDF no cargada'); return; }

  toast('Generando informe profesional vFinal...');

  var clone = element.cloneNode(true);
  var unwanted = clone.querySelectorAll('.action-buttons, .btn-mystic, button, .mic-btn-small, .mic-btn, .subnav-horizontal, .num-tabs, .auto-ia-toggle, .modal-close');
  unwanted.forEach(function(el) { el.remove(); });

  // No eliminar el contenido de IA (ia-interp)
  // Asegurar que los divs de IA se mantengan

  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#000000';
  clone.style.padding = '30px';
  clone.style.width = '750px';
  clone.style.margin = '0 auto';
  clone.style.fontFamily = 'Arial, sans-serif';
  clone.style.lineHeight = '1.5';
  clone.style.border = 'none';

  var cards = clone.querySelectorAll('.real-card');
  for (var i = 0; i < cards.length; i++) {
    cards[i].style.width = '120px';
    cards[i].style.height = '200px';
    cards[i].style.margin = '15px auto';
  }
  var runes = clone.querySelectorAll('.rune-card');
  for (i = 0; i < runes.length; i++) {
    runes[i].style.width = '80px';
    runes[i].style.margin = '10px auto';
  }
  var imgs = clone.querySelectorAll('img');
  for (i = 0; i < imgs.length; i++) {
    imgs[i].style.maxWidth = '100%';
    imgs[i].style.height = 'auto';
    imgs[i].style.display = 'block';
  }

  var tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.top = '-9999px';
  tempDiv.style.left = '-9999px';
  tempDiv.appendChild(clone);
  document.body.appendChild(tempDiv);

  await waitForImages(clone);
  await new Promise(function(resolve) { setTimeout(resolve, 300); });

  try {
    var canvas = await html2canvas(clone, { scale: Math.min(window.devicePixelRatio || 1, 2), backgroundColor: '#ffffff', useCORS: true,
      imageTimeout: 15000, logging: false });
    var imgData = canvas.toDataURL('image/png');
    var jsPDF = window.jspdf.jsPDF;
    var pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFont('helvetica');
    pdf.setFontSize(18);
    pdf.text('Oráculo Místico - Informe Profesional',15,12);
    var fecha = new Date().toLocaleString('es-ES');
    pdf.setFontSize(9);
    pdf.text('Generado: ' + fecha, 15, 18);
    var pageWidth = pdf.internal.pageSize.getWidth();
    var pageHeight = pdf.internal.pageSize.getHeight();
    var margin = 20;
    var imgWidth = pageWidth - margin * 2;
    var imgHeight = (canvas.height * imgWidth) / canvas.width;
    var topMargin = 28;
    var bottomMargin = 20;
    var position = topMargin;
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    var heightLeft = imgHeight - (pageHeight - topMargin - bottomMargin);
    var pages = 1;
    while (heightLeft > 0) {
      position = topMargin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - topMargin - bottomMargin);
      pages++;
    }
    for (var p=1;p<=pages;p++){
      pdf.setPage(p);
      pdf.setFontSize(9);
      pdf.text('Oráculo Místico',15,290);
      pdf.text('Página '+p+' de '+pages,170,290,{align:'right'});
    }
    pdf.save(fileName);
    toast('PDF generado (' + pages + ' páginas)');
  } catch (err) {
    toast('Error al generar PDF: ' + err.message);
  } finally {
    document.body.removeChild(tempDiv);
  }
}

export async function generatePDFFromElement(element, fileName) {
  if (typeof html2canvas === 'undefined') { toast('Error: html2canvas no cargada'); return; }
  if (!window.jspdf || !window.jspdf.jsPDF) { toast('Error: jsPDF no cargada'); return; }

  var clone = element.cloneNode(true);
  var unwanted = clone.querySelectorAll('.action-buttons, .btn-mystic, button, .modal-close');
  unwanted.forEach(function(el) { el.remove(); });

  // Mantener .ia-interp
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#000000';
  clone.style.padding = '30px';
  clone.style.width = '750px';
  clone.style.margin = '0 auto';
  clone.style.fontFamily = 'Arial, sans-serif';
  clone.style.lineHeight = '1.5';
  clone.style.border = 'none';

  var cards = clone.querySelectorAll('.real-card');
  for (var i = 0; i < cards.length; i++) {
    cards[i].style.width = '120px';
    cards[i].style.height = '200px';
    cards[i].style.margin = '15px auto';
  }
  var runes = clone.querySelectorAll('.rune-card');
  for (i = 0; i < runes.length; i++) {
    runes[i].style.width = '80px';
    runes[i].style.margin = '10px auto';
  }
  var imgs = clone.querySelectorAll('img');
  for (i = 0; i < imgs.length; i++) {
    imgs[i].style.maxWidth = '100%';
    imgs[i].style.height = 'auto';
  }

  var tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.top = '-9999px';
  tempDiv.style.left = '-9999px';
  tempDiv.appendChild(clone);
  document.body.appendChild(tempDiv);

  await new Promise(function(resolve) { setTimeout(resolve, 300); });
  await waitForImages(clone);

  try {
    var canvas = await html2canvas(clone, { scale: Math.min(window.devicePixelRatio || 1, 2), backgroundColor: '#ffffff', useCORS: true });
    var imgData = canvas.toDataURL('image/png');
    var jsPDF = window.jspdf.jsPDF;
    var pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFont('helvetica');
    pdf.setFontSize(18);
    pdf.text('Oráculo Místico - Informe Profesional',15,12);
    var fecha = new Date().toLocaleString('es-ES');
    pdf.setFontSize(9);
    pdf.text('Generado: ' + fecha, 15, 18);
    var pageWidth = pdf.internal.pageSize.getWidth();
    var margin = 20;
    var imgWidth = pageWidth - margin * 2;
    var imgHeight = (canvas.height * imgWidth) / canvas.width;
    var pageHeight = pdf.internal.pageSize.getHeight();
    var topMargin = 28;
    var bottomMargin = 20;
    var position = topMargin;
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    var heightLeft = imgHeight - (pageHeight - topMargin - bottomMargin);
    var pageNum = 1;
    while (heightLeft > 0) {
      position = topMargin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - topMargin - bottomMargin);
      pageNum++;
    }
    for (var p=1;p<=pageNum;p++){
      pdf.setPage(p);
      pdf.setFontSize(9);
      pdf.text('Oráculo Místico',15,290);
      pdf.text('Página '+p+' de '+pageNum,170,290,{align:'right'});
    }
    pdf.save(fileName);
    toast('PDF generado (' + pageNum + ' páginas)');
  } catch(e) { toast('Error al generar PDF: ' + e.message); }
  finally { document.body.removeChild(tempDiv); }
}

export async function shareAsImage(element, title) {
  title = title || 'Oráculo Místico';
  if (!element) { toast('Elemento no encontrado'); return; }
  if (typeof html2canvas === 'undefined') { toast('Error: html2canvas no cargada'); return; }

  toast('Generando imagen...');

  var clone = element.cloneNode(true);
  var unwanted = clone.querySelectorAll('.action-buttons, .btn-mystic, button, .modal-close');
  unwanted.forEach(function(el) { el.remove(); });

  // IMPORTANTE: No eliminar .ia-interp
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#000000';
  clone.style.padding = '20px';
  clone.style.fontFamily = 'Arial, sans-serif';
  clone.style.maxWidth = '600px';
  clone.style.margin = '0 auto';
  clone.style.borderRadius = '8px';
  clone.style.boxShadow = 'none';

  var cards = clone.querySelectorAll('.real-card');
  for (var i = 0; i < cards.length; i++) {
    cards[i].style.width = '100px';
    cards[i].style.height = '170px';
    cards[i].style.margin = '10px auto';
  }
  var runes = clone.querySelectorAll('.rune-card');
  for (i = 0; i < runes.length; i++) {
    runes[i].style.width = '70px';
    runes[i].style.height = 'auto';
    runes[i].style.margin = '10px auto';
  }

  // Añadir pie de página
  var footer = document.createElement('div');
  footer.style.textAlign = 'center';
  footer.style.marginTop = '20px';
  footer.style.paddingTop = '10px';
  footer.style.borderTop = '1px solid #ddd';
  footer.style.fontSize = '10px';
  footer.style.color = '#999';
  footer.innerText = 'Generado por Oráculo Místico · ' + new Date().toLocaleDateString();
  clone.appendChild(footer);

  var tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.top = '-9999px';
  tempDiv.style.left = '-9999px';
  tempDiv.appendChild(clone);
  document.body.appendChild(tempDiv);

  await new Promise(function(r) { setTimeout(r, 100); });
  var images = clone.querySelectorAll('img');
  await Promise.all(Array.from(images).map(function(img) {
    if (img.complete) return Promise.resolve();
    return new Promise(function(resolve) { img.onload = resolve; img.onerror = resolve; });
  }));
  await new Promise(function(r) { setTimeout(r, 300); });

  try {
    var canvas = await html2canvas(tempDiv, { scale: Math.min(window.devicePixelRatio || 1, 2), backgroundColor: '#ffffff', useCORS: true });
    var blob = await new Promise(function(resolve) { canvas.toBlob(resolve, 'image/png'); });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([], 'img.png')] })) {
      var file = new File([blob], 'oraculo.png', { type: 'image/png' });
      await navigator.share({ title: title, files: [file] });
      toast('Imagen compartida');
    } else {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'oraculo_compartir.png';
      a.click();
      URL.revokeObjectURL(url);
      toast('Imagen descargada');
    }
  } catch (err) {
    console.error(err);
    toast('Error al generar imagen: ' + err.message);
  } finally {
    document.body.removeChild(tempDiv);
  }
}

export async function shareContent(elementId, title) {
  title = title || 'Oráculo Místico';
  var element = document.getElementById(elementId);
  if (!element || !element.innerText.trim()) { toast('No hay contenido para compartir'); return; }
  var text = element.innerText.slice(0, 1000);
  if (navigator.share) {
    try { await navigator.share({ title: title, text: text }); toast('Compartido'); } catch(e) { toast('Cancelado'); }
  } else {
    await navigator.clipboard.writeText(text);
    toast('Copiado al portapapeles');
  }
}
