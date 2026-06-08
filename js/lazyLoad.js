// lazyLoad.js - Carga diferida de imágenes con Intersection Observer
export function initLazyLoading() {
    if (!window.IntersectionObserver) {
        // Fallback: cargar todas las imágenes inmediatamente
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
        });
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '200px' });
    
    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
}