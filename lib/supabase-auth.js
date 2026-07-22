import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getAuthConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase Auth is not configured. Set SUPABASE_URL and a Supabase API key.');
  }
  return { url, key };
}

export async function createAuthClient() {
  const cookieStore = await cookies();
  const { url, key } = getAuthConfig();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => {
        try {
          items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies; proxy refreshes the session.
        }
      },
    },
  });
}

export function getPublicSupabaseConfig() {
  return getAuthConfig();
}
