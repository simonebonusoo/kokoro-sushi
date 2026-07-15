/** Seed iniziale Kokoro per la demo locale. */

import type { Allergen, DiningArea, MenuCategory, MenuItem, RestaurantTable } from '@/types/database';

function iso(dayOffset: number, hour: number, min = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

function isoEnd(startIso: string, minutes: number): string {
  return new Date(new Date(startIso).getTime() + minutes * 60000).toISOString();
}

const nowIso = () => new Date().toISOString();

export interface DemoUser {
  id: string;
  email: string;
  password: string;
}

export const RESTAURANT_ID = '00000000-0000-0000-0000-000000000001';

export const demoUsers: DemoUser[] = [
  { id: 'demo-admin', email: 'admin@kokoro.it', password: 'admin1234' },
  { id: 'demo-client', email: 'cliente@kokoro.it', password: 'demo1234' },
  { id: 'demo-client-2', email: 'giulia@kokoro.it', password: 'demo1234' },
];

const CAT = {
  antipasti: '10000000-0000-0000-0000-000000000001',
  nigiri: '10000000-0000-0000-0000-000000000002',
  uramaki: '10000000-0000-0000-0000-000000000003',
  hosomaki: '10000000-0000-0000-0000-000000000004',
  sashimi: '10000000-0000-0000-0000-000000000005',
  poke: '10000000-0000-0000-0000-000000000006',
  cucinaCinese: '10000000-0000-0000-0000-000000000007',
  tempura: '10000000-0000-0000-0000-000000000008',
  dolci: '10000000-0000-0000-0000-000000000009',
  bibite: '10000000-0000-0000-0000-000000000010',
};

const MENU = {
  involtini: '20000000-0000-0000-0000-000000000001',
  nuvolette: '20000000-0000-0000-0000-000000000002',
  wakame: '20000000-0000-0000-0000-000000000003',
  samosa: '20000000-0000-0000-0000-000000000004',
  salmonStick: '20000000-0000-0000-0000-000000000005',
  tonnoTartufo: '20000000-0000-0000-0000-000000000006',
  sakeNigiri: '20000000-0000-0000-0000-000000000007',
  maguroNigiri: '20000000-0000-0000-0000-000000000008',
  salmonTataki: '20000000-0000-0000-0000-000000000009',
  dragonRoll: '20000000-0000-0000-0000-000000000010',
  philadelphiaRoll: '20000000-0000-0000-0000-000000000011',
  salmonHosomaki: '20000000-0000-0000-0000-000000000012',
  tunaGunkan: '20000000-0000-0000-0000-000000000013',
  salmonSashimi: '20000000-0000-0000-0000-000000000014',
  pokeSalmon: '20000000-0000-0000-0000-000000000015',
  yakiUdon: '20000000-0000-0000-0000-000000000016',
  polloMandorle: '20000000-0000-0000-0000-000000000017',
  anatraCroccante: '20000000-0000-0000-0000-000000000018',
  gamberiTempura: '20000000-0000-0000-0000-000000000019',
  mochi: '20000000-0000-0000-0000-000000000020',
  acqua: '20000000-0000-0000-0000-000000000021',
  birra: '20000000-0000-0000-0000-000000000022',
};

const AREA = {
  interno: '30000000-0000-0000-0000-000000000001',
  esterno: '30000000-0000-0000-0000-000000000002',
};

const TABLE = {
  internaA: '40000000-0000-0000-0000-000000000001',
  internaB: '40000000-0000-0000-0000-000000000002',
  internaC: '40000000-0000-0000-0000-000000000003',
  esternaA: '40000000-0000-0000-0000-000000000004',
  esternaB: '40000000-0000-0000-0000-000000000005',
};

const ALLERGEN = {
  glutine: '50000000-0000-0000-0000-000000000001',
  crostacei: '50000000-0000-0000-0000-000000000002',
  sesamo: '50000000-0000-0000-0000-000000000003',
  pesce: '50000000-0000-0000-0000-000000000004',
  latte: '50000000-0000-0000-0000-000000000005',
  soia: '50000000-0000-0000-0000-000000000006',
};

const categoryNames: Record<string, string> = {
  [CAT.antipasti]: 'Antipasti',
  [CAT.nigiri]: 'Nigiri',
  [CAT.uramaki]: 'Uramaki',
  [CAT.hosomaki]: 'Hosomaki',
  [CAT.sashimi]: 'Sashimi',
  [CAT.poke]: 'Poke',
  [CAT.cucinaCinese]: 'Cucina Cinese',
  [CAT.tempura]: 'Tempura',
  [CAT.dolci]: 'Dolci',
  [CAT.bibite]: 'Bibite',
};

function menuItem(
  id: string,
  name: string,
  category_id: string,
  price: number,
  description: string,
  extra?: Partial<{
    ingredients: string;
    badge: string;
    image_url: string;
    is_vegetarian: boolean;
    is_vegan: boolean;
    is_spicy: boolean;
    is_raw: boolean;
    is_new: boolean;
    is_best_seller: boolean;
    sort_order: number;
  }>
): MenuItem {
  return {
    id,
    restaurant_id: RESTAURANT_ID,
    category_id,
    name,
    description,
    price,
    image_url: extra?.image_url ?? null,
    ingredients: extra?.ingredients ?? null,
    badge: extra?.badge ?? null,
    is_vegetarian: extra?.is_vegetarian ?? false,
    is_vegan: extra?.is_vegan ?? false,
    is_spicy: extra?.is_spicy ?? false,
    is_raw: extra?.is_raw ?? false,
    is_new: extra?.is_new ?? false,
    is_best_seller: extra?.is_best_seller ?? false,
    active: true,
    sort_order: extra?.sort_order ?? 0,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}

function reservation(
  id: string,
  customer_id: string,
  dining_area_id: string,
  table_id: string,
  startIso: string,
  duration: number,
  party_size: number,
  customer_name: string,
  customer_phone: string,
  customer_email: string,
  status: string,
  notes = ''
) {
  return {
    id,
    restaurant_id: RESTAURANT_ID,
    customer_id,
    dining_area_id,
    table_id,
    starts_at: startIso,
    ends_at: isoEnd(startIso, duration),
    status,
    party_size,
    customer_name,
    customer_phone,
    customer_email,
    notes,
    created_by: customer_id,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}

export function buildDemoDb() {
  const diningAreas: DiningArea[] = [
    {
      id: AREA.interno,
      restaurant_id: RESTAURANT_ID,
      name: 'Interno',
      description: 'Sala principale con atmosfera minimale.',
      active: true,
      sort_order: 1,
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      id: AREA.esterno,
      restaurant_id: RESTAURANT_ID,
      name: 'Esterno',
      description: 'Area esterna per le serate piu miti.',
      active: true,
      sort_order: 2,
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ];

  const tables: RestaurantTable[] = [
    { id: TABLE.internaA, restaurant_id: RESTAURANT_ID, dining_area_id: AREA.interno, name: 'Tavolo I-01', seats_min: 1, seats_max: 2, active: true, sort_order: 1, created_at: nowIso(), updated_at: nowIso() },
    { id: TABLE.internaB, restaurant_id: RESTAURANT_ID, dining_area_id: AREA.interno, name: 'Tavolo I-02', seats_min: 2, seats_max: 4, active: true, sort_order: 2, created_at: nowIso(), updated_at: nowIso() },
    { id: TABLE.internaC, restaurant_id: RESTAURANT_ID, dining_area_id: AREA.interno, name: 'Tavolo I-03', seats_min: 4, seats_max: 6, active: true, sort_order: 3, created_at: nowIso(), updated_at: nowIso() },
    { id: TABLE.esternaA, restaurant_id: RESTAURANT_ID, dining_area_id: AREA.esterno, name: 'Tavolo E-01', seats_min: 1, seats_max: 2, active: true, sort_order: 4, created_at: nowIso(), updated_at: nowIso() },
    { id: TABLE.esternaB, restaurant_id: RESTAURANT_ID, dining_area_id: AREA.esterno, name: 'Tavolo E-02', seats_min: 2, seats_max: 4, active: true, sort_order: 5, created_at: nowIso(), updated_at: nowIso() },
  ];

  const openingHours = Object.values(AREA).flatMap((dining_area_id) =>
    [1, 2, 3, 4, 5, 6, 0].flatMap((weekday, i) => [
      { id: `oh-${dining_area_id}-${i}-lunch`, restaurant_id: RESTAURANT_ID, dining_area_id, weekday, start_time: '12:00:00', end_time: '15:00:00', created_at: nowIso() },
      { id: `oh-${dining_area_id}-${i}-dinner`, restaurant_id: RESTAURANT_ID, dining_area_id, weekday, start_time: '19:00:00', end_time: '23:30:00', created_at: nowIso() },
    ])
  );

  const allergens: Allergen[] = [
    { id: ALLERGEN.glutine, name: 'glutine', created_at: nowIso() },
    { id: ALLERGEN.crostacei, name: 'crostacei', created_at: nowIso() },
    { id: ALLERGEN.sesamo, name: 'sesamo', created_at: nowIso() },
    { id: ALLERGEN.pesce, name: 'pesce', created_at: nowIso() },
    { id: ALLERGEN.latte, name: 'latte', created_at: nowIso() },
    { id: ALLERGEN.soia, name: 'soia', created_at: nowIso() },
  ];

  const menuCategories: MenuCategory[] = [
    { id: CAT.antipasti, restaurant_id: RESTAURANT_ID, name: 'Antipasti', menu_section: 'japanese', active: true, sort_order: 10, created_at: nowIso(), updated_at: nowIso() },
    { id: CAT.nigiri, restaurant_id: RESTAURANT_ID, name: 'Nigiri', menu_section: 'japanese', active: true, sort_order: 20, created_at: nowIso(), updated_at: nowIso() },
    { id: CAT.uramaki, restaurant_id: RESTAURANT_ID, name: 'Uramaki', menu_section: 'japanese', active: true, sort_order: 30, created_at: nowIso(), updated_at: nowIso() },
    { id: CAT.hosomaki, restaurant_id: RESTAURANT_ID, name: 'Hosomaki', menu_section: 'japanese', active: true, sort_order: 40, created_at: nowIso(), updated_at: nowIso() },
    { id: CAT.sashimi, restaurant_id: RESTAURANT_ID, name: 'Sashimi', menu_section: 'japanese', active: true, sort_order: 50, created_at: nowIso(), updated_at: nowIso() },
    { id: CAT.poke, restaurant_id: RESTAURANT_ID, name: 'Poke', menu_section: 'japanese', active: true, sort_order: 60, created_at: nowIso(), updated_at: nowIso() },
    { id: CAT.tempura, restaurant_id: RESTAURANT_ID, name: 'Tempura', menu_section: 'japanese', active: true, sort_order: 70, created_at: nowIso(), updated_at: nowIso() },
    { id: CAT.cucinaCinese, restaurant_id: RESTAURANT_ID, name: 'Cucina Cinese', menu_section: 'chinese', active: true, sort_order: 80, created_at: nowIso(), updated_at: nowIso() },
    { id: CAT.dolci, restaurant_id: RESTAURANT_ID, name: 'Dolci', menu_section: 'desserts', active: true, sort_order: 90, created_at: nowIso(), updated_at: nowIso() },
    { id: CAT.bibite, restaurant_id: RESTAURANT_ID, name: 'Bibite', menu_section: 'drinks', active: true, sort_order: 100, created_at: nowIso(), updated_at: nowIso() },
  ];

  const menuItems = [
    menuItem(MENU.involtini, '1. Involtini Primavera', CAT.antipasti, 2.5, 'Classico antipasto vegetariano del menu pubblico.', { ingredients: 'Verdure miste', badge: 'Vegetariano', is_vegetarian: true, sort_order: 10 }),
    menuItem(MENU.nuvolette, '4. Nuvolette', CAT.antipasti, 2, 'Nuvolette croccanti servite come starter.', { sort_order: 20 }),
    menuItem(MENU.wakame, '7. Goma Wakame', CAT.antipasti, 4, 'Insalata di alghe con sesamo.', { ingredients: 'Alghe, sesamo', badge: 'Vegetariano', is_vegetarian: true, sort_order: 30 }),
    menuItem(MENU.samosa, '18. Samosa', CAT.antipasti, 4.5, 'Samosa croccanti ispirati alla cucina fusion.', { badge: 'Vegetariano', is_vegetarian: true, sort_order: 40 }),
    menuItem(MENU.salmonStick, '150. Samurai Salmon Stick', CAT.antipasti, 4.5, 'Stick di salmone tra gli antipasti piu richiesti.', { ingredients: 'Salmone', badge: 'Best seller', is_best_seller: true, sort_order: 50 }),
    menuItem(MENU.tonnoTartufo, 'Samurai Tonno e Tartufo Stick', CAT.antipasti, 5.5, 'Tartare di tonno con nota di tartufo.', { ingredients: 'Tonno, tartufo', is_raw: true, sort_order: 60 }),
    menuItem(MENU.sakeNigiri, 'Sake Nigiri 2pz', CAT.nigiri, 3.5, 'Nigiri di salmone.', { ingredients: 'Salmone, riso sushi', is_raw: true, sort_order: 70 }),
    menuItem(MENU.maguroNigiri, 'Maguro Nigiri 2pz', CAT.nigiri, 4, 'Nigiri di tonno.', { ingredients: 'Tonno, riso sushi', is_raw: true, sort_order: 80 }),
    menuItem(MENU.salmonTataki, 'Salmon Tataki', CAT.sashimi, 8, 'Tataki di salmone leggermente scottato.', { ingredients: 'Salmone', badge: 'Crudo', is_raw: true, sort_order: 90 }),
    menuItem(MENU.dragonRoll, 'Dragon Roll 4pz', CAT.uramaki, 8, 'Uramaki creativo con salmone e topping croccante.', { ingredients: 'Riso sushi, salmone, avocado', badge: 'Best seller', is_best_seller: true, sort_order: 100 }),
    menuItem(MENU.philadelphiaRoll, 'Philadelphia Roll 4pz', CAT.uramaki, 7.5, 'Uramaki con salmone e formaggio cremoso.', { ingredients: 'Salmone, formaggio cremoso', sort_order: 110 }),
    menuItem(MENU.salmonHosomaki, 'Hosomaki Salmone 6pz', CAT.hosomaki, 4.5, 'Hosomaki lineare e classico al salmone.', { ingredients: 'Salmone, riso sushi', is_raw: true, sort_order: 120 }),
    menuItem(MENU.tunaGunkan, 'Tuna Gunkan 2pz', CAT.sashimi, 5, 'Gunkan con tartare di tonno.', { ingredients: 'Tonno, alga nori', is_raw: true, is_new: true, sort_order: 130 }),
    menuItem(MENU.salmonSashimi, 'Sashimi Salmone 3pz', CAT.sashimi, 5.5, 'Fette di salmone selezionato.', { ingredients: 'Salmone', is_raw: true, sort_order: 140 }),
    menuItem(MENU.pokeSalmon, 'Poke Salmone', CAT.poke, 10, 'Bowl con salmone, riso, avocado e verdure.', { ingredients: 'Salmone, riso, avocado', badge: 'Lunch', is_best_seller: true, sort_order: 150 }),
    menuItem(MENU.yakiUdon, 'Yaki Udon con Pollo', CAT.cucinaCinese, 8.5, 'Udon saltati con pollo e verdure.', { ingredients: 'Udon, pollo, verdure', sort_order: 160 }),
    menuItem(MENU.polloMandorle, 'Pollo alle Mandorle', CAT.cucinaCinese, 7.5, 'Classico piatto caldo con mandorle croccanti.', { ingredients: 'Pollo, mandorle', sort_order: 170 }),
    menuItem(MENU.anatraCroccante, 'Anatra Croccante', CAT.cucinaCinese, 10, 'Anatra croccante in stile fusion.', { badge: 'Best seller', is_best_seller: true, sort_order: 180 }),
    menuItem(MENU.gamberiTempura, 'Gamberi Tempura', CAT.tempura, 9, 'Gamberi in tempura leggera.', { ingredients: 'Gamberi, pastella', sort_order: 190 }),
    menuItem(MENU.mochi, 'Mochi Mix 3pz', CAT.dolci, 5.5, 'Mochi assortiti.', { badge: 'Dolce', sort_order: 200 }),
    menuItem(MENU.acqua, 'Acqua', CAT.bibite, 2, 'Naturale o frizzante.', { sort_order: 210 }),
    menuItem(MENU.birra, 'Birra Asahi', CAT.bibite, 4.5, 'Birra giapponese.', { sort_order: 220 }),
  ];

  const link = (menu_item_id: string, allergen_id: string) => ({ menu_item_id, allergen_id });

  return {
    restaurants: [{ id: RESTAURANT_ID, name: 'Kokoro Sushi Roma', slug: 'kokoro-sushi-roma', created_at: nowIso(), updated_at: nowIso() }],
    restaurant_settings: [{
      id: '90000000-0000-0000-0000-000000000001',
      restaurant_id: RESTAURANT_ID,
      default_reservation_duration_minutes: 90,
      slot_interval_minutes: 30,
      min_party_size: 1,
      max_party_size: 8,
      min_notice_hours: 2,
      max_advance_days: 60,
      created_at: nowIso(),
      updated_at: nowIso(),
    }],
    profiles: [
      { id: 'demo-admin', full_name: 'Admin Kokoro', email: 'admin@kokoro.it', phone: '+39 333 0000001', role: 'admin', created_at: iso(-120, 9), updated_at: nowIso() },
      { id: 'demo-client', full_name: 'Mario Rossi', email: 'cliente@kokoro.it', phone: '+39 333 1234567', role: 'client', created_at: iso(-40, 9), updated_at: nowIso() },
      { id: 'demo-client-2', full_name: 'Giulia Neri', email: 'giulia@kokoro.it', phone: '+39 333 7654321', role: 'client', created_at: iso(-20, 9), updated_at: nowIso() },
      { id: 'demo-client-3', full_name: 'Laura Bianchi', email: 'laura@kokoro.it', phone: '+39 333 2223334', role: 'client', created_at: iso(-10, 9), updated_at: nowIso() },
    ],
    menu_categories: menuCategories,
    menu_items: menuItems,
    allergens,
    menu_item_allergens: [
      link(MENU.involtini, ALLERGEN.glutine),
      link(MENU.nuvolette, ALLERGEN.crostacei),
      link(MENU.wakame, ALLERGEN.sesamo),
      link(MENU.samosa, ALLERGEN.glutine),
      link(MENU.salmonStick, ALLERGEN.pesce),
      link(MENU.salmonStick, ALLERGEN.glutine),
      link(MENU.tonnoTartufo, ALLERGEN.pesce),
      link(MENU.sakeNigiri, ALLERGEN.pesce),
      link(MENU.maguroNigiri, ALLERGEN.pesce),
      link(MENU.salmonTataki, ALLERGEN.pesce),
      link(MENU.dragonRoll, ALLERGEN.pesce),
      link(MENU.philadelphiaRoll, ALLERGEN.pesce),
      link(MENU.philadelphiaRoll, ALLERGEN.latte),
      link(MENU.salmonHosomaki, ALLERGEN.pesce),
      link(MENU.tunaGunkan, ALLERGEN.pesce),
      link(MENU.salmonSashimi, ALLERGEN.pesce),
      link(MENU.pokeSalmon, ALLERGEN.pesce),
      link(MENU.yakiUdon, ALLERGEN.glutine),
      link(MENU.yakiUdon, ALLERGEN.soia),
      link(MENU.gamberiTempura, ALLERGEN.crostacei),
      link(MENU.gamberiTempura, ALLERGEN.glutine),
    ],
    dining_areas: diningAreas,
    restaurant_tables: tables,
    opening_hours: openingHours,
    restaurant_closures: [],
    reservations: [
      reservation('rv-1', 'demo-client', AREA.interno, TABLE.internaB, iso(1, 20), 90, 2, 'Mario Rossi', '+39 333 1234567', 'cliente@kokoro.it', 'pending', 'Tavolo tranquillo se possibile'),
      reservation('rv-2', 'demo-client-2', AREA.esterno, TABLE.esternaB, iso(2, 21), 90, 4, 'Giulia Neri', '+39 333 7654321', 'giulia@kokoro.it', 'confirmed', 'Compleanno'),
      reservation('rv-3', 'demo-client', AREA.interno, TABLE.internaA, iso(-7, 13), 90, 2, 'Mario Rossi', '+39 333 1234567', 'cliente@kokoro.it', 'completed'),
      reservation('rv-4', 'demo-client-3', AREA.interno, TABLE.internaC, iso(0, 20), 90, 5, 'Laura Bianchi', '+39 333 2223334', 'laura@kokoro.it', 'confirmed', 'Seggiolone'),
    ],
    notifications: [
      { id: 'nt-1', user_id: 'demo-client', title: 'Richiesta ricevuta', message: 'La tua richiesta per domani alle 20:00 e in attesa di conferma.', type: 'reservation_created', read: false, reservation_id: 'rv-1', created_at: iso(-1, 9) },
      { id: 'nt-2', user_id: 'demo-admin', title: 'Nuova prenotazione', message: 'Mario Rossi ha richiesto un tavolo interno per 2 persone.', type: 'reservation_created', read: false, reservation_id: 'rv-1', created_at: iso(-1, 9) },
      { id: 'nt-3', user_id: 'demo-admin', title: 'Richiesta speciale', message: 'Laura Bianchi ha richiesto un seggiolone per la prenotazione di oggi.', type: 'system', read: true, reservation_id: 'rv-4', created_at: iso(-1, 12) },
    ],
  };
}

export function getFallbackDb() {
  return buildDemoDb();
}

export function getFallbackMenuItems() {
  const db = getFallbackDb();
  return attachMenuRelations(db.menu_items.filter((item) => item.active), db);
}

export function getFallbackDiningAreas() {
  return getFallbackDb().dining_areas.filter((area) => area.active);
}

export function getFallbackRestaurantTables() {
  return getFallbackDb().restaurant_tables.filter((table) => table.active);
}

function attachMenuRelations(items: MenuItem[], db: ReturnType<typeof buildDemoDb>) {
  return items.map((item) => ({
    ...item,
    category: db.menu_categories.find((category) => category.id === item.category_id) ?? null,
    allergens: db.menu_item_allergens
      .filter((row) => row.menu_item_id === item.id)
      .map((row) => db.allergens.find((allergen) => allergen.id === row.allergen_id))
      .filter(Boolean) as Allergen[],
  }));
}

export function withDemoMenuRelations(items: MenuItem[], db: ReturnType<typeof buildDemoDb>) {
  return attachMenuRelations(items, db);
}

export function categoryName(categoryId: string) {
  return categoryNames[categoryId] ?? 'Menu';
}
