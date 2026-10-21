import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase connection, configured from environment variables (see .env.example):
 *   VITE_SUPABASE_URL        e.g. https://abcd1234.supabase.co
 *   VITE_SUPABASE_ANON_KEY   the public anon / "publishable" key (never the service_role key)
 *
 * The client library is loaded on demand (when a guest submits the RSVP), so it adds nothing
 * to the initial page load.
 */

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

export const isSupabaseConfigured = () => !!url && !!anonKey;

let client: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured()) return Promise.reject(new Error('Supabase is not configured'));
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url, anonKey, {
      // The site never signs anyone in; it only inserts RSVPs.
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }),
  );
  return client;
}
