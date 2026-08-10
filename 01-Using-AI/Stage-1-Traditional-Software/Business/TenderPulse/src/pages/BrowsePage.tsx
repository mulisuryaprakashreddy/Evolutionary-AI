import { useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, MapPin, Building } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Tender, Category } from '../lib/types'
import TenderCard, { TenderCardSkeleton } from '../components/TenderCard'
import { suggestKeywords } from '../lib/ai'

const SORTS = [
  { v: 'latest', label: 'Latest' },
  { v: 'budget_high', label: 'Highest Budget' },
  { v: 'deadline', label: 'Closing Soon' },
  { v: 'popular', label: 'Most Popular' },
]

const PER_PAGE = 9

export default function BrowsePage() {
  const [params, setParams] = useSearchParams()
  const [tenders, setTenders] = useState<Tender[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showSuggest, setShowSuggest] = useState(false)

  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const state = params.get('state') ?? ''
  const industry = params.get('industry') ?? ''
  const ministry = params.get('ministry') ?? ''
  const status = params.get('status') ?? 'open'
  const sort = params.get('sort') ?? 'latest'
  const page = parseInt(params.get('page') ?? '1')

  const setParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }, [params, setParams])

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories((data as Category[]) ?? []))
  }, [])

  useEffect(() => {
    setLoading(true)
    let query = supabase.from('tenders').select('*, category:categories(*)')
    if (status) query = query.eq('status', status)
    if (category) {
      const cat = categories.find((c) => c.slug === category)
      if (cat) query = query.eq('category_id', cat.id)
    }
    if (state) query = query.ilike('state', `%${state}%`)
    if (industry) query = query.ilike('industry', `%${industry}%`)
    if (ministry) query = query.ilike('ministry', `%${ministry}%`)
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,organization.ilike.%${q}%,tender_number.ilike.%${q}%`)
    }
    switch (sort) {
      case 'budget_high': query = query.order('budget', { ascending: false }); break
      case 'deadline': query = query.order('closing_date', { ascending: true }); break
      case 'popular': query = query.order('view_count', { ascending: false }); break
      default: query = query.order('created_at', { ascending: false })
    }
    query.range((page - 1) * PER_PAGE, page * PER_PAGE - 1).then(({ data }) => {
      setTenders((data as Tender[]) ?? [])
      setLoading(false)
    })
  }, [q, category, state, industry, ministry, status, sort, page, categories])

  const suggestions = useMemo(() => suggestKeywords(q, tenders), [q, tenders])

  const activeFilters = [category, state, industry, ministry].filter(Boolean).length

  const clearAll = () => setParams(new URLSearchParams())

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Browse Tenders</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Find government opportunities that match your business</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          value={q}
          onChange={(e) => setParam('q', e.target.value)}
          onFocus={() => setShowSuggest(true)}
          onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
          placeholder="Search by keyword, organization, tender number..."
          className="input pl-12 py-3 text-base"
        />
        {showSuggest && suggestions.length > 0 && q && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-slide-down dark:border-slate-800 dark:bg-slate-900">
            {suggestions.map((s) => (
              <button
                key={s}
                onMouseDown={() => setParam('q', s)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Search size={14} className="text-slate-400" /> {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto bg-white p-5 transition-transform lg:static lg:z-0 lg:w-64 lg:flex-shrink-0 lg:translate-x-0 lg:bg-transparent lg:p-0 dark:bg-slate-950 lg:dark:bg-transparent ${
          showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex items-center justify-between lg:hidden">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="btn-ghost p-1.5"><X size={18} /></button>
          </div>

          <div className="space-y-5 lg:mt-0">
            <FilterGroup label="Category">
              <select value={category} onChange={(e) => setParam('category', e.target.value)} className="input">
                <option value="">All categories</option>
                {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </FilterGroup>

            <FilterGroup label="State">
              <input type="text" value={state} onChange={(e) => setParam('state', e.target.value)} className="input" placeholder="e.g. Maharashtra" />
            </FilterGroup>

            <FilterGroup label="Industry">
              <input type="text" value={industry} onChange={(e) => setParam('industry', e.target.value)} className="input" placeholder="e.g. IT & Software" />
            </FilterGroup>

            <FilterGroup label="Ministry">
              <input type="text" value={ministry} onChange={(e) => setParam('ministry', e.target.value)} className="input" placeholder="e.g. Health" />
            </FilterGroup>

            <FilterGroup label="Status">
              <div className="flex flex-wrap gap-2">
                {['open', 'closed', 'awarded'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setParam('status', status === s ? '' : s)}
                    className={`badge capitalize ${status === s ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="Sort by">
              <select value={sort} onChange={(e) => setParam('sort', e.target.value)} className="input">
                {SORTS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
              </select>
            </FilterGroup>

            {activeFilters > 0 && (
              <button onClick={clearAll} className="btn-secondary w-full text-xs">Clear all filters</button>
            )}
          </div>
        </aside>

        {showFilters && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setShowFilters(false)} />}

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loading ? 'Searching...' : `${tenders.length} tender${tenders.length !== 1 ? 's' : ''} found`}
            </p>
            <button onClick={() => setShowFilters(true)} className="btn-secondary py-2 lg:hidden">
              <SlidersHorizontal size={16} /> Filters {activeFilters > 0 && `(${activeFilters})`}
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <TenderCardSkeleton key={i} />)}
            </div>
          ) : tenders.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <Search className="mb-3 text-slate-300 dark:text-slate-700" size={40} />
              <h3 className="font-semibold text-slate-900 dark:text-white">No tenders found</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters</p>
              {activeFilters > 0 && <button onClick={clearAll} className="btn-secondary mt-4 text-xs">Clear filters</button>}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {tenders.map((t) => <TenderCard key={t.id} tender={t} />)}
              </div>
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setParam('page', String(page - 1))}
                  disabled={page <= 1}
                  className="btn-secondary px-3 py-2 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 text-sm font-medium text-slate-600 dark:text-slate-300">Page {page}</span>
                <button
                  onClick={() => setParam('page', String(page + 1))}
                  disabled={tenders.length < PER_PAGE}
                  className="btn-secondary px-3 py-2 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}
