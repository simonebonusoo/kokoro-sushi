import { Link } from 'react-router-dom';
import { Instagram, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { restaurantConfig } from '@/config/restaurantConfig';
import { formatHours } from '@/utils/format';

export function Footer() {
  const { name, contact, hours } = restaurantConfig;
  return (
    <footer className="relative overflow-hidden bg-[#050403] text-brand-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_58%_0%,rgba(168,95,43,0.22),transparent_18rem),radial-gradient(circle_at_78%_0%,rgba(255,255,255,0.08),transparent_10rem)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(255,255,255,0.24)_1px,transparent_1px)] [background-size:46px_46px]" />
      <div className="container-page relative py-12 sm:py-14">

          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.72fr_1.35fr_1fr] lg:items-start lg:justify-between">
            <div className="max-w-sm">
              <h3 className="text-base font-bold tracking-tight text-white">{name}</h3>
              <p className="mt-4 text-sm leading-6 text-white/65">
                Sushi e cucina fusion in Via Tiburtina 717, con menu digitale e prenotazione tavolo online.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram Kokoro Sushi Roma"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://wa.me/390689341555"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp Kokoro Sushi Roma"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Navigazione</h4>
              <ul className="space-y-2 text-sm text-white/55">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/menu" className="hover:text-white">Menu digitale</Link></li>
                <li><Link to="/prenota" className="hover:text-white">Prenota tavolo</Link></li>
                <li><Link to="/login" className="hover:text-white">Area cliente</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Orari</h4>
              <ul className="space-y-2 text-sm text-white/55">
                {hours.map((h) => (
                  <li key={h.day} className="grid grid-cols-[5.75rem_1fr] items-baseline gap-5 whitespace-nowrap">
                    <span className="text-white/65">{h.label}</span>
                    <span className="text-white/80">
                      {formatHours(h.slots)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Contatti</h4>
              <ul className="space-y-2 text-sm text-white/55">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {contact.address}, {contact.city}
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${contact.phone}`} className="hover:text-white">
                    {contact.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${contact.email}`} className="hover:text-white">
                    {contact.email}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  <a
                    href={contact.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white"
                  >
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-2 border-t border-white/10 pt-5 text-center text-xs text-white/55 sm:flex-row">
            <span>© {new Date().getFullYear()} {name}. Tutti i diritti riservati.</span>
            <span className="hidden text-white/30 sm:inline">•</span>
            <span>
              Powered by{' '}
              <a
                href="https://bnsstudio.it"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-accent-400 underline-offset-4 hover:text-white hover:underline"
              >
                BnsStudio
              </a>
            </span>
          </div>
      </div>
    </footer>
  );
}
