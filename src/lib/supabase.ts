import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Validates whether a string is a valid HTTP or HTTPS URL
 */
function isValidHttpUrl(urlString?: string | null): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return Boolean(parsed.hostname && (parsed.protocol === 'http:' || parsed.protocol === 'https:'));
  } catch {
    return false;
  }
}

/**
 * Validates whether a Supabase key looks like a valid anon/publishable key
 */
function isValidSupabaseKey(key?: string | null): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.includes('YOUR_') || trimmed.includes('MY_') || trimmed === 'placeholder') {
    return false;
  }
  return true;
}

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Fallback project URL and Key if valid
const defaultUrl = 'https://tjifvsblzydrvvoasrdg.supabase.co';
const defaultKey = 'sb_publishable_BrtuOuE7OwRBl6eKNIKMNw_-jwP4uko';

export const supabaseUrl: string = isValidHttpUrl(envUrl)
  ? envUrl!.trim()
  : (isValidHttpUrl(defaultUrl) ? defaultUrl : '');

export const supabasePublishableKey: string = isValidSupabaseKey(envKey)
  ? envKey!.trim()
  : (isValidSupabaseKey(defaultKey) ? defaultKey : '');

/**
 * Checks if Supabase has been supplied with a valid project URL and publishable (anon) key.
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    isValidHttpUrl(supabaseUrl) &&
    isValidSupabaseKey(supabasePublishableKey)
  );
};

function initSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    return createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.warn('Unable to initialize Supabase client:', error);
    return null;
  }
}

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = initSupabaseClient();
  }
  return clientInstance;
};

// Export active Supabase client instance if configured, or null for offline/local-first mode
export const supabase: SupabaseClient | null = initSupabaseClient();

