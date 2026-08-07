import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, Briefcase, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Badge, Button, Input, Select, EmptyState } from '@/components/ui';
import { formatCurrency, timeAgo, truncate, daysUntil } from '@/lib/utils';
import type { Category, Project, Profile, Skill } from '@/lib/types';

const PAGE_SIZE = 9;

interface ProjectRow extends Project {
  category?: Category | null;
  client?: Profile | null;
  skills?: Skill[];
  proposal_count?: number;
}

export function BrowseProjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const search = searchParams.get('q') ?? '';
  const categorySlug = searchParams.get('category') ?? '';
  const experience = searchParams.get('level') ?? '';
  const projectType = searchParams.get('type') ?? '';
  const minBudget = searchParams.get('min') ?? '';
  const maxBudget = searchParams.get('max') ?? '';

  const updateParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
    setPage(0);
  }, [searchParams, setSearchParams]);

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setPage(0);
  };

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories((data as Category[]) ?? []));
    supabase.from('skills').select('*').order('name').then(({ data }) => setSkills((data as Skill[]) ?? []));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase
        .from('projects')
        .select('*, category:categories(*), client:profiles!projects_client_id_fkey(*), skills:skills(*)', { count: 'exact' })
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      if (categorySlug) {
        const cat = categories.find((c) => c.slug === categorySlug);
        if (cat) query = query.eq('category_id', cat.id);
      }
      if (experience) query = query.eq('experience_level', experience);
      if (projectType) query = query.eq('project_type', projectType);
      if (minBudget) query = query.gte('budget_max', Number(minBudget));
      if (maxBudget) query = query.lte('budget_min', Number(maxBudget));

      const { data, count } = await query;
      setProjects((data as ProjectRow[]) ?? []);
      setTotal(count ?? 0);
      setLoading(false);
    }
    if (categories.length > 0 || !categorySlug) load();
    else if (categories.length === 0) load();
  }, [search, categorySlug, experience, projectType, minBudget, maxBudget, page, categories]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = search || categorySlug || experience || projectType || minBudget || maxBudget;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-[var(--font-display)]">Browse Projects</h1>
        <p className="text-sm text-neutral-500 mt-1">{total} projects available</p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Filters */}
        <aside className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  value={search}
                  onChange={(e) => updateParam('q', e.target.value)}
                  placeholder="Keywords..."
                  className="w-full h-9 rounded-lg border border-neutral-300 bg-white pl-9 pr-3 text-sm dark:border-neutral-700 dark:bg-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Category</label>
              <select
                value={categorySlug}
                onChange={(e) => updateParam('category', e.target.value)}
                className="w-full h-9 rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 focus:border-primary-500 focus:outline-none"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Experience Level</label>
              <select
                value={experience}
                onChange={(e) => updateParam('level', e.target.value)}
                className="w-full h-9 rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 focus:border-primary-500 focus:outline-none"
              >
                <option value="">Any level</option>
                <option value="Entry">Entry</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Project Type</label>
              <select
                value={projectType}
                onChange={(e) => updateParam('type', e.target.value)}
                className="w-full h-9 rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 focus:border-primary-500 focus:outline-none"
              >
                <option value="">Any type</option>
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Min $</label>
                <input
                  type="number"
                  value={minBudget}
                  onChange={(e) => updateParam('min', e.target.value)}
                  placeholder="0"
                  className="w-full h-9 rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Max $</label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => updateParam('max', e.target.value)}
                  placeholder="∞"
                  className="w-full h-9 rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </Card>
        </aside>

        {/* Results */}
        <div>
          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No projects found"
              description={hasFilters ? "Try adjusting your filters to see more results." : "Be the first to post a project!"}
              action={!hasFilters ? <Link to="/projects/new"><Button>Post a Project</Button></Link> : <Button variant="outline" onClick={clearFilters}>Clear filters</Button>}
            />
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {projects.map((p) => {
                  const days = daysUntil(p.deadline);
                  return (
                    <Link key={p.id} to={`/projects/${p.id}`}>
                      <Card className="p-5 h-full hover:shadow-md transition-all hover:border-primary-300 dark:hover:border-primary-700">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {p.category && <Badge color="primary">{p.category.name}</Badge>}
                            {p.experience_level && <Badge>{p.experience_level}</Badge>}
                          </div>
                          <span className="text-xs text-neutral-400 shrink-0">{timeAgo(p.created_at)}</span>
                        </div>
                        <h3 className="font-semibold text-base mb-2">{p.title}</h3>
                        <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{truncate(p.description, 140)}</p>
                        {p.skills && p.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {p.skills.slice(0, 4).map((s) => (
                              <span key={s.id} className="text-xs px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                          <div>
                            <p className="font-semibold text-primary-600">
                              {formatCurrency(p.budget_min)}
                              {p.budget_max > p.budget_min && ` - ${formatCurrency(p.budget_max)}`}
                            </p>
                            <p className="text-xs text-neutral-400 capitalize">{p.project_type}</p>
                          </div>
                          <div className="text-right text-xs text-neutral-500">
                            {p.deadline && (
                              <p className={days && days < 3 ? 'text-warning-600 font-medium' : ''}>
                                {days && days > 0 ? `${days}d left` : 'Past due'}
                              </p>
                            )}
                            <p>{p.proposal_count ?? 0} proposals</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <span className="text-sm text-neutral-500">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
