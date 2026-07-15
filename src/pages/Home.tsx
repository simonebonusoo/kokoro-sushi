import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarRange,
  Clock,
  MapPin,
  Sparkles,
  Star,
  UtensilsCrossed,
  Waves,
} from 'lucide-react';
import { restaurantConfig } from '@/config/restaurantConfig';
import { analytics } from '@/lib/analytics';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Reveal } from '@/components/motion/Reveal';
import { formatHours, formatPrice } from '@/utils/format';

const iconMap: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  calendar: CalendarRange,
  heart: Waves,
  utensils: UtensilsCrossed,
};

export function Home() {
  const c = restaurantConfig;

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center luxury-hero-zoom"
          style={{ backgroundImage: `url(${c.heroImage})` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,58,50,0.25),transparent_28rem),linear-gradient(120deg,rgba(17,17,17,0.92),rgba(17,17,17,0.56),rgba(17,17,17,0.85))]" />
        <div className="container-page relative flex min-h-[86vh] flex-col justify-center py-24">
          <div className="max-w-3xl luxury-hero-copy">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
              <Sparkles className="h-4 w-4 text-accent-400" />
              Via Tiburtina 717 · Roma
            </span>
            <h1 className="heading-serif mt-6 text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
              {c.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-brand-100">
              {c.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/prenota" onClick={() => analytics.prenotaCta('home-hero')}>
                <Button size="lg">
                  Prenota un tavolo <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/menu">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  Scopri il menu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section container-page">
        <Reveal>
          <SectionHeading
            eyebrow="Chi siamo"
            title={c.aboutTitle}
            subtitle={c.aboutText}
          />
        </Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {c.specialties.map((item, index) => (
            <Reveal key={item.title} delay={index * 90}>
              <Card hover>
                <span className="inline-flex rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-600">
                  {item.badge}
                </span>
                <h3 className="heading-serif mt-4 text-2xl text-brand-900">{item.title}</h3>
                <p className="mt-3 text-brand-500">{item.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="section container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Specialita"
              title="Una selezione che unisce classici richiesti e signature Kokoro"
            />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {c.menuHighlights.map((dish, index) => (
              <Reveal key={dish.name} delay={index * 70}>
                <Card hover className="bg-[linear-gradient(180deg,white,rgba(244,241,237,0.75))]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent-600">
                    {dish.category}
                  </p>
                  <h3 className="heading-serif mt-2 text-xl text-brand-900">{dish.name}</h3>
                  <p className="mt-2 min-h-[4rem] text-sm text-brand-500">{dish.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-brand-900">{formatPrice(dish.price)}</span>
                    <Link to="/menu" className="text-sm font-medium text-accent-600 transition hover:text-accent-500">
                      Apri menu
                    </Link>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section container-page">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <div className="rounded-[2rem] bg-brand-900 p-8 text-white shadow-soft sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent-400">
              Promozione
            </p>
            <h2 className="heading-serif mt-4 text-4xl sm:text-5xl">
              Pranzo e cena ogni giorno.
            </h2>
            <p className="mt-4 max-w-2xl text-brand-200">
              {c.promotions[0]?.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/prenota">
                <Button>Blocca il tavolo</Button>
              </Link>
              <Link to="/menu">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Menu digitale
                </Button>
              </Link>
            </div>
          </div>
          </Reveal>
          <Reveal delay={120}>
            <Card className="border-brand-200 bg-brand-50/70">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent-600">
              Prenota tavolo
            </p>
            <h3 className="heading-serif mt-4 text-3xl text-brand-900">Flusso rapido e chiaro</h3>
            <div className="mt-5 space-y-3">
              {[
                'Seleziona giorno e fascia disponibile',
                'Scegli numero persone e zona interna o esterna',
                'Inserisci nome, telefono, email e note',
                'Ricevi la conferma nella tua area cliente',
              ].map((step) => (
                <div key={step} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">
                    ✓
                  </span>
                  <p className="text-sm text-brand-700">{step}</p>
                </div>
              ))}
            </div>
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="bg-white">
        <div className="section container-page">
          <Reveal>
            <SectionHeading eyebrow="Perche Kokoro" title="Design essenziale, accoglienza fluida, menu dinamico" />
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.whyChooseUs.map((item, index) => {
              const Icon = iconMap[item.icon] ?? Sparkles;
              return (
                <Reveal key={item.title} delay={index * 70}>
                  <div className="rounded-3xl border border-brand-100 bg-brand-50 p-6 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:bg-white">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-semibold text-brand-900">{item.title}</h3>
                    <p className="mt-2 text-sm text-brand-500">{item.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section container-page">
        <Reveal>
          <SectionHeading eyebrow="Atmosfera" title="Una galleria pensata per raccontare materia e sala" />
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
          {c.gallery.map((image, i) => (
            <Reveal key={image.src} delay={(i % 3) * 80} className={i === 0 ? 'col-span-2 sm:col-span-1' : ''}>
              <div className="group aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-brand-100">
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="section container-page grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <div>
            <SectionHeading eyebrow="Contatti" title="Orari, recapiti e posizione" align="left" />
            <div className="mt-6 space-y-3">
              {c.hours.map((h) => (
                <div
                  key={h.day}
                  className="flex items-center justify-between border-b border-brand-100 py-3 text-sm"
                >
                  <span className="font-medium text-brand-800">{h.label}</span>
                  <span className="text-right text-brand-500">{formatHours(h.slots)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 text-sm text-brand-600">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent-600" />
                {c.contact.address}, {c.contact.city}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent-600" />
                Tutti i giorni, pranzo e cena
              </p>
            </div>
            <Link to="/prenota" className="mt-8 inline-block">
              <Button>
                Prenota un tavolo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="overflow-hidden rounded-[2rem] border border-brand-100 shadow-card">
            <iframe
              title="Mappa Kokoro Sushi Roma"
              src={c.contact.mapEmbedUrl}
              className="h-full min-h-[360px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          </Reveal>
        </div>
      </section>

      <section className="section bg-brand-100/45">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <span className="text-5xl leading-none text-brand-900">“</span>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.24em] text-accent-600">
              Recensioni
            </p>
            <h2 className="heading-serif mt-3 text-4xl text-brand-900 sm:text-5xl">
              Perche gli ospiti tornano da Kokoro
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-brand-500">
              Atmosfera curata, prenotazione semplice e una cucina pensata per essere ricordata.
            </p>
          </Reveal>

          <div className="mt-10 flex gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {c.reviews.map((r, index) => {
              const featured = index === 0;

              return (
                <Reveal key={r.name} delay={index * 90}>
                  <article
                  key={r.name}
                  className={
                    featured
                      ? 'min-w-[18rem] rounded-xl bg-brand-900 p-6 text-white shadow-card sm:min-w-[25rem]'
                      : 'min-w-[18rem] rounded-xl bg-white p-6 text-brand-900 shadow-sm ring-1 ring-brand-100 sm:min-w-[24rem]'
                  }
                >
                  <div className={featured ? 'flex gap-0.5 text-accent-400' : 'flex gap-0.5 text-accent-500'}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className={featured ? 'mt-5 text-xl leading-7 text-white' : 'mt-5 text-xl leading-7 text-brand-900'}>
                    {r.text}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <span className={featured ? 'flex h-9 w-9 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-white' : 'flex h-9 w-9 items-center justify-center rounded-full bg-accent-500/15 text-sm font-bold text-accent-600'}>
                      {r.name.charAt(0)}
                    </span>
                    <div>
                      <p className={featured ? 'text-sm font-semibold text-white' : 'text-sm font-semibold text-brand-900'}>
                        {r.name}
                      </p>
                      <p className={featured ? 'text-xs text-brand-300' : 'text-xs text-brand-400'}>
                        Cliente Kokoro Sushi Roma
                      </p>
                    </div>
                  </div>
                </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'}>
      <span className="text-sm font-semibold uppercase tracking-[0.24em] text-accent-600">
        {eyebrow}
      </span>
      <h2 className="heading-serif mt-3 text-4xl text-brand-900 sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg leading-8 text-brand-500">{subtitle}</p>}
    </div>
  );
}
