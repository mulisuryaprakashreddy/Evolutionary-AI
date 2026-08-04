import { useMemo, useState, useEffect } from 'react';
import { SlidersHorizontal, X, MapPin, Star, ShieldCheck, Zap, Truck, Package } from 'lucide-react';
import { useStore } from '../store';
import { CATEGORIES, LISTINGS } from '../data';
import type { CategoryId } from '../types';
import { ListingGrid } from '../components/ListingGrid';
import { CategoryIcon } from '../components/CategoryIcon';

type Sort = 'relevance' | 'newest' | 'popular' | 'topRated' | 'lowPrice' | 'highPrice';

const SORTS: { id: Sort; label: string }[] = [
  { id: 'relevance', label: 'Most relevant' },
  { id: 'newest', label: 'Newest' },
  { id: 'popular', label: 'Most popular' },
  { id: 'topRated', label: 'Highest rated' },
  { id: 'lowPrice', label: 'Lowest price' },
  { id: 'highPrice', label: 'Highest price' },
];

export function BrowsePage() {
  const { route, navigate } = useStore();
  const initialCategory = route.name === 'browse' ? route.category : undefined;
  const initialQ = route.name === 'browse' ? route.q : undefined;

  const [q, setQ] = useState(initialQ || '');
  const [category, setCategory] = useState<CategoryId | 'all'>(initialCategory as CategoryId || 'all');
  const [sort, setSort] = useState<Sort>('relevance');
  const [maxPrice, setMaxPrice] = useState(200);
  const [minRating, setMinRating] = useState(0);
  const [delivery, setDelivery] = useState(false);
  const [pickup, setPickup] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const [verified, setVerified] = useState(false);
  const [instant, setInstant] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (route.name === 'browse') {
      setQ(route.q || '');
      setCategory((route.category as CategoryId) || 'all');
    }
  }, [route]);

  const results = useMemo(() => {
    let list = [...LISTINGS];
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter((l) =>
        l.name.toLowerCase().includes(term) ||
        l.brand.toLowerCase().includes(term) ||
        l.model.toLowerCase().includes(term) ||
        l.city.toLowerCase().includes(term) ||
        l.location.toLowerCase().includes(term) ||
        l.description.toLowerCase().includes(term)
      );
    }
    if (category !== 'all') list = list.filter((l) => l.category === category);
    list = list.filter((l) => l.priceDaily <= maxPrice);
    if (minRating > 0) list = list.filter((l) => l.rating >= minRating);
    if (delivery) list = list.filter((l) => l.delivery);
    if (pickup) list = list.filter((l) => l.pickup);
    if (insurance) list = list.filter((l) => l.insurance);
    if (verified) list = list.filter((l) => l.owner.verified);
    if (instant) list = list.filter((l) => l.instantBook);

    switch (sort) {
      case 'newest': list.sort((a, b) => Number(b.recentlyAdded) - Number(a.recentlyAdded) || b.year - a.year); break;
      case 'popular': list.sort((a, b) => b.reviewsCount - a.reviewsCount); break;
      case 'topRated': list.sort((a, b) => b.rating - a.rating); break;
      case 'lowPrice': list.sort((a, b) => a.priceDaily - b.priceDaily); break;
      case 'highPrice': list.sort((a, b) => b.priceDaily - a.priceDaily); break;
      default: list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
    }
    return list;
  }, [q, category, sort, maxPrice, minRating, delivery, pickup, insurance, verified, instant]);

  function clearAll() {
    setQ(''); setCategory('all'); setSort('relevance'); setMaxPrice(200); setMinRating(0);
    setDelivery(false); setPickup(false); setInsurance(false); setVerified(false); setInstant(false);
    navigate({ name: 'browse' });
  }

  const activeFilterCount = [delivery, pickup, insurance, verified, instant].filter(Boolean).length + (minRating > 0 ? 1 : 0) + (maxPrice < 200 ? 1 : 0);

  return (
    <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-app">Browse rentals</h1>
        <p className="mt-1 text-sm text-app-soft">{results.length} {results.length === 1 ? 'item' : 'items'} available to borrow{q ? ` for "${q}"` : ''}</p>
      </div>

      {/* Search bar */}
      <div className="mb-6 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, brand, or city..."
          className="input flex-1"
        />
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="btn-ghost relative lg:hidden"
          aria-label="Toggle filters"
        >
          <SlidersHorizontal size={18} /> Filters
          {activeFilterCount > 0 && <span className="ml-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-xs font-bold text-white">{activeFilterCount}</span>}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 overflow-auto bg-bg p-4 animate-fade-in' : 'hidden'} lg:static lg:block lg:w-64 lg:shrink-0`}>
          <div className="flex items-center justify-between lg:hidden">
            <h2 className="font-display text-lg font-bold">Filters</h2>
            <button onClick={() => setShowFilters(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-bg-soft"><X size={18} /></button>
          </div>

          <FilterGroup title="Category">
            <div className="space-y-1">
              <button
                onClick={() => setCategory('all')}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${category === 'all' ? 'bg-primary-tint font-semibold text-primary-soft' : 'text-app-soft hover:bg-bg-soft'}`}
              >
                <Package size={15} /> All categories
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${category === c.id ? 'bg-primary-tint font-semibold text-primary-soft' : 'text-app-soft hover:bg-bg-soft'}`}
                >
                  <CategoryIcon name={c.icon} className="h-4 w-4" /> {c.name}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Max daily price">
            <input type="range" min={5} max={200} step={5} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-primary" />
            <div className="mt-1 flex justify-between text-xs text-app-faint">
              <span>$5</span>
              <span className="font-semibold text-app">${maxPrice}/day</span>
            </div>
          </FilterGroup>

          <FilterGroup title="Minimum rating">
            <div className="flex gap-1.5">
              {[0, 3, 4, 4.5].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`chip ${minRating === r ? 'chip-active' : ''}`}
                >
                  {r === 0 ? 'Any' : <span className="inline-flex items-center gap-1"><Star size={12} className="text-amber-400" fill="currentColor" strokeWidth={0} /> {r}+</span>}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Features">
            <div className="space-y-2">
              <Toggle label="Delivery available" icon={Truck} checked={delivery} onChange={setDelivery} />
              <Toggle label="Pickup available" icon={MapPin} checked={pickup} onChange={setPickup} />
              <Toggle label="Insurance option" icon={ShieldCheck} checked={insurance} onChange={setInsurance} />
              <Toggle label="Verified owner" icon={ShieldCheck} checked={verified} onChange={setVerified} />
              <Toggle label="Instant booking" icon={Zap} checked={instant} onChange={setInstant} />
            </div>
          </FilterGroup>

          {activeFilterCount > 0 && (
            <button onClick={clearAll} className="mt-4 w-full rounded-xl border border-app/15 py-2.5 text-sm font-semibold text-app-soft transition-colors hover:bg-bg-soft">
              Clear all filters
            </button>
          )}
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-sm text-app-faint">Sort by</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="input !w-auto !py-2 text-sm"
            >
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {results.length > 0 ? (
            <ListingGrid listings={results} />
          ) : (
            <div className="surface rounded-2xl p-12 text-center">
              <Package size={40} className="mx-auto text-app-faint" />
              <h3 className="mt-4 font-display text-lg font-bold text-app">No rentals match your filters</h3>
              <p className="mt-1 text-sm text-app-soft">Try widening your price range or clearing some filters.</p>
              <button onClick={clearAll} className="btn-ghost mt-4">Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 font-display text-sm font-bold text-app">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ label, icon: Icon, checked, onChange }: { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm text-app-soft transition-colors hover:bg-bg-soft">
      <span className="inline-flex items-center gap-2"><Icon size={15} /> {label}</span>
      <span className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-app/15'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </span>
    </button>
  );
}
