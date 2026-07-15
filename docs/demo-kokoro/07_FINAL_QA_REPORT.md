# 07 · Final QA Report — Kokoro Sushi Roma

> **INTERNO / BNS STUDIO.** Report reale della sessione di QA pre-demo.
> Data: 2026-07-16 · Ambiente: dev server locale (Vite) + build di produzione.

---

## 1. Controlli effettuati

- Analisi completa del repository (framework, route, layout, auth, dipendenze Supabase, dati mock, env, deploy).
- Sweep contenuti: nessun `lorem ipsum`, TODO/FIXME, nomi template o riferimenti sviluppatore visibili all'utente. Tutti i "placeholder" trovati sono legittimi hint di input.
- Navigazione: navbar desktop, menu mobile, logo, CTA, footer, link telefono/email/Instagram/WhatsApp/Maps.
- Responsive: verificato a 375px (mobile) e 1280px (desktop); nessun overflow orizzontale (`scrollWidth == innerWidth`).
- Console: nessun errore JS. Solo warning dev-only di React Router v7 (assenti in produzione).
- Flussi end-to-end guidati nel browser: login demo, prenotazione completa, menu digitale, menu mobile.

---

## 2. Bug trovati e corretti

| # | Severità | Problema | Fix |
|---|---|---|---|
| 1 | **Alta** | In demo, "Password dimenticata?" chiamava `supabase.auth.resetPasswordForEmail`, **assente** nel client locale → TypeError davanti al cliente. | Aggiunto metodo `resetPasswordForEmail` a `localClient` (esito positivo, nessun invio). |
| 2 | **Media** | Menu digitale: piatti con flag + badge omonimo mostravano tag duplicati (es. "Vegetariano" due volte). | `MenuItemCard` ora deduplica i tag (case-insensitive). |
| 3 | **Media** | Stesso duplicato nel pannello admin (CMS menu), visibile al ristoratore. | `AdminMenu` non mostra il badge se coincide con un flag già presente. |
| 4 | **Bassa** | Footer: link `tel:` conteneva uno spazio (`tel:06 89341555`). | Spazi rimossi dal numero nel link. |

---

## 3. Migliorie applicate (P0/P1 richieste)

- **Menu mobile ridisegnato** (full-height editoriale) — vedi `README` interno e output finale.
- **Accesso demo** su `/login`: riquadro con credenziali e compilazione rapida (solo in demo).
- **SEO/condivisione**: `og:site_name`, `og:url`, `og:image:alt`, tag Twitter, `theme-color`, `viewport-fit=cover`; `noindex` + `robots.txt Disallow` per la demo.
- **Deploy**: `vercel.json`, `public/_redirects`, `.env.production` (`VITE_APP_MODE=demo`), `.gitignore`.

---

## 4. Test eseguiti (comandi)

| Comando | Esito |
|---|---|
| `npx tsc -b` (typecheck) | ✅ exit 0 |
| `npm run lint` (ESLint) | ✅ exit 0, 0 warning |
| `npm run build` (produzione) | ✅ exit 0, build in ~1.4s |

> Nota: il progetto **non ha una test suite automatica** (`package.json` non definisce `test`). La verifica funzionale è stata fatta manualmente nel browser (sotto).

---

## 5. Funzionalità testate nel browser (mobile 375px)

| Flusso | Esito |
|---|---|
| Home render + hero + CTA | ✅ |
| Menu mobile: apertura, brand header, nav grande, azioni secondarie, footer contatto | ✅ |
| Menu mobile: chiusura su selezione voce, scroll-lock, stato loggato/non loggato | ✅ |
| Login demo (admin) → redirect dashboard | ✅ |
| Menu digitale: categorie, prezzi, allergeni, tag (no duplicati) | ✅ |
| Prenotazione: data → orario (slot calcolati) → dati → conferma con riferimento | ✅ |
| Nessun overflow orizzontale | ✅ |
| Console senza errori | ✅ |

Build di produzione verificata: `noindex` presente, `og:url` = dominio demo, `_redirects` copiato in `dist/`, bundle in modalità demo.

---

## 6. Stato finale

| Voce | Stato |
|---|---|
| Typecheck | ✅ pass |
| Lint | ✅ pass |
| Build produzione | ✅ pass |
| Menu mobile redesign | ✅ completato |
| Login demo | ✅ funzionante |
| Prenotazione demo | ✅ funzionante end-to-end |
| Console errors | ✅ nessuno |
| Responsive mobile/desktop | ✅ ok |

---

## 7. Problemi residui / note (non bloccanti)

- **Warning React Router v7** in console **solo in dev** — assenti in produzione. Severità: trascurabile.
- **Persistenza demo per-dispositivo**: dati in `localStorage`, non condivisi tra telefono e MacBook. È il comportamento atteso della demo; da spiegare solo se il cliente lo chiede.
- **Bundle ~490 KB** (gzip ~142 KB): ok per demo; eventuale code-splitting in fase produzione.
- Nessuna test suite automatica: valutare l'aggiunta in fase di progetto reale (non pre-demo).

---

## 8. Cose da fare prima di domani

- [ ] Deploy della build corrente su `demo.kokoro.bnsstudio.it` con fallback SPA attivo.
- [ ] Test finale del dominio pubblico da **smartphone reale** (menu mobile + prenotazione).
- [ ] Verifica anteprima link (WhatsApp/Telegram) dopo il deploy.
- [ ] Generare QR del dominio finale.

---

## GO / NO-GO (lato applicazione)

**GO** — l'applicazione è stabile, i flussi P0 (apertura, mobile, menu mobile, login demo, prenotazione demo) funzionano senza errori. L'unico prerequisito non tecnico rimasto è il **deploy sul dominio pubblico** e il test finale da smartphone reale (checklist sopra).
