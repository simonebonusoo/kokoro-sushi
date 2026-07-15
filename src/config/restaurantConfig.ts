export interface WeeklyHours {
  day: number;
  label: string;
  slots: string[];
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface BrandLogoConfig {
  navbarSrc: string;
  footerSrc: string;
  adminSrc: string;
  authSrc: string;
  alt: string;
}

export interface RestaurantConfig {
  name: string;
  fullName: string;
  slug: string;
  logoText: string;
  tagline: string;
  logo: BrandLogoConfig;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutTitle: string;
  aboutText: string;
  seoDescription: string;
  bookingNotice: string;
  mapQuery: string;
  contact: {
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    whatsapp: string;
    email: string;
    instagram: string;
    mapEmbedUrl: string;
    latitude: number;
    longitude: number;
  };
  paths: {
    home: string;
    menu: string;
    booking: string;
  };
  seo: {
    title: string;
    description: string;
    canonicalUrl: string;
    image: string;
  };
  colors: {
    brand: string;
    accent: string;
  };
  hours: WeeklyHours[];
  booking: {
    slotIntervalMinutes: number;
    bufferMinutes: number;
    cancellationThresholdHours: number;
    maxAdvanceDays: number;
    defaultReservationDurationMinutes: number;
    minPartySize: number;
    maxPartySize: number;
    minNoticeHours: number;
  };
  menu: {
    showUnavailableItems: boolean;
    supportsTableQuery: boolean;
  };
  specialties: { title: string; description: string; badge: string }[];
  menuHighlights: { name: string; category: string; description: string; price: number }[];
  promotions: { title: string; description: string }[];
  whyChooseUs: { title: string; text: string; icon: string }[];
  gallery: GalleryImage[];
  reviews: { name: string; text: string; rating: number }[];
}

export const restaurantConfig: RestaurantConfig = {
  name: 'KOKORO SUSHI ROMA',
  fullName: 'Kokoro Sushi Roma',
  slug: 'kokoro-sushi-roma',
  logoText: 'KOKORO',
  tagline: 'Sushi Roma',
  logo: {
    navbarSrc: '/images/kokoro/brand/kokoro-logo-navbar.png',
    footerSrc: '/images/kokoro/brand/kokoro-logo-footer.png',
    adminSrc: '/images/kokoro/brand/kokoro-logo-admin.png',
    authSrc: '/images/kokoro/brand/kokoro-logo-auth.png',
    alt: 'Kokoro Sushi',
  },
  heroTitle: 'Cucina giapponese e cinese in una cornice essenziale.',
  heroSubtitle:
    'Menu dinamico, prenotazioni rapide e un’esperienza premium pensata per chi cerca qualità, atmosfera e cura precisa.',
  heroImage:
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1800&q=80',
  aboutTitle: 'Un indirizzo contemporaneo tra sushi signature e classici fusion',
  aboutText:
    'Kokoro Sushi Roma unisce tecnica giapponese, suggestioni cinesi e una sala dal gusto minimale. Ingredienti freschi, composizioni curate e un ritmo di accoglienza adatto sia al pranzo sia alla cena.',
  seoDescription:
    'Kokoro Sushi Roma in Via Tiburtina 717: menu digitale, prenotazione tavoli online e dashboard admin per gestire menu e disponibilita del ristorante.',
  bookingNotice:
    'Le prenotazioni online vengono registrate in pochi passaggi. Inserisci i tuoi dati e scegli area interna o esterna.',
  mapQuery: 'Via Tiburtina 717, 00159 Roma',
  contact: {
    address: 'Via Tiburtina 717',
    city: '00159 Roma',
    postalCode: '00159',
    phone: '06 89341555',
    whatsapp: '06 89341555',
    email: 'info@kokorosushiroma.com',
    instagram: 'https://www.instagram.com/kokorosushiroma/',
    mapEmbedUrl:
      'https://www.google.com/maps?q=Via+Tiburtina+717+Roma&output=embed',
    latitude: 41.9116087,
    longitude: 12.5508122,
  },
  paths: {
    home: '/',
    menu: '/menu',
    booking: '/prenota',
  },
  seo: {
    title: 'Kokoro Sushi Roma | Menu digitale e prenotazione tavolo',
    description:
      'Scopri il menu cinese e giapponese di Kokoro Sushi Roma e prenota il tuo tavolo in Via Tiburtina 717.',
    canonicalUrl: 'https://www.kokorosushiroma.com/',
    image:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1600&q=80',
  },
  colors: {
    brand: '#24180f',
    accent: '#a85f2b',
  },
  hours: [
    { day: 1, label: 'Lunedi', slots: ['12:00 - 15:00', '19:00 - 23:30'] },
    { day: 2, label: 'Martedi', slots: ['12:00 - 15:00', '19:00 - 23:30'] },
    { day: 3, label: 'Mercoledi', slots: ['12:00 - 15:00', '19:00 - 23:30'] },
    { day: 4, label: 'Giovedi', slots: ['12:00 - 15:00', '19:00 - 23:30'] },
    { day: 5, label: 'Venerdi', slots: ['12:00 - 15:00', '19:00 - 23:30'] },
    { day: 6, label: 'Sabato', slots: ['12:00 - 15:00', '19:00 - 23:30'] },
    { day: 0, label: 'Domenica', slots: ['12:00 - 15:00', '19:00 - 23:30'] },
  ],
  booking: {
    slotIntervalMinutes: 30,
    bufferMinutes: 0,
    cancellationThresholdHours: 4,
    maxAdvanceDays: 60,
    defaultReservationDurationMinutes: 90,
    minPartySize: 1,
    maxPartySize: 12,
    minNoticeHours: 2,
  },
  menu: {
    showUnavailableItems: true,
    supportsTableQuery: true,
  },
  specialties: [
    {
      title: 'Signature Rolls',
      description: 'Uramaki creativi con salmone, tonno, tartufo e consistenze croccanti.',
      badge: 'Best seller',
    },
    {
      title: 'Selezione Crudi',
      description: 'Nigiri, sashimi e carpacci pensati per esaltare materia prima e preparazione.',
      badge: 'Crudo',
    },
    {
      title: 'Cucina Calda',
      description: 'Primi, secondi, tempura e specialita cinesi per un menu ampio e trasversale.',
      badge: 'Fusion',
    },
  ],
  menuHighlights: [
    {
      name: 'Samurai Salmon Stick',
      category: 'Antipasti',
      description: 'Antipasto croccante al salmone dal menu pubblico Kokoro.',
      price: 4.5,
    },
    {
      name: 'Goma Wakame',
      category: 'Antipasti',
      description: 'Insalata di alghe con nota tostata di sesamo.',
      price: 4,
    },
    {
      name: 'Box 18',
      category: 'Box',
      description: 'Selezione sushi pronta da condividere, proposta del menu giapponese.',
      price: 18,
    },
    {
      name: 'Sake Nigiri',
      category: 'Nigiri',
      description: 'Nigiri di salmone in formato 2 pezzi.',
      price: 3.5,
    },
  ],
  promotions: [
    {
      title: 'Pranzo e cena tutti i giorni',
      description: 'Orari continuativi tra pranzo e cena con prenotazione tavolo online in pochi secondi.',
    },
    {
      title: 'Menu consultabile via QR',
      description: 'Perfetto per sala e tavoli: il cliente apre /menu e consulta piatti, allergeni e disponibilita.',
    },
  ],
  whyChooseUs: [
    { title: 'Ingredienti freschi', text: 'Selezione giornaliera tra crudi, rolls e piatti caldi.', icon: 'sparkles' },
    { title: 'Prenotazione rapida', text: 'Scegli data, orario, persone e zona sala in un flusso semplice.', icon: 'calendar' },
    { title: 'Atmosfera premium', text: 'Un design minimale tra nero, bianco e rossi giapponesi.', icon: 'heart' },
    { title: 'Menu dinamico', text: 'Categorie, disponibilita e schede piatto gestite dal database.', icon: 'utensils' },
  ],
  gallery: [
    {
      src: '/images/kokoro/gallery/kokoro-gallery-01.webp',
      alt: 'Interni di Kokoro Sushi Roma con tavoli apparecchiati',
    },
    {
      src: '/images/kokoro/gallery/kokoro-gallery-02.webp',
      alt: 'Sala Kokoro Sushi Roma con arco luminoso e tavoli',
    },
    {
      src: '/images/kokoro/gallery/kokoro-gallery-03.webp',
      alt: 'Tavoli e divanetti nella sala interna di Kokoro Sushi Roma',
    },
    {
      src: '/images/kokoro/gallery/kokoro-gallery-04.webp',
      alt: 'Tavolo rotondo nella zona interna di Kokoro Sushi Roma',
    },
    {
      src: '/images/kokoro/gallery/kokoro-gallery-05.webp',
      alt: 'Antipasto al salmone servito da Kokoro Sushi Roma',
    },
    {
      src: '/images/kokoro/gallery/kokoro-gallery-06.webp',
      alt: 'Tataki di salmone con edamame da Kokoro Sushi Roma',
    },
  ],
  reviews: [
    { name: 'Martina R.', text: 'Location elegante, menu ampio e accoglienza molto curata.', rating: 5 },
    { name: 'Davide P.', text: 'Prenotazione online rapida e sushi presentato benissimo.', rating: 5 },
    { name: 'Elena F.', text: 'Ottima scelta tra cucina giapponese e cinese, atmosfera rilassata.', rating: 5 },
  ],
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function mix([r, g, b]: [number, number, number], target: number, amount: number): [number, number, number] {
  return [
    Math.round(r + (target - r) * amount),
    Math.round(g + (target - g) * amount),
    Math.round(b + (target - b) * amount),
  ];
}

export function applyThemeFromConfig(config: RestaurantConfig = restaurantConfig): void {
  const root = document.documentElement;
  const brand = hexToRgb(config.colors.brand);
  const accent = hexToRgb(config.colors.accent);

  const brandScale: Record<number, [number, number, number]> = {
    50: mix(brand, 255, 0.96),
    100: mix(brand, 255, 0.9),
    200: mix(brand, 255, 0.78),
    300: mix(brand, 255, 0.56),
    400: mix(brand, 255, 0.3),
    500: brand,
    600: mix(brand, 0, 0.08),
    700: mix(brand, 0, 0.22),
    800: mix(brand, 0, 0.4),
    900: mix(brand, 0, 0.56),
  };

  Object.entries(brandScale).forEach(([k, rgb]) => {
    root.style.setProperty(`--brand-${k}`, rgb.join(' '));
  });
  root.style.setProperty('--accent-400', mix(accent, 255, 0.22).join(' '));
  root.style.setProperty('--accent-500', accent.join(' '));
  root.style.setProperty('--accent-600', mix(accent, 0, 0.15).join(' '));
}
