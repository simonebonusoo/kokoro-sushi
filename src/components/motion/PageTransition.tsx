import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Avvolge il contenuto di una route e riproduce una transizione "luxury"
 * (fade + leggero slide-up con sfumatura) ogni volta che cambia il pathname.
 * Il remount forzato tramite `key` fa ripartire l'animazione ad ogni navigazione.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
}
