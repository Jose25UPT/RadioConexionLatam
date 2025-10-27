import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  // Desactiva la restauración automática del navegador (evita que "salte" al fondo al recargar)
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
      return () => { window.history.scrollRestoration = prev as ScrollRestoration; };
    }
  }, []);

  useEffect(() => {
    // Si existe un hash (#seccion), dejamos que el navegador intente anclarlo
    if (hash) return;
    // Resetea scroll al tope en cada navegación
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search, hash]);

  return null;
}
