import { getSupabaseServer } from '@/lib/supabase-server';
import type { Listing } from '@/lib/types';

const SELECT = `*,
  profiles:donor_id (full_name, organization_name, is_verified)`;

export async function getListings(params: {
  q?: string;
  category?: string;
  condition?: string;
  donationType?: string;
  status?: string;
  country?: string;
  city?: string;
  shipping?: boolean;
  pickup?: boolean;
  sort?: string;
  limit?: number;
}): Promise<Listing[]> {
  const {
    q, category, condition, donationType, status, country, city, shipping, pickup, sort, limit,
  } = params;
  const supabaseServer = getSupabaseServer();
  let query = supabaseServer.from('listings').select(SELECT);

  if (q) {
    query = query.or(`equipment_name.ilike.%${q}%,description.ilike.%${q}%,city.ilike.%${q}%,country.ilike.%${q}%`);
  }
  if (category) query = query.eq('category', category);
  if (condition) query = query.eq('condition', condition);
  if (donationType) query = query.eq('donation_type', donationType);
  if (status) query = query.eq('status', status);
  else query = query.neq('status', 'unavailable');
  if (country) query = query.ilike('country', `%${country}%`);
  if (city) query = query.ilike('city', `%${city}%`);
  if (shipping) query = query.eq('shipping_available', true);
  if (pickup) query = query.eq('pickup_available', true);

  switch (sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'name':
      query = query.order('equipment_name', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Listing[];
}

export async function getListing(id: string): Promise<Listing | null> {
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from('listings')
    .select(SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Listing | null;
}

export async function getSimilarListings(listing: Listing, limit = 4): Promise<Listing[]> {
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from('listings')
    .select(SELECT)
    .eq('category', listing.category)
    .neq('id', listing.id)
    .neq('status', 'unavailable')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as Listing[];
}

export async function getUserListings(userId: string): Promise<Listing[]> {
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from('listings')
    .select(SELECT)
    .eq('donor_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Listing[];
}

export async function getRecentListings(limit = 8): Promise<Listing[]> {
  const supabaseServer = getSupabaseServer();
  const { data, error } = await supabaseServer
    .from('listings')
    .select(SELECT)
    .neq('status', 'unavailable')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as Listing[];
}

export async function getStats(): Promise<{
  shared: number;
  active: number;
  donors: number;
  countries: number;
}> {
  const supabaseServer = getSupabaseServer();
  const { count: active } = await supabaseServer
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'unavailable');
  const { count: shared } = await supabaseServer
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .in('status', ['donated', 'loaned', 'returned']);
  const { count: donors } = await supabaseServer
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  const { data: countries } = await supabaseServer
    .from('listings')
    .select('country')
    .neq('country', '');
  const uniqueCountries = new Set((countries || []).map((c) => c.country));
  return {
    shared: shared ?? 0,
    active: active ?? 0,
    donors: donors ?? 0,
    countries: uniqueCountries.size,
  };
}
