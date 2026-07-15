# 06 · Technical Demo Handover — Kokoro Sushi Roma

> **INTERNO / BNS STUDIO — RISERVATO.** Contiene credenziali demo e note tecniche.
> **Non inviare al cliente.**

---

## URL

- **Demo pubblica:** https://demo.kokoro.bnsstudio.it
- **Locale (dev):** `npm run dev` → http://localhost:5173

---

## Stack

| Ambito | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Routing | react-router-dom v6 (SPA, `BrowserRouter`) |
| Styling | Tailwind CSS 3 (palette runtime da `restaurantConfig`) |
| Form/validazione | react-hook-form + zod |
| Backend (previsto) | Supabase (`@supabase/supabase-js`) |
| Backend (demo) | **Client locale** su `localStorage` (`src/lib/localClient.ts`) |

---

## Route

| Path | Pagina | Accesso |
|---|---|---|
| `/` | Home | Pubblico |
| `/menu` | Menu digitale | Pubblico |
| `/prenota` | Prenotazione tavolo | Pubblico (conferma richiede login) |
| `/login` | Accesso | Pubblico |
| `/registrati` | Registrazione | Pubblico |
| `/dashboard` | Area cliente — panoramica | Autenticato |
| `/dashboard/prenotazioni` | Le mie prenotazioni | Autenticato |
| `/dashboard/notifiche` | Notifiche | Autenticato |
| `/admin` | Dashboard gestione | Solo ruolo `admin` |
| `/admin/calendario` | Calendario prenotazioni | Solo `admin` |
| `/admin/menu` | CMS menu | Solo `admin` |
| `/admin/sale-tavoli` | Sale e tavoli | Solo `admin` |
| `/admin/clienti` | Clienti | Solo `admin` |
| `/admin/impostazioni` | Impostazioni | Solo `admin` |
| `*` | 404 NotFound | Pubblico |

---

## Credenziali demo

Definite in `src/lib/demoData.ts` (`demoUsers`). Valgono **solo in modalità demo** (client locale, nessuna password reale).

| Ruolo | Email | Password | Può fare |
|---|---|---|---|
| Cliente | `cliente@kokoro.it` | `demo1234` | Prenotare, vedere le proprie prenotazioni e notifiche |
| Cliente 2 | `giulia@kokoro.it` | `demo1234` | Come sopra (secondo profilo con dati) |
| Ristoratore/Admin | `admin@kokoro.it` | `admin1234` | Tutto il pannello gestione + calendario + CMS menu |

In `/login`, in modalità demo, compare un riquadro **"Accesso demo"** con pulsanti di compilazione rapida (Cliente / Ristoratore) — comodo davanti al cliente.

> ⚠️ Queste credenziali sono **finte e frontend-only**: non danno accesso a nessun dato reale né a Supabase. Sono sicure da mostrare.

---

## Modalità demo (come funziona)

Il selettore è centralizzato in `src/lib/env.ts` tramite la variabile **`VITE_APP_MODE`**:

- `demo` → forza il client locale (usato per questa demo).
- `supabase` → forza Supabase (richiede credenziali valide).
- `auto` (default) → usa Supabase se ci sono credenziali valide, altrimenti client locale.

`src/lib/supabase.ts` esporta un `supabase` che è il client reale **oppure** `localClient` (stessa interfaccia: `from().select/insert/update/delete`, `auth`, `channel`). Pagine e hook non sanno quale dei due è attivo → **nessun hack sparso**.

Il client locale (`src/lib/localClient.ts`):
- persiste un piccolo DB ristorante in `localStorage` (chiavi `kokoro_demo_*`);
- effettua seeding dei dati da `src/lib/demoData.ts` (menu reale Kokoro, aree, tavoli, orari, prenotazioni di esempio, notifiche);
- gestisce login/logout demo, insert prenotazioni con controllo sovrapposizioni, notifiche realtime simulate.

**Config demo attiva:** file `.env.production` con `VITE_APP_MODE=demo` (usato dalla build di produzione).

---

## Funzionalità disponibili (reali nella demo)

- Home, menu digitale con ricerca/filtri/allergeni, prenotazione multi-step, area cliente, pannello admin (calendario, CMS menu, sale/tavoli, clienti, impostazioni), notifiche.

## Funzionalità simulate / limitazioni in demo

- I dati vivono in `localStorage`: **si azzerano svuotando i dati del browser** e non sono condivisi tra dispositivi.
- Login/registrazione **non** inviano email reali; "Password dimenticata" mostra esito positivo ma non invia nulla.
- Nessuna persistenza server: una prenotazione fatta sul telefono non appare sul MacBook (sono storage separati).
- Realtime notifiche funziona **entro la stessa scheda/sessione**.

---

## Variabili d'ambiente

| Variabile | Scopo | Valore demo |
|---|---|---|
| `VITE_APP_MODE` | Seleziona demo/supabase/auto | `demo` |
| `VITE_SUPABASE_URL` | URL progetto Supabase | *(non impostata in demo)* |
| `VITE_SUPABASE_ANON_KEY` | Anon key Supabase | *(non impostata in demo)* |

> Non committare mai `.env` con chiavi reali. `.env.production` contiene **solo** `VITE_APP_MODE=demo`.

---

## Deploy

Target: **demo.kokoro.bnsstudio.it** (SPA statica).

1. Build: `npm run build` → output in `dist/`.
2. Pubblicare `dist/` come sito statico.
3. **Fallback SPA obbligatorio** (refresh su route interne):
   - Vercel: `vercel.json` (già presente) con rewrite `/(.*) → /index.html`.
   - Netlify: `public/_redirects` (già presente) → copiato in `dist/_redirects`.
   - Nginx: `try_files $uri /index.html;`
4. HTTPS gestito dall'host (Vercel/Netlify automatico).
5. `robots.txt` = `Disallow: /` e meta `noindex` → la demo non viene indicizzata ma resta apribile.

### Rollback
- La demo è statica e stateless (lato server): per il rollback ripubblicare il `dist/` della build precedente (o il commit precedente sull'host).
- Nessuna migrazione DB coinvolta in demo (dati in `localStorage` lato client).

---

## Analytics (traffico demo)

Integrato **Vercel Web Analytics** (`@vercel/analytics`, componente `<Analytics />` in `src/App.tsx`).
- Cookieless (nessun banner consenso), traccia le visite **per singola pagina** anche sulle route interne della SPA.
- Attivo **solo in produzione su Vercel**: in locale non invia dati.
- **Attivazione richiesta**: nel progetto Vercel → tab **Analytics → Enable Web Analytics**. Senza questo passaggio lo script non raccoglie dati.
- Dove leggere i dati: dashboard Vercel → **Analytics** (visite, visitatori unici, pagine più viste, provenienza, dispositivo).
- Piano gratuito (Hobby) sufficiente per una demo; possibile leggera sottostima per utenti con ad-blocker.

## Problemi noti / note

- Warning dev-only di React Router v7 in console: **non compaiono nella build di produzione**, innocui.
- Passaggio a produzione reale: impostare `VITE_APP_MODE=supabase` + credenziali, applicare `supabase/schema.sql`, migrare eventuali dati. Vedi `10_KOKORO_NEXT_STEPS.md` (versione cliente) per la narrazione.
- Bundle principale ~490 KB (gzip ~142 KB): adeguato per una demo; ottimizzazione code-splitting eventuale in fase produzione.
