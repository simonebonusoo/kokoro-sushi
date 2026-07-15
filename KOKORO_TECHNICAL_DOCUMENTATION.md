# Kokoro Sushi Roma - Documentazione tecnica

## Obiettivo

Kokoro Sushi Roma e una web app React/Vite per gestire presenza digitale,
consultazione menu e richieste di prenotazione tavoli. L'app puo funzionare in
due modi:

- demo locale immediata, senza Supabase, con persistenza in `localStorage`;
- produzione Supabase, con database, auth, RLS, trigger e notifiche.

## Architettura

- Frontend: React 18, TypeScript, Vite, Tailwind CSS.
- Routing: React Router con lazy loading delle pagine principali.
- Stato auth: `src/context/AuthContext.tsx`.
- Data layer Supabase/demo: `src/lib/supabase.ts`, `src/lib/localClient.ts`,
  `src/lib/reservations.ts`, `src/lib/openingHours.ts`.
- Configurazione ristorante: `src/config/restaurantConfig.ts`.
- Tipi: `src/types/database.ts`.
- Schema DB: `supabase/schema.sql`.

La modalita runtime viene decisa da `src/lib/env.ts` tramite `VITE_APP_MODE`.
Con `auto`, se le credenziali Supabase mancano o sono placeholder, viene usato
il client demo locale.

## Flussi utente

### Menu digitale

Pagina: `/menu`

Funzioni:

- ricerca per nome, descrizione, ingredienti e allergeni;
- filtro per categoria;
- filtro menu giapponese/cinese;
- filtro per allergene;
- filtri vegetariani, vegan, crudo, novita, best seller;
- supporto QR tavolo con query string, esempio `/menu?tavolo=12`;
- fallback ai dati demo se Supabase non risponde o non contiene voci menu.

### Prenotazione tavolo

Pagina: `/prenota`

Passaggi:

1. scelta giorno, numero persone, area interna/esterna e dati ospite;
2. scelta orario tra slot disponibili;
3. riepilogo e invio richiesta.

La richiesta viene creata con stato `pending`. L'admin puo poi confermare,
rifiutare, completare, marcare no-show o cancellare.

Regole principali:

- capienza minima/massima configurata in `restaurantConfig.booking`;
- anticipo minimo configurabile con `minNoticeHours`;
- massimo anticipo configurabile con `maxAdvanceDays`;
- anti-overlap su richieste `pending` e `confirmed`;
- privacy obbligatoria prima dell'invio.

### Area cliente

Pagine:

- `/dashboard`
- `/dashboard/prenotazioni`
- `/dashboard/notifiche`

Il cliente vede richieste future e storico, riceve notifiche e puo cancellare
quando la soglia temporale lo consente.

### Admin

Pagine:

- `/admin`
- `/admin/calendario`
- `/admin/menu`
- `/admin/sale-tavoli`
- `/admin/clienti`
- `/admin/impostazioni`

Funzioni:

- riepilogo richieste oggi/settimana, pending, confirmed, cancellate e ricavi;
- calendario con filtri per area sala e stato;
- scheda richiesta con azioni operative;
- gestione menu e disponibilita;
- gestione notifiche e clienti.

## Demo locale

Chiavi localStorage:

- `kokoro_demo_db_v3`
- `kokoro_demo_users_v3`
- `kokoro_demo_session_v3`

Account:

- admin: `admin@kokoro.it` / `admin1234`
- cliente: `cliente@kokoro.it` / `demo1234`

Il seed demo viene rigenerato se la struttura locale non e valida o se mancano
i dati minimi di Kokoro.

## Supabase

Eseguire `supabase/schema.sql` in SQL Editor.

Lo schema comprende:

- profili utente;
- voci menu e prenotazioni tavolo;
- aree sala e tavoli;
- disponibilita;
- chiusure;
- richieste di prenotazione;
- notifiche;
- enum stati: `pending`, `confirmed`, `rejected`, `cancelled`, `completed`,
  `no_show`;
- RLS;
- trigger di profilo e notifiche;
- vincolo anti-overlap per richieste `pending` e `confirmed`.

Il database non mantiene tabelle o alias del dominio precedente: lo schema usa
solo entita ristorante come `menu_items`, `dining_areas`, `restaurant_tables`,
`opening_hours`, `restaurant_closures` e `reservations`.

## Variabili ambiente

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_MODE=auto
```

Valori di `VITE_APP_MODE`:

- `auto`: fallback demo se Supabase non e configurato;
- `demo`: forza demo locale;
- `supabase`: forza Supabase, consigliato in produzione.

## Verifica prima del deploy

1. `npm install`
2. `npm run build`
3. `npm run lint` se ESLint e installato/configurato
4. Testare `/`, `/menu`, `/menu?tavolo=12`, `/prenota`
5. Testare login demo admin e cliente
6. Testare creazione richiesta con stato `pending`
7. Testare conferma/rifiuto da `/admin/calendario`
8. In produzione, verificare che `VITE_APP_MODE=supabase`

## Deploy

Build:

```bash
npm run build
```

Output:

```text
dist/
```

Qualsiasi hosting statico compatibile con Vite puo servire la cartella `dist`.
Configurare il fallback SPA verso `index.html`.
