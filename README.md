# ÓRBITA — viaje espacial

Sitio de una sola página en HTML5, CSS3 y JavaScript nativo, sin dependencias.

## Archivos
- `index.html`: estructura semántica y contenido en español.
- `styles.css`: estilos adaptables, profundidad visual y revelados.
- `script.js`: parallax de tres capas, Intersection Observer, túnel canvas y control de movimiento.
- `assets/`: los dos videos suministrados y sus imágenes de respaldo.

## Uso
Abrir `index.html` en un navegador moderno o servir la carpeta con cualquier servidor estático. No requiere compilación.

Los dos atributos `src` se dejan vacíos en el HTML, junto a los comentarios solicitados. El JavaScript asigna los videos desde `data-src`. Para reemplazarlos, cambia esas rutas o asigna directamente un `src` y elimina la asignación de `video.src` en JavaScript.

El cierre usa una invitación a reiniciar el viaje, sin inventar datos de contacto. Los servicios son textos de ejemplo editables. Cambia títulos y textos en HTML; colores y tipografía en CSS. La tipografía usa fuentes del sistema para funcionar sin conexiones externas.

La experiencia respeta `prefers-reduced-motion` y detiene los videos fuera de pantalla. Mantiene el desplazamiento nativo con teclado y oculta únicamente la barra visual. Los pósteres sirven como respaldo si autoplay no está disponible.

La sección **Señal orbital** consume la API pública `https://api.wheretheiss.at/v1/satellites/25544` cada 20 segundos. Si no hay conexión, muestra un estado de señal fuera de alcance sin bloquear el resto de la página. La cabecera integra las API del navegador para compartir y usar pantalla completa.
