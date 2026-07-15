import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Shield, ArrowUpRight, Phone } from 'lucide-react';
import { clsx } from 'clsx';
import { restaurantConfig } from '@/config/restaurantConfig';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/NotificationBell';
import { BrandLogo } from '@/components/BrandLogo';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/prenota', label: 'Prenota' },
];

export function Navbar() {
  const { session, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setOpen(false);
  };

  // Chiudi il menu mobile ad ogni cambio pagina.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Blocca lo scroll della pagina sottostante e gestisci il tasto Escape
  // mentre il menu full-screen è aperto (coerente su Safari iOS e Chrome).
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-brand-50/85 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label={restaurantConfig.fullName}>
          <BrandLogo
            variant="navbar"
            imageClassName="h-8 sm:h-9"
          />
          {!isSupabaseConfigured && (
            <span
              title="Dati salvati in locale finche Supabase non e configurato"
              className="ml-1 rounded-full border border-accent-500/30 bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-600"
            >
              Demo
            </span>
          )}
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {publicLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                clsx(
                  'group relative rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  isActive ? 'text-brand-900' : 'text-brand-500 hover:text-brand-800'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {/* Indicatore pagina attiva: barra animata che scorre da sinistra */}
                  <span
                    className={clsx(
                      'pointer-events-none absolute bottom-0.5 left-3 right-3 h-0.5 origin-left rounded-full',
                      'bg-gradient-to-r from-accent-400 to-accent-600',
                      'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <NotificationBell />
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="h-4 w-4" /> Admin
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <LayoutDashboard className="h-4 w-4" />
                  {profile?.full_name?.split(' ')[0] || 'Area cliente'}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Esci">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Accedi
                </Button>
              </Link>
              <Link to="/prenota">
                <Button size="sm">
                  Prenota un tavolo
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="-mr-2 rounded-lg p-2 text-brand-800 transition hover:bg-brand-100 md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Apri il menu"
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      {/* Mobile menu full-screen (redesign editoriale) */}
      <MobileMenu
        open={open}
        onClose={() => setOpen(false)}
        session={Boolean(session)}
        isAdmin={isAdmin}
        onSignOut={handleSignOut}
      />
    </header>
  );
}

function MobileMenu({
  open,
  onClose,
  session,
  isAdmin,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  session: boolean;
  isAdmin: boolean;
  onSignOut: () => void;
}) {
  if (!open) return null;

  const phoneHref = `tel:${restaurantConfig.contact.phone.replace(/\s+/g, '')}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu di navigazione"
      className="fixed inset-0 z-50 flex h-[100dvh] flex-col bg-brand-50 md:hidden animate-[luxury-panel-in_320ms_cubic-bezier(0.22,1,0.36,1)_both]"
    >
      {/* Header pannello */}
      <div
        className="flex items-center justify-between border-b border-brand-100 px-5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)', paddingBottom: '1rem' }}
      >
        <Link to="/" onClick={onClose} aria-label={restaurantConfig.fullName} className="flex items-center gap-2">
          <BrandLogo variant="navbar" imageClassName="h-8" />
        </Link>
        <button
          onClick={onClose}
          aria-label="Chiudi il menu"
          className="-mr-1 flex h-11 w-11 items-center justify-center rounded-full text-brand-800 transition hover:bg-brand-100 active:scale-95"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Navigazione principale */}
      <nav className="flex flex-1 flex-col justify-center px-5">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-600">
          Kokoro Sushi Roma
        </p>
        <ul className="space-y-1">
          {publicLinks.map((l, index) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-baseline gap-4 py-2.5 transition',
                    isActive ? 'text-brand-900' : 'text-brand-800'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="w-6 shrink-0 text-sm font-medium text-brand-300 tabular-nums">
                      0{index + 1}
                    </span>
                    <span
                      className={clsx(
                        'heading-serif text-4xl leading-none transition-colors',
                        isActive ? 'text-brand-900' : 'text-brand-800 group-hover:text-brand-900'
                      )}
                    >
                      {l.label}
                    </span>
                    <span
                      className={clsx(
                        'ml-auto self-center transition-all duration-200',
                        isActive ? 'text-accent-600 opacity-100' : 'text-brand-300 opacity-0 group-hover:opacity-100'
                      )}
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Azioni secondarie */}
        <div className="mt-10 border-t border-brand-100 pt-6">
          {session ? (
            <div className="grid gap-2">
              <Link to="/dashboard" onClick={onClose}>
                <Button variant="outline" size="sm" fullWidth>
                  <LayoutDashboard className="h-4 w-4" /> Area cliente
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={onClose}>
                  <Button variant="ghost" size="sm" fullWidth>
                    <Shield className="h-4 w-4" /> Pannello Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" fullWidth onClick={onSignOut}>
                <LogOut className="h-4 w-4" /> Esci
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link to="/login" onClick={onClose}>
                <Button variant="outline" size="md" fullWidth>
                  Accedi
                </Button>
              </Link>
              <Link to="/prenota" onClick={onClose}>
                <Button size="md" fullWidth>
                  Prenota tavolo
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Footer pannello: contatto rapido */}
      <div
        className="border-t border-brand-100 px-5 text-sm"
        style={{ paddingTop: '1rem', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <a
          href={phoneHref}
          onClick={onClose}
          className="flex items-center gap-2 text-brand-600 transition hover:text-brand-900"
        >
          <Phone className="h-4 w-4 text-accent-600" />
          <span className="font-medium">{restaurantConfig.contact.phone}</span>
          <span className="text-brand-300">·</span>
          <span className="truncate text-brand-400">{restaurantConfig.contact.address}</span>
        </a>
      </div>
    </div>
  );
}
