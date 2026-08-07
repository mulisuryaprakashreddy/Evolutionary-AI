import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Star, MapPin, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Badge, Avatar, StarRating, EmptyState, Button } from '@/components/ui';
import { formatCurrency, truncate } from '@/lib/utils';
import type { Profile, FreelancerProfile, Category } from '@/lib/types';

interface FreelancerRow {
  profile: Profile;
  fp: FreelancerProfile;
  avgRating: number;
  reviewCount: number;
}

export function BrowseFreelancers() {
  const [freelancers, setFreelancers] = useState<FreelancerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase
        .from('freelancer_profiles')
        .select('*, profile:profiles!freelancer_profiles_user_id_fkey(*)')
        .order('created_at', { ascending: false });
      if (level) query = query.eq('experience_level', level);
      const { data } = await query;
      let rows: FreelancerRow[] = ((data as (FreelancerProfile & { profile: Profile })[]) ?? []).map((item) => ({
        profile: item.profile,
        fp: item,
        avgRating: 0,
        reviewCount: 0,
      }));
      if (search) {
        rows = rows.filter((r) =>
          r.profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
          r.fp.title.toLowerCase().includes(search.toLowerCase())
        );
      }
      const reviews = await supabase
        .from('reviews')
        .select('reviewee_id, rating')
        .in('reviewee_id', rows.map((r) => r.profile.id));
      const ratingMap = new Map<string, { sum: number; count: number }>();
      (reviews.data ?? []).forEach((r: { reviewee_id: string; rating: number }) => {
        const cur = ratingMap.get(r.reviewee_id) ?? { sum: 0, count: 0 };
        cur.sum += r.rating;
        cur.count += 1;
        ratingMap.set(r.reviewee_id, cur);
      });
      rows = rows.map((r) => {
        const info = ratingMap.get(r.profile.id);
        return { ...r, avgRating: info ? info.sum / info.count : 0, reviewCount: info?.count ?? 0 };
      });
      setFreelancers(rows);
      setLoading(false);
    }
    load();
  }, [search, level]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-[var(--font-display)]">Find Freelancers</h1>
        <p className="text-sm text-neutral-500 mt-1">Browse top talent across all categories</p>
      </div>

      <Card className="p-4 mb-6">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or title..."
              className="w-full h-10 rounded-lg border border-neutral-300 bg-white pl-9 pr-3 text-sm dark:border-neutral-700 dark:bg-neutral-900 focus:border-primary-500 focus:outline-none"
            />
          </div>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-900 focus:border-primary-500 focus:outline-none">
            <option value="">All levels</option>
            <option value="Entry">Entry</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-900 focus:border-primary-500 focus:outline-none">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />)}
        </div>
      ) : freelancers.length === 0 ? (
        <EmptyState icon={Users} title="No freelancers found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {freelancers.map((f) => (
            <Link key={f.profile.id} to={`/freelancers/${f.profile.id}`}>
              <Card className="p-5 h-full hover:shadow-md transition-all hover:border-primary-300 dark:hover:border-primary-700">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={f.profile.full_name} src={f.profile.avatar_url} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{f.profile.full_name}</p>
                    <p className="text-sm text-neutral-500 truncate">{f.fp.title}</p>
                    {f.profile.location && (
                      <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {f.profile.location}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                  {truncate(f.profile.bio || 'No bio available', 100)}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Badge color={f.fp.experience_level === 'Expert' ? 'accent' : 'neutral'}>{f.fp.experience_level}</Badge>
                    {f.reviewCount > 0 && <StarRating rating={f.avgRating} size="sm" showValue />}
                  </div>
                  <span className="text-sm font-semibold text-primary-600">{formatCurrency(f.fp.hourly_rate)}/hr</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
