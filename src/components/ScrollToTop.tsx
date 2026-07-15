import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Riporta la pagina in cima ad ogni cambio di route.
 * Se è presente un hash (#sezione) non interferisce, così eventuali
 * ancore continuano a funzionare.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}
