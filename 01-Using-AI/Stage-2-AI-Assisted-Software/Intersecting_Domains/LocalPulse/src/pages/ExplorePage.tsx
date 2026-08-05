import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X, ArrowBigUp, Clock, Flame, CheckCircle2, Camera, Video } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Report, Severity, ReportStatus } from '@/types';
import { ReportCard } from '@/components/ReportCard';
import { CATEGORIES, SEVERITIES, STATUSES } from '@/lib/constants';
import { EmptyState, Spinner } from '@/components/ui';

const SORTS = [
  { id: 'newest', label: 'Newest', icon: Clock },
  { id: 'votes', label: 'Most Upvoted', icon: ArrowBigUp },
  { id: 'urgent', label: 'Most Urgent', icon: Flame },
  { id: 'resolved', label: 'Recently Resolved', icon: CheckCircle2 },
] as const;

type SortId = typeof SORTS[number]['id'];

export function ExplorePage({ initialQuery = '' }: { initialQuery?: string }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortId>('newest');
  const [category, setCategory] = useState<string>('');
  const [severity, setSeverity] = useState<Severity | ''>('');
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [withPhotos, setWithPhotos] = useState(false);
  const [withVideos, setWithVideos] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    let q = supabase
      .from('reports')
      .select('*, profiles!reports_user_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (category) q = q.eq('category', category);
    if (severity) q = q.eq('severity', severity);
    if (status) q = q.eq('status', status);
    if (withPhotos) q = q.not('photos', 'eq', '{}');
    if (withVideos) q = q.not('video_url', 'is', null);
    if (query.trim()) {
      q = q.or(`title.ilike.%${query.trim()}%,description.ilike.%${query.trim()}%,city.ilike.%${query.trim()}%,village.ilike.%${query.trim()}%`);
    }
    q.then(({ data }) => {
      setReports((data as Report[]) ?? []);
      setLoading(false);
    });
  }, [category, severity, status, withPhotos, withVideos, query]);

  const sorted = useMemo(() => {
    const arr = [...reports];
    if (sort === 'votes') arr.sort((a, b) => b.votes_count - a.votes_count);
    else if (sort === 'urgent') {
      const w: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      arr.sort((a, b) => (w[b.severity] ?? 0) - (w[a.severity] ?? 0) || b.votes_count - a.votes_count);
    } else if (sort === 'resolved') {
      arr.sort((a, b) => {
        const ar = a.status === 'resolved' || a.status === 'closed' ? 1 : 0;
        const br = b.status === 'resolved' || b.status === 'closed' ? 1 : 0;
        if (br !== ar) return br - ar;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return arr;
  }, [reports, sort]);

  const activeFilters = (category ? 1 : 0) + (severity ? 1 : 0) + (status ? 1 : 0) + (withPhotos ? 1 : 0) + (withVideos ? 1 : 0);

  const clearAll = () => {
    setCategory(''); setSeverity(''); setStatus(''); setWithPhotos(false); setWithVideos(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Explore Community Problems</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search and filter reports from communities worldwide.</p>
      </div>

      {/* Search + sort */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword, city, village…"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                sort === s.id
                  ? 'bg-teal-600 text-white'
                  : 'border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              showFilters || activeFilters
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilters > 0 && <span className="ml-0.5 rounded-full bg-teal-500 px-1.5 text-xs text-white">{activeFilters}</span>}
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800 animate-in slide-in-from-bottom">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FilterGroup label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="select">
                <option value="">All categories</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </FilterGroup>
            <FilterGroup label="Severity">
              <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity | '')} className="select">
                <option value="">All severities</option>
                {SEVERITIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </FilterGroup>
            <FilterGroup label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as ReportStatus | '')} className="select">
                <option value="">All statuses</option>
                {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </FilterGroup>
            <FilterGroup label="Media">
              <div className="flex gap-4 pt-1">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={withPhotos} onChange={(e) => setWithPhotos(e.target.checked)} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-700" />
                  <Camera className="h-4 w-4" /> Photos
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={withVideos} onChange={(e) => setWithVideos(e.target.checked)} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-700" />
                  <Video className="h-4 w-4" /> Videos
                </label>
              </div>
            </FilterGroup>
          </div>
          {activeFilters > 0 && (
            <button onClick={clearAll} className="mt-4 inline-flex items-center gap-1 text-sm text-teal-600 hover:underline dark:text-teal-400">
              <X className="h-3.5 w-3.5" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {(category || severity || status) && (
        <div className="mb-5 flex flex-wrap gap-2">
          {category && <Chip label={category} onClear={() => setCategory('')} />}
          {severity && <Chip label={severity} onClear={() => setSeverity('')} />}
          {status && <Chip label={status.replace('_', ' ')} onClear={() => setStatus('')} />}
        </div>
      )}

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {loading ? 'Loading…' : `${sorted.length} report${sorted.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-teal-500" /></div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<Search className="h-10 w-10" />}
          title="No reports found"
          description="Try adjusting your search or filters to find community reports."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((r) => <ReportCard key={r.id} report={r} />)}
        </div>
      )}

      <style>{`.select{width:100%;border-radius:0.75rem;border:1px solid rgb(203 213 225);background:white;padding:0.5rem 0.75rem;font-size:0.875rem;outline:none;color:rgb(15 23 42)}.dark .select{border-color:rgb(51 65 85);background:rgb(30 41 59);color:white}.select:focus{border-color:rgb(20 184 166);box-shadow:0 0 0 2px rgba(20,184,166,0.2)}`}</style>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
      {label}
      <button onClick={onClear} className="hover:text-teal-900 dark:hover:text-teal-100"><X className="h-3 w-3" /></button>
    </span>
  );
}
