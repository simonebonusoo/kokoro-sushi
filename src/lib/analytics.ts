import { track } from '@vercel/analytics';

/**
 * Eventi personalizzati per misurare l'interesse durante la demo.
 * `track` di Vercel è cookieless, sicuro da chiamare ovunque e no-op in locale:
 * i dati arrivano solo dalla produzione su Vercel (tab Analytics → Events).
 *
 * Nomi eventi centralizzati qui per coerenza e per non sparpagliare stringhe.
 */
export const analytics = {
  /** Click su una CTA "Prenota". `origine` indica da dove parte (navbar, home...). */
  prenotaCta: (origine: string) => track('prenota_cta', { origine }),

  /** Prenotazione completata con successo (conversione principale). */
  prenotazioneCompletata: (info: { area: string; persone: number }) =>
    track('prenotazione_completata', info),

  /** Il visitatore ha usato la ricerca nel menu digitale. */
  menuRicerca: () => track('menu_ricerca'),

  /** Apertura del menu mobile (engagement con la navigazione mobile). */
  menuMobileAperto: () => track('menu_mobile_aperto'),

  /** Accesso con un account demo. `ruolo` = cliente | ristoratore. */
  loginDemo: (ruolo: string) => track('login_demo', { ruolo }),
};
