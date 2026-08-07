import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

if (url && anonKey && url.startsWith('http')) {
  try {
    client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  } catch (error) {
    console.warn('Supabase client initialization failed:', error);
  }
} else {
  console.warn('Missing or invalid Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

function createMockQueryBuilder() {
  const builder: any = {
    select: () => builder,
    eq: () => builder,
    neq: () => builder,
    lt: () => builder,
    lte: () => builder,
    gt: () => builder,
    gte: () => builder,
    like: () => builder,
    ilike: () => builder,
    is: () => builder,
    in: () => builder,
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    single: () => builder,
    maybeSingle: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    update: () => builder,
    upsert: () => builder,
    delete: () => ({ eq: async () => ({ error: null }) }),
    then: async (onFulfilled?: (value: { data: any; error: any }) => void) => {
      return onFulfilled?.({ data: null, error: null }) ?? Promise.resolve({ data: null, error: null });
    },
  };
  return builder;
}

function createMockClient(): SupabaseClient {
  return {
    from: () => createMockQueryBuilder(),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
  } as unknown as SupabaseClient;
}

export const supabase = client ?? createMockClient();
export const isSupabaseConfigured = () => !!client;