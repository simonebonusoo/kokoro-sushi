export type AppMode = 'auto' | 'supabase' | 'demo';

/** Rileva se sono presenti credenziali Supabase valide (non placeholder/demo). */
const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';
const requestedMode = (import.meta.env.VITE_APP_MODE?.trim() ?? 'auto') as AppMode;

const looksValidUrl = /^https:\/\/.+\.supabase\.(co|in)/.test(url);
const looksValidKey = key.length > 30 && !/placeholder|demo/i.test(key);

export const appMode: AppMode = ['auto', 'supabase', 'demo'].includes(requestedMode)
  ? requestedMode
  : 'auto';

export const hasValidSupabaseCredentials = looksValidUrl && looksValidKey;

/** true = client Supabase reale, false = modalita demo locale. */
export const isSupabaseConfigured =
  appMode === 'supabase'
    ? hasValidSupabaseCredentials
    : appMode === 'auto' && hasValidSupabaseCredentials;

export const supabaseCreds = { url, key };
