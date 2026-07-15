import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/context/AuthContext';
import { AppRoutes } from '@/routes/AppRoutes';
import { applyThemeFromConfig } from '@/config/restaurantConfig';

export default function App() {
  // Applica la palette del config come CSS variables all'avvio.
  useEffect(() => {
    applyThemeFromConfig();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        {/* Vercel Web Analytics: traccia le visite per singola pagina (anche le
            route interne della SPA). Cookieless, attivo solo in produzione su Vercel. */}
        <Analytics />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#fff',
              color: 'rgb(var(--brand-900))',
              border: '1px solid rgb(var(--brand-100))',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
