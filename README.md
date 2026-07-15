# Kokoro Sushi Roma

Applicazione web per Kokoro Sushi Roma: sito vetrina, menu digitale filtrabile,
prenotazione tavoli, area cliente, pannello admin e notifiche interne.

Stack: React, Vite, TypeScript, Tailwind CSS, Supabase, React Router,
React Hook Form, Zod, date-fns, react-hot-toast.

## Avvio rapido

```bash
npm install
npm run dev
```

Apri `http://localhost:5173`.

Se Supabase non e configurato, l'app entra automaticamente in modalita demo
locale con dati persistiti in `localStorage`: menu, tavoli/zone, prenotazioni,
utenti demo, notifiche e pannello admin restano utilizzabili.

Account demo:

| Ruolo | Email | Password |
| --- | --- | --- |
| Admin | `admin@kokoro.it` | `admin1234` |
| Cliente | `cliente@kokoro.it` | `demo1234` |

Reset dati demo:

```js
localStorage.removeItem('kokoro_demo_db_v3');
localStorage.removeItem('kokoro_demo_users_v3');
localStorage.removeItem('kokoro_demo_session_v3');
location.reload();
```

## Modalita applicazione

Copia `.env.example` in `.env`:

```bash
cp .env.example .env
```

Variabili disponibili:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_MODE=auto
```

`VITE_APP_MODE` puo essere:

| Valore | Comportamento |
| --- | --- |
| `auto` | Usa Supabase se le credenziali sono valide, altrimenti demo locale. |
| `supabase` | Richiede Supabase configurato. Utile in produzione. |
| `demo` | Forza la demo locale anche con credenziali presenti. |

## Database Supabase

1. Crea un progetto su Supabase.
2. Apri SQL Editor.
3. Esegui tutto il file `supabase/schema.sql`.
4. Inserisci `Project URL` e `anon public key` in `.env`.

Lo schema include profili, menu, aree sala, tavoli, disponibilita, richieste di
prenotazione, notifiche, RLS, trigger e vincoli anti-doppia prenotazione.

Per creare il primo admin:

```sql
update public.profiles
set role = 'admin'
where email = 'tua@email.com';
```

## Funzionalita principali

- Home Kokoro con identita, orari, contatti, gallery e CTA.
- Menu digitale su `/menu`, con ricerca, categorie, filtro giapponese/cinese,
  allergeni, badge, piatti veg/vegan/crudi/piccanti e supporto QR
  `/menu?tavolo=12`.
- Prenotazione su `/prenota` con calendario, capienza, area interna/esterna,
  dati ospite, privacy, stato iniziale `pending` e schermata di conferma.
- Area cliente con richieste future/storiche e cancellazione quando consentita.
- Admin con dashboard, calendario, filtri per stato, conferma/rifiuto/completa/
  no-show/cancella, gestione menu, sale, tavoli, clienti, disponibilita e chiusure.
- Fallback demo robusto se Supabase non risponde o non ha ancora dati seed.
- Code splitting sulle rotte principali per ridurre il bundle iniziale.

## Script

```bash
npm run dev      # sviluppo
npm run build    # typecheck + build produzione
npm run preview  # preview build locale
npm run lint     # lint, se ESLint e configurato nel progetto
```

## Struttura

```text
src/
  components/     UI riutilizzabile, card menu, layout e navigazione
  config/         configurazione Kokoro e regole prenotazione
  context/        auth e sessione
  hooks/          menu, sale, tavoli, notifiche, richieste cliente
  lib/            Supabase, client demo locale, prenotazioni, scheduling
  pages/          pagine pubbliche, area cliente e admin
  routes/         rotte lazy, protected/admin route
  types/          tipi database e alias di dominio Kokoro
  utils/          disponibilita, formattazione, SEO
supabase/         schema SQL, RLS, trigger e seed
```

## Note operative

Il progetto e pronto per demo locale senza Supabase. In produzione usa
`VITE_APP_MODE=supabase`, esegui lo schema su Supabase e verifica che il primo
account admin sia promosso in `profiles`.

Schema, seed, rotte, tipi e data layer sono modellati direttamente sul dominio
Kokoro Sushi Roma: menu, sale, tavoli e prenotazioni.
